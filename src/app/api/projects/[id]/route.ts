import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";

function buildConnectionUrl(
  host: string,
  port: number,
  name: string,
  user: string,
  password: string
): string {
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
      where: { id, userId: session.userId },
      include: { apiKeys: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Проект не найден" },
        { status: 404 }
      );
    }

    // Build connection info if credentials exist
    let connectionUrl: string | null = null;
    if (project.dbHost && project.dbPort && project.dbName && project.dbUser && project.dbPassword) {
      connectionUrl = buildConnectionUrl(
        project.dbHost,
        project.dbPort,
        project.dbName,
        project.dbUser,
        project.dbPassword
      );
    }

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        region: project.region,
        planId: project.planId,
        dbSizeMb: project.dbSizeMb,
        storageMb: project.storageMb,
        provisionStatus: project.provisionStatus,
        createdAt: project.createdAt,
        apiKeys: project.apiKeys,
        // Connection info (only if ready)
        connection: project.provisionStatus === "ready" ? {
          host: project.dbHost,
          port: project.dbPort,
          database: project.dbName,
          user: project.dbUser,
          password: project.dbPassword,
          url: connectionUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
