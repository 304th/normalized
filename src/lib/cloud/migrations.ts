import { prisma } from "../prisma";
import { getPlan } from "../plans";
import { TimewebCloudProvider } from "./timeweb";
import { removeDatabaseFromCluster } from "./clusters";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function getProvider(): TimewebCloudProvider {
  return new TimewebCloudProvider({
    apiToken: process.env.TIMEWEB_API_TOKEN!,
  });
}

/**
 * Migrate project from shared cluster (free/starter) to dedicated cluster (pro/business).
 * Uses pg_dump/pg_restore for data migration.
 */
export async function migrateSharedToDedicated(
  projectId: string,
  newPlanId: string
): Promise<void> {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
    include: { sharedCluster: true },
  });

  if (!project.sharedClusterId || !project.sharedCluster || !project.timewebDbId) {
    throw new Error("Project is not on a shared cluster");
  }

  const newPlan = getPlan(newPlanId);
  if (!newPlan) {
    throw new Error(`Unknown plan: ${newPlanId}`);
  }

  if (newPlan.isShared) {
    throw new Error("Cannot migrate to another shared plan");
  }

  const provider = getProvider();
  let newExternalId: string | null = null;

  try {
    // 1. Mark as upgrading
    await prisma.project.update({
      where: { id: projectId },
      data: { provisionStatus: "upgrading" },
    });

    // 2. Create dedicated cluster
    const result = await provider.createDatabase(projectId, {
      name: project.slug,
      region: project.region,
      presetId: newPlan.timewebPresetId,
    });

    newExternalId = result.externalId;

    // 3. Wait for new cluster to be ready (poll up to 5 min)
    let ready = false;
    for (let i = 0; i < 30; i++) {
      const status = await provider.getDatabaseStatus(result.externalId);
      if (status === "ready") {
        ready = true;
        break;
      }
      await sleep(10000); // 10 sec
    }

    if (!ready) {
      throw new Error("New cluster failed to become ready in time");
    }

    // 4. Get credentials for both DBs
    const newCreds = await provider.getDatabaseCredentials(result.externalId);
    if (!newCreds) {
      throw new Error("Failed to get new cluster credentials");
    }

    const oldConnStr = `postgres://${project.dbUser}:${project.dbPassword}@${project.dbHost}:${project.dbPort}/${project.dbName}`;
    const newConnStr = newCreds.connectionUrl;

    // 5. pg_dump from shared, pg_restore to dedicated
    await migrateData(oldConnStr, newConnStr);

    // 6. Update project with new credentials
    await prisma.project.update({
      where: { id: projectId },
      data: {
        provisionStatus: "ready",
        planId: newPlanId,
        dbSizeMb: newPlan.dbSizeMb,
        storageMb: newPlan.storageMb,
        cloudExternalId: result.externalId,
        cloudPresetId: newPlan.timewebPresetId,
        sharedClusterId: null,
        timewebDbId: null,
        dbHost: newCreds.host,
        dbPort: newCreds.port,
        dbName: newCreds.name,
        dbUser: newCreds.user,
        dbPassword: newCreds.password,
      },
    });

    // 7. Remove DB from shared cluster
    await removeDatabaseFromCluster(project.sharedClusterId, project.timewebDbId);

  } catch (error) {
    console.error("Migration failed:", error);

    // Cleanup: delete new cluster if created
    if (newExternalId) {
      try {
        await provider.deleteDatabase(newExternalId);
      } catch (cleanupErr) {
        console.error("Failed to cleanup new cluster:", cleanupErr);
      }
    }

    // Mark as error
    await prisma.project.update({
      where: { id: projectId },
      data: {
        provisionStatus: "error",
      },
    });

    throw error;
  }
}

/**
 * Resize dedicated cluster to a larger preset.
 */
export async function resizeDedicated(
  projectId: string,
  newPlanId: string
): Promise<void> {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: projectId },
  });

  if (!project.cloudExternalId) {
    throw new Error("Project does not have a dedicated cluster");
  }

  const newPlan = getPlan(newPlanId);
  if (!newPlan) {
    throw new Error(`Unknown plan: ${newPlanId}`);
  }

  const provider = getProvider();

  // Mark as upgrading
  await prisma.project.update({
    where: { id: projectId },
    data: { provisionStatus: "upgrading" },
  });

  try {
    // Resize (Timeweb handles data preservation)
    const status = await provider.resizeDatabase(
      project.cloudExternalId,
      newPlan.timewebPresetId
    );

    await prisma.project.update({
      where: { id: projectId },
      data: {
        provisionStatus: status,
        planId: newPlanId,
        dbSizeMb: newPlan.dbSizeMb,
        storageMb: newPlan.storageMb,
        cloudPresetId: newPlan.timewebPresetId,
      },
    });
  } catch (error) {
    await prisma.project.update({
      where: { id: projectId },
      data: { provisionStatus: "error" },
    });
    throw error;
  }
}

/**
 * Migrate data using pg_dump | pg_restore.
 */
async function migrateData(sourceUrl: string, targetUrl: string): Promise<void> {
  // Use custom format for better performance
  // pg_dump outputs to stdout, pg_restore reads from stdin
  const command = `pg_dump "${sourceUrl}" --format=custom --no-owner --no-acl | pg_restore "${targetUrl}" --no-owner --no-acl --clean --if-exists`;

  try {
    await execAsync(command, {
      timeout: 300000, // 5 min timeout
      env: {
        ...process.env,
        PGCONNECT_TIMEOUT: "30",
      },
    });
  } catch (error: unknown) {
    const err = error as { stderr?: string };
    // pg_restore may return non-zero even on success with --clean --if-exists
    // Check if it's a real error
    if (err.stderr && !err.stderr.includes("pg_restore: warning")) {
      throw new Error(`Data migration failed: ${err.stderr}`);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
