import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
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

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
    }

    const slug = generateSlug(name);

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
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

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
