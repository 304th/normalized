import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getPlan, canUpgrade } from "@/lib/plans";
import { migrateSharedToDedicated, resizeDedicated } from "@/lib/cloud/migrations";
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
    const currentPlan = getPlan(project.planId);
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

    // Determine migration path
    const isFromShared = currentPlan?.isShared && project.sharedClusterId;
    const isToDedicated = !newPlan.isShared;

    if (isFromShared && isToDedicated) {
      // Shared (Free/Starter) → Dedicated (Pro/Business): migrate cluster
      migrateSharedToDedicated(project.id, planId)
        .catch((err) => console.error(`Migration failed for ${id}:`, err));
    } else if (project.cloudExternalId) {
      // Paid → Higher Paid: resize existing cluster
      resizeDedicated(project.id, planId)
        .catch((err) => console.error(`Resize failed for ${id}:`, err));
    } else {
      return NextResponse.json(
        { error: "База данных не создана" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Обновление тарифа запущено"
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
