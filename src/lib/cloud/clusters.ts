import { prisma } from "../prisma";
import { POOL_CONFIG, type PoolType } from "../plans";
import { TimewebCloudProvider } from "./timeweb";
import type { DatabaseCredentials } from "./types";

function getProvider(): TimewebCloudProvider {
  return new TimewebCloudProvider({
    apiToken: process.env.TIMEWEB_API_TOKEN!,
  });
}

/**
 * Find an available shared cluster with capacity in the given region and pool.
 * Prefers clusters closer to full (better utilization).
 */
export async function getAvailableCluster(region: string, poolType: PoolType) {
  const config = POOL_CONFIG[poolType];

  return prisma.sharedCluster.findFirst({
    where: {
      region,
      poolType,
      status: "ready",
      dbCount: { lt: config.maxDatabases },
    },
    orderBy: { dbCount: "desc" },
  });
}

/**
 * Create a new shared cluster in the given region for the specified pool.
 * Returns the cluster record (status will be 'provisioning').
 */
export async function createSharedCluster(region: string, poolType: PoolType) {
  const config = POOL_CONFIG[poolType];
  const provider = getProvider();
  const name = `${poolType}-${region}-${Date.now()}`;

  const result = await provider.createCluster(name, config.presetId, region);

  return prisma.sharedCluster.create({
    data: {
      timewebClusterId: result.clusterId,
      region,
      poolType,
      presetId: config.presetId,
      maxDatabases: config.maxDatabases,
      dbCount: 0,
      host: result.host,
      port: result.port,
      adminUser: result.login,
      adminPassword: result.password,
      status: "provisioning",
    },
  });
}

/**
 * Add a database to a shared cluster.
 * Increments dbCount and returns credentials.
 */
export async function addDatabaseToCluster(
  clusterId: string,
  projectSlug: string
): Promise<{ dbId: number; credentials: DatabaseCredentials }> {
  const cluster = await prisma.sharedCluster.findUniqueOrThrow({
    where: { id: clusterId },
  });

  if (cluster.status !== "ready") {
    throw new Error(`Cluster ${clusterId} is not ready (status: ${cluster.status})`);
  }

  if (cluster.dbCount >= cluster.maxDatabases) {
    throw new Error(`Cluster ${clusterId} is full`);
  }

  const provider = getProvider();
  const { dbId, name } = await provider.addDatabaseToCluster(
    cluster.timewebClusterId,
    projectSlug
  );

  // Increment dbCount, mark as full if at capacity
  const newCount = cluster.dbCount + 1;
  await prisma.sharedCluster.update({
    where: { id: clusterId },
    data: {
      dbCount: newCount,
      status: newCount >= cluster.maxDatabases ? "full" : "ready",
    },
  });

  const credentials: DatabaseCredentials = {
    host: cluster.host,
    port: cluster.port,
    name,
    user: cluster.adminUser,
    password: cluster.adminPassword,
    connectionUrl: `postgres://${cluster.adminUser}:${cluster.adminPassword}@${cluster.host}:${cluster.port}/${name}`,
  };

  return { dbId, credentials };
}

/**
 * Remove a database from a shared cluster.
 * Decrements dbCount and deletes the DB from Timeweb.
 */
export async function removeDatabaseFromCluster(
  clusterId: string,
  dbId: number
): Promise<void> {
  const cluster = await prisma.sharedCluster.findUniqueOrThrow({
    where: { id: clusterId },
  });

  const provider = getProvider();
  await provider.deleteDatabaseFromCluster(cluster.timewebClusterId, dbId);

  const newCount = Math.max(0, cluster.dbCount - 1);
  await prisma.sharedCluster.update({
    where: { id: clusterId },
    data: {
      dbCount: newCount,
      // If was full, now has capacity
      status: cluster.status === "full" ? "ready" : cluster.status,
    },
  });

  // If cluster is draining and now empty, delete it
  if (cluster.status === "draining" && newCount === 0) {
    await provider.deleteCluster(cluster.timewebClusterId);
    await prisma.sharedCluster.delete({ where: { id: clusterId } });
  }
}

/**
 * Check cluster status and update if changed.
 */
export async function refreshClusterStatus(clusterId: string): Promise<string> {
  const cluster = await prisma.sharedCluster.findUniqueOrThrow({
    where: { id: clusterId },
  });

  if (cluster.status !== "provisioning") {
    return cluster.status;
  }

  const provider = getProvider();
  const status = await provider.getClusterStatus(cluster.timewebClusterId);

  if (status === "ready") {
    await prisma.sharedCluster.update({
      where: { id: clusterId },
      data: { status: "ready" },
    });
    return "ready";
  }

  return cluster.status;
}

/**
 * Get or create an available shared cluster for the region and pool type.
 * If no cluster available, creates one.
 */
export async function ensureAvailableCluster(region: string, poolType: PoolType) {
  // Try to find existing cluster with capacity
  let cluster = await getAvailableCluster(region, poolType);
  if (cluster) return cluster;

  // Check if there's a provisioning cluster we can wait for
  const provisioningCluster = await prisma.sharedCluster.findFirst({
    where: { region, poolType, status: "provisioning" },
    orderBy: { createdAt: "desc" },
  });

  if (provisioningCluster) {
    // Return it - caller should poll status endpoint
    return provisioningCluster;
  }

  // Create new cluster
  return createSharedCluster(region, poolType);
}
