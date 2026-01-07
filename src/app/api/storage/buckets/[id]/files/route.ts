import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StorageClient } from "@/lib/cloud/storage";
import { NextResponse } from "next/server";

async function getBucketWithAuth(bucketId: string, userId: string) {
  const bucket = await prisma.bucket.findUnique({
    where: { id: bucketId },
    include: { project: true },
  });

  if (!bucket || bucket.project.userId !== userId) {
    return null;
  }

  return bucket;
}

function getStorageClient(bucket: {
  accessKey: string | null;
  secretKey: string | null;
  name: string;
}) {
  if (!bucket.accessKey || !bucket.secretKey) {
    throw new Error("Bucket credentials not available");
  }
  return new StorageClient(bucket.accessKey, bucket.secretKey, bucket.name);
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
    const { searchParams } = new URL(req.url);
    const prefix = searchParams.get("prefix") || undefined;

    const bucket = await getBucketWithAuth(id, session.userId);
    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket не найден" },
        { status: 404 }
      );
    }

    const client = getStorageClient(bucket);
    const files = await client.list(prefix);

    return NextResponse.json({
      files: files.map((f) => ({
        key: f.key,
        size: f.size,
        lastModified: f.lastModified.toISOString(),
        url: bucket.isPublic
          ? client.getPublicUrl(f.key)
          : null,
      })),
    });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

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

    const bucket = await getBucketWithAuth(id, session.userId);
    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket не найден" },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = (formData.get("path") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "Файл обязателен" },
        { status: 400 }
      );
    }

    // Validate file size
    if (bucket.maxFileSizeMb && file.size > bucket.maxFileSizeMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `Файл превышает лимит ${bucket.maxFileSizeMb} MB` },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (bucket.allowedMimes.length > 0 && !bucket.allowedMimes.includes(file.type)) {
      return NextResponse.json(
        { error: `Тип файла ${file.type} не разрешён` },
        { status: 400 }
      );
    }

    const client = getStorageClient(bucket);
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = path ? `${path}/${file.name}` : file.name;

    await client.upload(key, buffer, { contentType: file.type });

    // Update bucket stats
    await prisma.bucket.update({
      where: { id },
      data: {
        fileCount: { increment: 1 },
        sizeBytes: { increment: file.size },
      },
    });

    return NextResponse.json({
      file: {
        key,
        size: file.size,
        contentType: file.type,
        url: bucket.isPublic ? client.getPublicUrl(key) : null,
      },
    });
  } catch (error) {
    console.error("Upload file error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
