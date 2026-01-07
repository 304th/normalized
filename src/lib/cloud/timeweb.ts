import type {
  CloudProvider,
  DatabaseConfig,
  DatabaseCredentials,
  Plan,
  ProvisionResult,
  ProvisionStatus,
} from "./types";

const API_BASE = "https://api.timeweb.cloud/api/v1";

interface TimewebConfig {
  apiToken: string;
  defaultPresetId?: number;
}

interface TimewebPreset {
  id: number;
  description_short: string;
  disk: number; // bytes
  price: number;
  cpu: number;
  ram: number;
  type: string;
  location: string;
}

interface TimewebCluster {
  id: number;
  name: string;
  status: string;
  type: string;
  host: string;
  port: number;
  login: string;
  password: string;
  preset_id: number;
}

interface TimewebDbInstance {
  id: number;
  name: string;
  status: string;
}

export class TimewebCloudProvider implements CloudProvider {
  readonly name = "timeweb";
  private token: string;
  private defaultPresetId: number;

  constructor(config: TimewebConfig) {
    this.token = config.apiToken;
    this.defaultPresetId = config.defaultPresetId ?? 1;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Timeweb API error: ${res.status} ${error}`);
    }

    return res.json();
  }

  async getPlans(region: string): Promise<Plan[]> {
    const location = this.regionToLocation(region);
    const res = await this.request<{ databases_presets: TimewebPreset[] }>(
      "GET",
      "/presets/dbs"
    );

    return res.databases_presets
      .filter((p) => p.type === "postgres" && p.location === location)
      .map((p) => ({
        id: `tw-${p.id}`,
        name: p.description_short,
        dbSizeMb: Math.round(p.disk / 1024 / 1024),
        storageMb: Math.round(p.disk / 1024 / 1024), // same as db for now
        presetId: p.id,
        priceMonthly: Math.round(p.price * 100), // rubles to kopecks
      }));
  }

  async createDatabase(
    projectId: string,
    config: DatabaseConfig
  ): Promise<ProvisionResult> {
    const presetId = config.presetId ?? this.defaultPresetId;

    // 1. Create cluster
    const clusterRes = await this.request<{ db_cluster: TimewebCluster }>(
      "POST",
      "/dbs",
      {
        name: `nrm-${projectId}`,
        type: "postgres",
        preset_id: presetId,
        login: `user_${projectId.slice(0, 8)}`,
        password: this.generatePassword(),
        hash_type: "caching_sha2",
      }
    );

    const cluster = clusterRes.db_cluster;

    // 2. Create database instance in cluster
    const dbRes = await this.request<{ db: TimewebDbInstance }>(
      "POST",
      `/dbs/${cluster.id}/dbs`,
      {
        name: config.name.replace(/[^a-z0-9_]/gi, "_").slice(0, 32),
      }
    );

    return {
      externalId: `${cluster.id}:${dbRes.db.id}`,
      status: this.mapStatus(cluster.status),
      credentials: {
        host: cluster.host,
        port: cluster.port,
        name: dbRes.db.name,
        user: cluster.login,
        password: cluster.password,
        connectionUrl: `postgres://${cluster.login}:${cluster.password}@${cluster.host}:${cluster.port}/${dbRes.db.name}`,
      },
    };
  }

  async resizeDatabase(
    externalId: string,
    newPresetId: number
  ): Promise<ProvisionStatus> {
    const [clusterId] = externalId.split(":");

    // PATCH cluster with new preset - Timeweb handles data migration
    await this.request("PATCH", `/dbs/${clusterId}`, {
      preset_id: newPresetId,
    });

    // Check status after resize request
    const res = await this.request<{ db_cluster: TimewebCluster }>(
      "GET",
      `/dbs/${clusterId}`
    );

    return this.mapStatus(res.db_cluster.status);
  }

  async deleteDatabase(externalId: string): Promise<void> {
    const [clusterId] = externalId.split(":");
    await this.request("DELETE", `/dbs/${clusterId}`);
  }

  async getDatabaseStatus(externalId: string): Promise<ProvisionStatus> {
    const [clusterId] = externalId.split(":");
    const res = await this.request<{ db_cluster: TimewebCluster }>(
      "GET",
      `/dbs/${clusterId}`
    );
    return this.mapStatus(res.db_cluster.status);
  }

  async getDatabaseCredentials(
    externalId: string
  ): Promise<DatabaseCredentials | null> {
    const [clusterId, dbId] = externalId.split(":");

    const clusterRes = await this.request<{ db_cluster: TimewebCluster }>(
      "GET",
      `/dbs/${clusterId}`
    );
    const cluster = clusterRes.db_cluster;

    const dbRes = await this.request<{ db: TimewebDbInstance }>(
      "GET",
      `/dbs/${clusterId}/dbs/${dbId}`
    );

    return {
      host: cluster.host,
      port: cluster.port,
      name: dbRes.db.name,
      user: cluster.login,
      password: cluster.password,
      connectionUrl: `postgres://${cluster.login}:${cluster.password}@${cluster.host}:${cluster.port}/${dbRes.db.name}`,
    };
  }

  // --- Shared cluster methods ---

  /** Create a new cluster (without creating a database inside) */
  async createCluster(
    name: string,
    presetId: number,
    region: string
  ): Promise<{ clusterId: number; host: string; port: number; login: string; password: string; status: string }> {
    const password = this.generatePassword();
    const clusterRes = await this.request<{ db_cluster: TimewebCluster }>(
      "POST",
      "/dbs",
      {
        name,
        type: "postgres",
        preset_id: presetId,
        login: "admin",
        password,
        hash_type: "caching_sha2",
      }
    );

    const cluster = clusterRes.db_cluster;
    return {
      clusterId: cluster.id,
      host: cluster.host,
      port: cluster.port,
      login: cluster.login,
      password: cluster.password,
      status: cluster.status,
    };
  }

  /** Add a database to an existing cluster */
  async addDatabaseToCluster(
    clusterId: number,
    dbName: string
  ): Promise<{ dbId: number; name: string }> {
    const safeName = dbName.replace(/[^a-z0-9_]/gi, "_").slice(0, 32);
    const dbRes = await this.request<{ db: TimewebDbInstance }>(
      "POST",
      `/dbs/${clusterId}/dbs`,
      { name: safeName }
    );
    return { dbId: dbRes.db.id, name: dbRes.db.name };
  }

  /** Delete a database from a cluster (not the cluster itself) */
  async deleteDatabaseFromCluster(clusterId: number, dbId: number): Promise<void> {
    await this.request("DELETE", `/dbs/${clusterId}/dbs/${dbId}`);
  }

  /** Get cluster status */
  async getClusterStatus(clusterId: number): Promise<ProvisionStatus> {
    const res = await this.request<{ db_cluster: TimewebCluster }>(
      "GET",
      `/dbs/${clusterId}`
    );
    return this.mapStatus(res.db_cluster.status);
  }

  /** Delete entire cluster */
  async deleteCluster(clusterId: number): Promise<void> {
    await this.request("DELETE", `/dbs/${clusterId}`);
  }

  // --- S3 Storage methods ---

  /** Create S3 bucket */
  async createBucket(
    name: string,
    isPublic: boolean,
    presetId: number = 1
  ): Promise<{
    bucketId: number;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    bucketName: string;
  }> {
    const res = await this.request<{
      bucket: {
        id: number;
        name: string;
        type: string;
        preset_id: number;
        status: string;
        access_key: string;
        secret_key: string;
        hostname: string;
      };
    }>("POST", "/storages/buckets", {
      name,
      type: isPublic ? "public" : "private",
      preset_id: presetId,
    });

    return {
      bucketId: res.bucket.id,
      accessKey: res.bucket.access_key,
      secretKey: res.bucket.secret_key,
      endpoint: `https://${res.bucket.hostname}`,
      bucketName: res.bucket.name,
    };
  }

  /** Delete S3 bucket */
  async deleteBucket(bucketId: number): Promise<void> {
    await this.request("DELETE", `/storages/buckets/${bucketId}`);
  }

  /** Get bucket info */
  async getBucket(bucketId: number): Promise<{
    id: number;
    name: string;
    type: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    usedSpace: number;
  }> {
    const res = await this.request<{
      bucket: {
        id: number;
        name: string;
        type: string;
        access_key: string;
        secret_key: string;
        hostname: string;
        used_space: number;
      };
    }>("GET", `/storages/buckets/${bucketId}`);

    return {
      id: res.bucket.id,
      name: res.bucket.name,
      type: res.bucket.type,
      accessKey: res.bucket.access_key,
      secretKey: res.bucket.secret_key,
      endpoint: `https://${res.bucket.hostname}`,
      usedSpace: res.bucket.used_space,
    };
  }

  /** Update bucket type (public/private) */
  async updateBucket(bucketId: number, isPublic: boolean): Promise<void> {
    await this.request("PATCH", `/storages/buckets/${bucketId}`, {
      type: isPublic ? "public" : "private",
    });
  }

  private mapStatus(status: string): ProvisionStatus {
    const map: Record<string, ProvisionStatus> = {
      started: "ready",
      starting: "provisioning",
      stoped: "pending",
      no_paid: "error",
      updating: "upgrading",
    };
    return map[status] ?? "provisioning";
  }

  private regionToLocation(region: string): string {
    const map: Record<string, string> = {
      "ru-msk": "ru-1",
      "ru-spb": "ru-2",
      "pl-waw": "pl-1",
      "kz-ast": "kz-1",
    };
    return map[region] ?? "ru-1";
  }

  private generatePassword(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 24; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }
}
