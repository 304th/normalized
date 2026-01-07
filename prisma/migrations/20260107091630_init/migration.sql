-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT NOT NULL DEFAULT 'ru-msk',
    "cloudProvider" TEXT NOT NULL DEFAULT 'timeweb',
    "cloudExternalId" TEXT,
    "cloudPresetId" INTEGER,
    "provisionStatus" TEXT NOT NULL DEFAULT 'pending',
    "sharedClusterId" TEXT,
    "timewebDbId" INTEGER,
    "dbHost" TEXT,
    "dbPort" INTEGER,
    "dbName" TEXT,
    "dbUser" TEXT,
    "dbPassword" TEXT,
    "planId" TEXT NOT NULL DEFAULT 'free',
    "dbSizeMb" INTEGER NOT NULL DEFAULT 64,
    "storageMb" INTEGER NOT NULL DEFAULT 256,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedCluster" (
    "id" TEXT NOT NULL,
    "timewebClusterId" INTEGER NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'ru-msk',
    "presetId" INTEGER NOT NULL,
    "poolType" TEXT NOT NULL DEFAULT 'free',
    "maxDatabases" INTEGER NOT NULL DEFAULT 300,
    "dbCount" INTEGER NOT NULL DEFAULT 0,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "adminUser" TEXT NOT NULL,
    "adminPassword" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'provisioning',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT true,
    "canWrite" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_sharedClusterId_idx" ON "Project"("sharedClusterId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedCluster_timewebClusterId_key" ON "SharedCluster"("timewebClusterId");

-- CreateIndex
CREATE INDEX "SharedCluster_region_poolType_status_idx" ON "SharedCluster"("region", "poolType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_projectId_idx" ON "ApiKey"("projectId");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_sharedClusterId_fkey" FOREIGN KEY ("sharedClusterId") REFERENCES "SharedCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
