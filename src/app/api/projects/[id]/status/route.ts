import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { checkProvisionStatus } from "@/lib/cloud/provisioner";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/projects/[id]/status
 * Check and return current provisioning status.
 * Frontend should poll this until status is 'ready' or 'error'.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { userId: true, provisionStatus: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Проект не найден" }, { status: 404 });
    }

    if (project.userId !== session.userId) {
      return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
    }

    // Check and update status if still provisioning
    const status = await checkProvisionStatus(id);

    return NextResponse.json({ status });
  } catch (error) {
    console.error("Check status error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
