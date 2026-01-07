import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TimewebCloudProvider } from "@/lib/cloud/timeweb";
import { NextResponse } from "next/server";

function getProvider(): TimewebCloudProvider {
  return new TimewebCloudProvider({
    apiToken: process.env.TIMEWEB_API_TOKEN!,
  });
}

function generateBucketName(projectSlug: string, name: string): string {
  const safe = name.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 32);
  return `${projectSlug}-${safe}`;
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId обязателен" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Проект не найден" },
        { status: 404 }
      );
    }

    const buckets = await prisma.bucket.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      buckets: buckets.map((b) => ({
        id: b.id,
        name: b.name,
        isPublic: b.isPublic,
        maxFileSizeMb: b.maxFileSizeMb,
        allowedMimes: b.allowedMimes,
        sizeBytes: b.sizeBytes.toString(),
        fileCount: b.fileCount,
        createdAt: b.createdAt,
      })),
    });
  } catch (error) {
    console.error("List buckets error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { projectId, name, isPublic = false, maxFileSizeMb, allowedMimes = [] } = await req.json();

    if (!projectId || !name) {
      return NextResponse.json(
        { error: "projectId и name обязательны" },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.userId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Проект не найден" },
        { status: 404 }
      );
    }

    // Check if bucket name already exists for this project
    const existing = await prisma.bucket.findUnique({
      where: { projectId_name: { projectId, name } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bucket с таким именем уже существует" },
        { status: 400 }
      );
    }

    // Create bucket in Timeweb
    const provider = getProvider();
    const bucketName = generateBucketName(project.slug, name);

    const result = await provider.createBucket(bucketName, isPublic);

    // Save bucket to database
    const bucket = await prisma.bucket.create({
      data: {
        name,
        isPublic,
        maxFileSizeMb: maxFileSizeMb || null,
        allowedMimes,
        timewebBucketId: result.bucketId,
        accessKey: result.accessKey,
        secretKey: result.secretKey,
        endpoint: result.endpoint,
        projectId,
      },
    });

    return NextResponse.json({
      bucket: {
        id: bucket.id,
        name: bucket.name,
        isPublic: bucket.isPublic,
        maxFileSizeMb: bucket.maxFileSizeMb,
        allowedMimes: bucket.allowedMimes,
        sizeBytes: "0",
        fileCount: 0,
        createdAt: bucket.createdAt,
      },
    });
  } catch (error) {
    console.error("Create bucket error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
