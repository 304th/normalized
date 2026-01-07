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
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id, path } = await params;
    const filePath = path.join("/");

    const bucket = await getBucketWithAuth(id, session.userId);
    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket не найден" },
        { status: 404 }
      );
    }

    const client = getStorageClient(bucket);

    // Check if file exists
    const fileInfo = await client.head(filePath);
    if (!fileInfo) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 404 }
      );
    }

    // For public buckets, redirect to public URL
    if (bucket.isPublic) {
      return NextResponse.redirect(client.getPublicUrl(filePath));
    }

    // For private buckets, generate signed URL or stream
    const { searchParams } = new URL(req.url);
    const download = searchParams.get("download") === "true";

    if (download) {
      // Stream the file directly
      const { body, contentType, contentLength } = await client.getStream(filePath);

      return new NextResponse(body, {
        headers: {
          "Content-Type": contentType || "application/octet-stream",
          "Content-Length": contentLength?.toString() || "",
          "Content-Disposition": `attachment; filename="${path[path.length - 1]}"`,
        },
      });
    }

    // Return signed URL
    const signedUrl = await client.getSignedDownloadUrl(filePath, 3600);
    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error("Get file error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id, path } = await params;
    const filePath = path.join("/");

    const bucket = await getBucketWithAuth(id, session.userId);
    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket не найден" },
        { status: 404 }
      );
    }

    const client = getStorageClient(bucket);

    // Get file size before deletion for stats update
    const fileInfo = await client.head(filePath);
    if (!fileInfo) {
      return NextResponse.json(
        { error: "Файл не найден" },
        { status: 404 }
      );
    }

    await client.delete(filePath);

    // Update bucket stats
    await prisma.bucket.update({
      where: { id },
      data: {
        fileCount: { decrement: 1 },
        sizeBytes: { decrement: fileInfo.size },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
