-- CreateTable
CREATE TABLE "Bucket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "maxFileSizeMb" INTEGER,
    "allowedMimes" TEXT[],
    "timewebBucketId" INTEGER,
    "accessKey" TEXT,
    "secretKey" TEXT,
    "endpoint" TEXT DEFAULT 'https://s3.timeweb.cloud',
    "sizeBytes" BIGINT NOT NULL DEFAULT 0,
    "fileCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Bucket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bucket_timewebBucketId_key" ON "Bucket"("timewebBucketId");

-- CreateIndex
CREATE INDEX "Bucket_projectId_idx" ON "Bucket"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Bucket_projectId_name_key" ON "Bucket"("projectId", "name");

-- AddForeignKey
ALTER TABLE "Bucket" ADD CONSTRAINT "Bucket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
