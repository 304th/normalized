import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { StorageClient } from "@/lib/cloud/storage";
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
    const { filename, contentType, path = "" } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename и contentType обязательны" },
        { status: 400 }
      );
    }

    const bucket = await prisma.bucket.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!bucket || bucket.project.userId !== session.userId) {
      return NextResponse.json(
        { error: "Bucket не найден" },
        { status: 404 }
      );
    }

    // Validate MIME type
    if (bucket.allowedMimes.length > 0 && !bucket.allowedMimes.includes(contentType)) {
      return NextResponse.json(
        { error: `Тип файла ${contentType} не разрешён` },
        { status: 400 }
      );
    }

    if (!bucket.accessKey || !bucket.secretKey) {
      return NextResponse.json(
        { error: "Bucket credentials not available" },
        { status: 500 }
      );
    }

    const client = new StorageClient(bucket.accessKey, bucket.secretKey, bucket.name);
    const key = path ? `${path}/${filename}` : filename;

    const uploadUrl = await client.getSignedUploadUrl(key, contentType, 3600);

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: bucket.isPublic ? client.getPublicUrl(key) : null,
    });
  } catch (error) {
    console.error("Get upload URL error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
