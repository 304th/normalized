import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { provisionForPlan } from "@/lib/cloud/provisioner";
import { getPlan } from "@/lib/plans";
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

function buildConnectionUrl(
  host: string,
  port: number,
  name: string,
  user: string,
  password: string
): string {
  return `postgresql://${user}:${encodeURIComponent(password)}@${host}:${port}/${name}`;
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

    // Add connection info to each project
    const projectsWithConnection = projects.map((project) => {
      let connection = null;
      if (
        project.provisionStatus === "ready" &&
        project.dbHost &&
        project.dbPort &&
        project.dbName &&
        project.dbUser &&
        project.dbPassword
      ) {
        connection = {
          host: project.dbHost,
          port: project.dbPort,
          database: project.dbName,
          user: project.dbUser,
          password: project.dbPassword,
          url: buildConnectionUrl(
            project.dbHost,
            project.dbPort,
            project.dbName,
            project.dbUser,
            project.dbPassword
          ),
        };
      }
      return {
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
        connection,
      };
    });

    return NextResponse.json({ projects: projectsWithConnection });
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

    const { name, description, region = "ru-msk", planId = "free" } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "Неизвестный тариф" }, { status: 400 });
    }

    const slug = generateSlug(name);

    // Create project record first (pending status)
    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        region,
        planId,
        dbSizeMb: plan.dbSizeMb,
        storageMb: plan.storageMb,
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
    provisionForPlan({
      projectId: project.id,
      projectSlug: slug,
      planId,
      region,
    }).catch((err) => {
      console.error(`Failed to provision db for ${project.id}:`, err);
      prisma.project.update({
        where: { id: project.id },
        data: { provisionStatus: "error" },
      }).catch(console.error);
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
