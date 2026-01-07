import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { TimewebCloudProvider } from "@/lib/cloud/timeweb";
import { NextResponse } from "next/server";

function getProvider(): TimewebCloudProvider {
  return new TimewebCloudProvider({
    apiToken: process.env.TIMEWEB_API_TOKEN!,
  });
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

    return NextResponse.json({
      bucket: {
        id: bucket.id,
        name: bucket.name,
        isPublic: bucket.isPublic,
        maxFileSizeMb: bucket.maxFileSizeMb,
        allowedMimes: bucket.allowedMimes,
        sizeBytes: bucket.sizeBytes.toString(),
        fileCount: bucket.fileCount,
        endpoint: bucket.endpoint,
        createdAt: bucket.createdAt,
      },
    });
  } catch (error) {
    console.error("Get bucket error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;
    const { isPublic, maxFileSizeMb, allowedMimes } = await req.json();

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

    // Update Timeweb bucket if visibility changed
    if (isPublic !== undefined && isPublic !== bucket.isPublic && bucket.timewebBucketId) {
      const provider = getProvider();
      await provider.updateBucket(bucket.timewebBucketId, isPublic);
    }

    // Update local record
    const updated = await prisma.bucket.update({
      where: { id },
      data: {
        ...(isPublic !== undefined && { isPublic }),
        ...(maxFileSizeMb !== undefined && { maxFileSizeMb: maxFileSizeMb || null }),
        ...(allowedMimes !== undefined && { allowedMimes }),
      },
    });

    return NextResponse.json({
      bucket: {
        id: updated.id,
        name: updated.name,
        isPublic: updated.isPublic,
        maxFileSizeMb: updated.maxFileSizeMb,
        allowedMimes: updated.allowedMimes,
        sizeBytes: updated.sizeBytes.toString(),
        fileCount: updated.fileCount,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("Update bucket error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id } = await params;

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

    // Delete from Timeweb
    if (bucket.timewebBucketId) {
      const provider = getProvider();
      await provider.deleteBucket(bucket.timewebBucketId);
    }

    // Delete from database
    await prisma.bucket.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bucket error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
