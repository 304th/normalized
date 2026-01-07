import { prisma } from "../prisma";
import { getPlan, type PoolType } from "../plans";
import { TimewebCloudProvider } from "./timeweb";
import {
  ensureAvailableCluster,
  addDatabaseToCluster,
  refreshClusterStatus,
} from "./clusters";
import type { ProvisionStatus } from "./types";

export interface ProvisionRequest {
  projectId: string;
  projectSlug: string;
  planId: string;
  region: string;
}

export interface ProvisionResult {
  status: ProvisionStatus;
  needsPolling: boolean; // True if cluster is still provisioning
}

function getProvider(): TimewebCloudProvider {
  return new TimewebCloudProvider({
    apiToken: process.env.TIMEWEB_API_TOKEN!,
  });
}

/**
 * Provision database for a project based on its plan.
 * - Free/Starter: Uses shared cluster pools
 * - Pro/Business: Creates dedicated cluster
 */
export async function provisionForPlan(req: ProvisionRequest): Promise<ProvisionResult> {
  const plan = getPlan(req.planId);
  if (!plan) {
    throw new Error(`Unknown plan: ${req.planId}`);
  }

  if (plan.isShared && plan.poolType) {
    return provisionShared(req, plan.poolType);
  } else {
    return provisionDedicated(req, plan.timewebPresetId);
  }
}

/**
 * Provision on shared cluster (free/starter tiers).
 */
async function provisionShared(req: ProvisionRequest, poolType: PoolType): Promise<ProvisionResult> {
  // Get or create shared cluster for this pool
  const cluster = await ensureAvailableCluster(req.region, poolType);

  // If cluster is still provisioning, mark project and return
  if (cluster.status === "provisioning") {
    await prisma.project.update({
      where: { id: req.projectId },
      data: {
        provisionStatus: "provisioning",
        sharedClusterId: cluster.id,
      },
    });
    return { status: "provisioning", needsPolling: true };
  }

  // Cluster is ready - add database
  const { dbId, credentials } = await addDatabaseToCluster(cluster.id, req.projectSlug);

  await prisma.project.update({
    where: { id: req.projectId },
    data: {
      provisionStatus: "ready",
      sharedClusterId: cluster.id,
      timewebDbId: dbId,
      dbHost: credentials.host,
      dbPort: credentials.port,
      dbName: credentials.name,
      dbUser: credentials.user,
      dbPassword: credentials.password,
    },
  });

  return { status: "ready", needsPolling: false };
}

/**
 * Provision dedicated cluster (paid tiers).
 */
async function provisionDedicated(
  req: ProvisionRequest,
  presetId: number
): Promise<ProvisionResult> {
  const provider = getProvider();

  const result = await provider.createDatabase(req.projectId, {
    name: req.projectSlug,
    region: req.region,
    presetId,
  });

  await prisma.project.update({
    where: { id: req.projectId },
    data: {
      provisionStatus: result.status,
      cloudExternalId: result.externalId,
      cloudPresetId: presetId,
      dbHost: result.credentials?.host,
      dbPort: result.credentials?.port,
      dbName: result.credentials?.name,
      dbUser: result.credentials?.user,
      dbPassword: result.credentials?.password,
    },
  });

  return {
    status: result.status,
    needsPolling: result.status !== "ready",
  };
}

/**
 * Check and update provisioning status for a project.
 * Called by status polling endpoint.
 */
export async function checkProvisionStatus(projectId: string): Promise<ProvisionStatus> {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { sharedCluster: true },
  });

  // Already done
  if (project.provisionStatus === "ready" || project.provisionStatus === "error") {
    return project.provisionStatus as ProvisionStatus;
  }

  // Shared cluster path
  if (project.sharedClusterId && project.sharedCluster) {
    // Check if cluster is ready now
    if (project.sharedCluster.status === "provisioning") {
      const newStatus = await refreshClusterStatus(project.sharedClusterId);
      if (newStatus !== "ready") {
        return "provisioning";
      }
    }

    // Cluster is ready - if we don't have a DB yet, create one
    if (!project.timewebDbId) {
      const { dbId, credentials } = await addDatabaseToCluster(
        project.sharedClusterId,
        project.slug
      );

      await prisma.project.update({
        where: { id: projectId },
        data: {
          provisionStatus: "ready",
          timewebDbId: dbId,
          dbHost: credentials.host,
          dbPort: credentials.port,
          dbName: credentials.name,
          dbUser: credentials.user,
          dbPassword: credentials.password,
        },
      });

      return "ready";
    }

    return "ready";
  }

  // Dedicated cluster path
  if (project.cloudExternalId) {
    const provider = getProvider();
    const status = await provider.getDatabaseStatus(project.cloudExternalId);

    if (status !== project.provisionStatus) {
      await prisma.project.update({
        where: { id: projectId },
        data: { provisionStatus: status },
      });
    }

    return status;
  }

  return project.provisionStatus as ProvisionStatus;
}
