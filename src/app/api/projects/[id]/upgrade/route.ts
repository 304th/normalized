import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCloudProvider } from "@/lib/cloud";
import { getPlan, canUpgrade } from "@/lib/plans";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "planId обязателен" },
        { status: 400 }
      );
    }

    // Find project
    const project = await prisma.project.findFirst({
      where: { id, userId: session.userId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Проект не найден" },
        { status: 404 }
      );
    }

    // Validate plan upgrade
    const newPlan = getPlan(planId);
    if (!newPlan) {
      return NextResponse.json(
        { error: "Тариф не найден" },
        { status: 400 }
      );
    }

    if (!canUpgrade(project.planId, planId)) {
      return NextResponse.json(
        { error: "Нельзя понизить тариф" },
        { status: 400 }
      );
    }

    // Check if project is ready for upgrade
    if (project.provisionStatus !== "ready") {
      return NextResponse.json(
        { error: "Проект не готов к обновлению" },
        { status: 400 }
      );
    }

    if (!project.cloudExternalId) {
      return NextResponse.json(
        { error: "База данных не создана" },
        { status: 400 }
      );
    }

    // Update status to upgrading
    await prisma.project.update({
      where: { id },
      data: { provisionStatus: "upgrading" },
    });

    // Trigger resize async
    upgradeDatabase(project.id, project.cloudExternalId, newPlan.timewebPresetId, planId)
      .catch((err) => console.error(`Upgrade failed for ${id}:`, err));

    return NextResponse.json({
      success: true,
      message: "Обновление тарифа запущено"
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

async function upgradeDatabase(
  projectId: string,
  externalId: string,
  presetId: number,
  planId: string
) {
  try {
    const provider = getCloudProvider();
    const status = await provider.resizeDatabase(externalId, presetId);

    const plan = getPlan(planId)!;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        provisionStatus: status === "upgrading" ? "upgrading" : "ready",
        planId,
        cloudPresetId: presetId,
        dbSizeMb: plan.dbSizeMb,
        storageMb: plan.storageMb,
      },
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    await prisma.project.update({
      where: { id: projectId },
      data: { provisionStatus: "error" },
    });
  }
}
