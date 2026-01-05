import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCloudProvider } from "@/lib/cloud";
import { NextResponse } from "next/server";
import crypto from "crypto";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}

function generateApiKey(): string {
  return `nrm_${crypto.randomBytes(24).toString("hex")}`;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.userId },
      include: { apiKeys: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { name, description, region = "ru-msk" } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    const slug = generateSlug(name);

    // Create project record first (pending status)
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        region,
        provisionStatus: "provisioning",
        userId: session.userId,
        apiKeys: {
          create: {
            name: "default",
            key: generateApiKey(),
          },
        },
      },
      include: { apiKeys: true },
    });

    // Provision database async (don't block response)
    provisionDatabase(project.id, { name: slug, region }).catch((err) => {
      console.error(`Failed to provision db for ${project.id}:`, err);
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

async function provisionDatabase(
  projectId: string,
  config: { name: string; region: string }
) {
  try {
    const provider = getCloudProvider();
    const result = await provider.createDatabase(projectId, config);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        cloudProvider: provider.name,
        cloudExternalId: result.externalId,
        provisionStatus: result.status,
        dbHost: result.credentials?.host,
        dbPort: result.credentials?.port,
        dbName: result.credentials?.name,
        dbUser: result.credentials?.user,
        dbPassword: result.credentials?.password,
      },
    });
  } catch (error) {
    console.error("Provision error:", error);
    await prisma.project.update({
      where: { id: projectId },
      data: { provisionStatus: "error" },
    });
  }
}
