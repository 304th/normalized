# Timeweb Cloud Integration Guide

## Overview

Your platform acts as a layer on top of Timeweb Cloud, provisioning and managing:
- PostgreSQL databases (DBaaS)
- S3 object storage
- Compute instances (for API/Edge functions)

```
┌─────────────────────────────────────────────────────────────┐
│  Your Platform (normalized.ru)                              │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Auth │ Realtime │ Edge Functions │ REST API   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Timeweb Cloud API (api.timeweb.cloud)                      │
├─────────────────────────────────────────────────────────────┤
│  DBaaS (PostgreSQL) │ S3 Storage │ Compute │ Kubernetes    │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication

### Get API Token

1. Go to Timeweb Cloud panel → "API и Terraform"
2. Create new token
3. Store securely (env var)

### Using Token

```bash
Authorization: Bearer $TIMEWEB_CLOUD_TOKEN
```

All requests to `https://api.timeweb.cloud` require this header.

### Rate Limits

- **20 requests/second** per endpoint
- Returns `HTTP 429` if exceeded
- Implement exponential backoff

---

## SDKs Available

| Language | Package | Notes |
|----------|---------|-------|
| **JavaScript** | REST API + fetch | No official SDK, use fetch |
| Python | `timeweb_cloud_api` | [timeweb-cloud/sdk-python](https://github.com/timeweb-cloud/sdk-python) |
| Go | `timeweb-cloud-api` | [timeweb-cloud/sdk-go](https://github.com/timeweb-cloud/sdk-go) |
| Terraform | `timeweb-cloud/timeweb-cloud` | [terraform-provider](https://github.com/timeweb-cloud/terraform-provider-timeweb-cloud) |

### JavaScript Setup (Recommended)

No SDK needed - just use fetch with REST API:

```typescript
// lib/timeweb.ts
const TIMEWEB_API = "https://api.timeweb.cloud/api/v1";
const TIMEWEB_TOKEN = process.env.TIMEWEB_CLOUD_TOKEN!;

async function twApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${TIMEWEB_API}${endpoint}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${TIMEWEB_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Timeweb API error: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

export const timeweb = {
  // Databases
  getDbPresets: () => twApi<{ presets: DbPreset[] }>("/presets/dbs"),
  createDb: (data: CreateDbParams) => twApi<{ db: Database }>("/dbs", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  getDb: (id: number) => twApi<{ db: Database }>(`/dbs/${id}`),
  deleteDb: (id: number) => twApi(`/dbs/${id}`, { method: "DELETE" }),

  // S3 Buckets
  getBuckets: () => twApi<{ buckets: Bucket[] }>("/storages/buckets"),
  createBucket: (data: CreateBucketParams) => twApi<{ bucket: Bucket }>("/storages/buckets", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  deleteBucket: (id: number) => twApi(`/storages/buckets/${id}`, { method: "DELETE" }),
};
```

### Types

```typescript
// lib/timeweb.types.ts
interface DbPreset {
  id: number;
  type: "postgres" | "mysql" | "redis" | "mongodb";
  location: string;
  cpu: number;
  ram: number;
  disk: number;
  price: number;
}

interface CreateDbParams {
  name: string;
  type: "postgres";
  preset_id: number;
  login: string;
  password: string;
  hash_type?: "caching_sha2" | "mysql_native";
}

interface Database {
  id: number;
  name: string;
  type: string;
  host: string;
  port: number;
  status: string;
  preset_id: number;
}

interface Bucket {
  id: number;
  name: string;
  location: string;
  status: string;
  disk_stats: { used: number; size: number };
}

interface CreateBucketParams {
  name: string;
  preset_id: number;
  type: "private" | "public";
}
```

---

## PostgreSQL Database Provisioning

### API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List presets | GET | `/api/v1/presets/dbs` |
| Create cluster | POST | `/api/v1/dbs` |
| Get cluster | GET | `/api/v1/dbs/{db_id}` |
| Delete cluster | DELETE | `/api/v1/dbs/{db_id}` |
| Create database | POST | `/api/v1/dbs/{db_id}/databases` |
| Create user | POST | `/api/v1/dbs/{db_id}/admins` |

### Database Presets (Timeweb)

| Preset | vCPU | RAM | Disk | Price/mo |
|--------|------|-----|------|----------|
| Cloud DB 1/1/8 | 1 | 1GB | 8GB | 380 |
| Cloud DB 1/2/20 | 1 | 2GB | 20GB | 600 |
| Cloud DB 2/2/30 | 2 | 2GB | 30GB | 1,050 |
| Cloud DB 2/4/40 | 2 | 4GB | 40GB | 1,575 |
| Cloud DB 4/8/80 | 4 | 8GB | 80GB | 2,775 |
| Cloud DB 8/16/220 | 8 | 16GB | 220GB | 6,000 |

### Terraform Example

```hcl
terraform {
  required_providers {
    twc = {
      source = "timeweb-cloud/timeweb-cloud"
    }
  }
}

provider "twc" {
  token = var.timeweb_token
}

# Find preset
data "twc_database_preset" "pg_preset" {
  location = "ru-1"
  type     = "postgres"
  disk     = 40 * 1024  # 40GB in MB
  price_filter {
    from = 1000
    to   = 2000
  }
}

# Create PostgreSQL cluster
resource "twc_database_cluster" "customer_db" {
  name      = "customer-${var.customer_id}"
  type      = "postgres"
  preset_id = data.twc_database_preset.pg_preset.id
}

# Create database instance
resource "twc_database_instance" "main" {
  cluster_id = twc_database_cluster.customer_db.id
  name       = "main"
}
```

### JavaScript Example

```typescript
import { timeweb } from "@/lib/timeweb";
import { randomBytes } from "crypto";

async function provisionDatabase(customerId: string, presetId: number) {
  const password = randomBytes(16).toString("hex");

  const { db } = await timeweb.createDb({
    name: `customer-${customerId}`,
    type: "postgres",
    preset_id: presetId,
    login: "admin",
    password,
  });

  return { db, password };
}

async function getPostgresPresets() {
  const { presets } = await timeweb.getDbPresets();
  return presets.filter((p) => p.type === "postgres");
}
```

---

## S3 Object Storage

### S3-Compatible API

Timeweb S3 is AWS S3-compatible. Use standard AWS SDKs:

```
Endpoint: https://s3.timeweb.cloud
```

### Timeweb API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List buckets | GET | `/api/v1/storages/buckets` |
| Create bucket | POST | `/api/v1/storages/buckets` |
| Delete bucket | DELETE | `/api/v1/storages/buckets/{bucket_id}` |
| Get bucket users | GET | `/api/v1/storages/buckets/{bucket_id}/users` |

### Pricing

| Item | Cost |
|------|------|
| Storage | ~2/GB/mo |
| Bulk (2TB) | 3,999/mo |
| Egress (first 100GB) | Free |
| Egress (over 100GB) | 1/GB |
| API requests | Free |

### Terraform Example

```hcl
resource "twc_s3_bucket" "customer_storage" {
  name       = "customer-${var.customer_id}"
  location   = "ru-1"
  preset_id  = data.twc_s3_preset.standard.id
}
```

### Using AWS SDK (Node.js)

```javascript
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: "https://s3.timeweb.cloud",
  region: "ru-1",
  credentials: {
    accessKeyId: process.env.TIMEWEB_S3_ACCESS_KEY,
    secretAccessKey: process.env.TIMEWEB_S3_SECRET_KEY,
  },
});

async function uploadFile(bucket, key, body) {
  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
  }));
}
```

---

## Multi-Tenancy Architecture

### Option 1: Shared Database (Recommended for Free/Pro)

```
┌─────────────────────────────────────────────┐
│  PostgreSQL Cluster (Cloud DB 2/4/40)       │
├─────────────────────────────────────────────┤
│  Schema: customer_abc123                    │
│  Schema: customer_def456                    │
│  Schema: customer_ghi789                    │
│  ... (up to 50-100 customers)               │
└─────────────────────────────────────────────┘
```

**Pros**: Cost efficient, easy management
**Cons**: Noisy neighbor risk, shared resources

### Option 2: Dedicated Database (Business/Enterprise)

```
┌──────────────────┐  ┌──────────────────┐
│  Cluster A       │  │  Cluster B       │
│  (Customer X)    │  │  (Customer Y)    │
└──────────────────┘  └──────────────────┘
```

**Pros**: Isolation, dedicated resources
**Cons**: Higher cost, more management

### Implementation Strategy

```typescript
// lib/tiers.ts
const TIER_CONFIG = {
  free: {
    dbType: "shared",
    maxSchemasPerCluster: 100,
    presetId: 123,  // Cloud DB 1/2/20 - 600/mo shared
  },
  pro: {
    dbType: "shared",
    maxSchemasPerCluster: 10,
    presetId: 124,  // Cloud DB 2/4/40 - 1,575/mo shared
  },
  pro_plus: {
    dbType: "shared",
    maxSchemasPerCluster: 3,
    presetId: 125,  // Cloud DB 4/8/80 - 2,775/mo shared
  },
  business: {
    dbType: "dedicated",
    presetId: 126,  // Cloud DB 8/16/220 - 6,000/mo dedicated
  },
  enterprise: {
    dbType: "dedicated",
    presetId: null,  // Custom
  },
} as const;
```

---

## Provisioning Flow

### New Customer Signup

```
1. User signs up
   │
2. Create Timeweb resources:
   ├── Find available shared DB cluster (or create new)
   ├── Create schema in cluster
   ├── Create S3 bucket (or folder in shared bucket)
   └── Generate credentials
   │
3. Store mapping in your DB:
   │  customer_id → db_cluster_id, schema_name, bucket_name
   │
4. Return connection string to customer
```

### Code Flow

```typescript
// lib/provisioning.ts
import { timeweb } from "@/lib/timeweb";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";

type Tier = keyof typeof TIER_CONFIG;

export async function provisionCustomer(customerId: string, tier: Tier) {
  const config = TIER_CONFIG[tier];
  let cluster: Database;
  let schemaName: string;
  const password = randomBytes(16).toString("hex");

  if (config.dbType === "shared") {
    // Find cluster with capacity
    cluster = await findAvailableCluster(config.presetId);
    if (!cluster) {
      const result = await timeweb.createDb({
        name: `shared-${config.presetId}-${Date.now()}`,
        type: "postgres",
        preset_id: config.presetId!,
        login: "admin",
        password,
      });
      cluster = result.db;
    }

    // Create schema for customer
    schemaName = `c_${customerId}`;
    await createSchema(cluster.id, schemaName);

  } else {
    // Dedicated cluster
    const result = await timeweb.createDb({
      name: `customer-${customerId}`,
      type: "postgres",
      preset_id: config.presetId!,
      login: "admin",
      password,
    });
    cluster = result.db;
    schemaName = "public";
  }

  // Create S3 bucket
  const { bucket } = await timeweb.createBucket({
    name: `customer-${customerId}`,
    preset_id: S3_PRESET_ID,
    type: "private",
  });

  // Store mapping
  await db.customer.create({
    data: {
      id: customerId,
      tier,
      dbClusterId: cluster.id,
      dbSchema: schemaName,
      dbHost: cluster.host,
      dbPort: cluster.port,
      dbPassword: password, // encrypt this!
      s3Bucket: bucket.name,
    },
  });

  return {
    databaseUrl: `postgres://admin:${password}@${cluster.host}:${cluster.port}/${schemaName}`,
    s3Endpoint: `https://${bucket.name}.s3.timeweb.cloud`,
  };
}

async function findAvailableCluster(presetId: number): Promise<Database | null> {
  // Find existing cluster with capacity
  const clusters = await db.sharedCluster.findFirst({
    where: { presetId, customerCount: { lt: TIER_CONFIG.free.maxSchemasPerCluster } },
  });
  if (clusters) {
    return timeweb.getDb(clusters.clusterId).then((r) => r.db);
  }
  return null;
}

async function createSchema(clusterId: number, schemaName: string) {
  // Execute via your API that connects to the cluster
  // CREATE SCHEMA IF NOT EXISTS ${schemaName}
}
```

---

## Connection Pooling

For shared databases, use PgBouncer or similar:

```
┌─────────────────────────────────────────────────────────────┐
│  Your API Layer                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PgBouncer (connection pooler)                              │
│  - Pool per customer schema                                 │
│  - Max 20 connections per pool                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Cluster                                         │
│  - Max 100 connections total                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Monitoring & Alerts

### What to Monitor

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| DB disk usage | >80% | Notify customer, upgrade |
| DB connections | >80% | Scale or optimize |
| S3 storage | >90% of tier | Notify customer |
| API rate limits | >50% of 20/s | Implement queue |

### Timeweb Monitoring

Timeweb provides basic monitoring in dashboard. For advanced:
- Export metrics to your own Prometheus/Grafana
- Use Timeweb API to poll status

---

## Cost Optimization

### Shared Infrastructure Savings

| Resource | Dedicated Cost | Shared Cost (10 users) | Savings |
|----------|---------------|------------------------|---------|
| DB (Pro tier) | 1,575 × 10 = 15,750 | 2,775 | 82% |
| S3 bucket | ~500 × 10 = 5,000 | ~500 | 90% |

### Reserved Capacity

Timeweb offers discounts for long-term commitments:
- 6 months: ~10% discount
- 12 months: ~20% discount

Commit once you have stable customer base.

---

## Disaster Recovery

### Backups

| Tier | Strategy | Retention |
|------|----------|-----------|
| Free | None (user responsibility) | - |
| Pro | Daily via Timeweb | 7 days |
| Pro+ | Daily + PITR | 14 days |
| Business | Daily + PITR + offsite | 30 days |

### Backup Implementation

```typescript
// lib/backups.ts
import { twApi } from "@/lib/timeweb";

// Create backup via Timeweb API
export async function createBackup(clusterId: number) {
  return twApi<{ backup: Backup }>(`/dbs/${clusterId}/backups`, {
    method: "POST",
  });
}

// List backups
export async function listBackups(clusterId: number) {
  return twApi<{ backups: Backup[] }>(`/dbs/${clusterId}/backups`);
}

// Restore from backup
export async function restoreBackup(clusterId: number, backupId: number) {
  return twApi(`/dbs/${clusterId}/backups/${backupId}`, {
    method: "PUT",
    body: JSON.stringify({ action: "restore" }),
  });
}
```

---

## Implementation Checklist

### Phase 1: Basic Integration
- [ ] Get Timeweb API token
- [ ] Install Python SDK
- [ ] Test DB cluster creation manually
- [ ] Test S3 bucket creation manually
- [ ] Create provisioning service

### Phase 2: Multi-Tenancy
- [ ] Implement shared DB schema isolation
- [ ] Implement connection pooling
- [ ] Create customer → resource mapping table
- [ ] Build provisioning API endpoint

### Phase 3: Management
- [ ] Usage tracking per customer
- [ ] Automatic tier limit enforcement
- [ ] Upgrade/downgrade flow
- [ ] Backup management

### Phase 4: Production
- [ ] Monitoring & alerting
- [ ] Error handling & retries
- [ ] Rate limit handling
- [ ] Documentation for customers

---

## API Reference

### OpenAPI Spec

Full API specification:
```
https://timeweb.cloud/api-docs-data/bundle.json
```

### Documentation Links

- [Timeweb API Docs](https://timeweb.cloud/api-docs)
- [DBaaS Documentation](https://timeweb.cloud/docs/dbaas)
- [S3 Storage Docs](https://timeweb.cloud/docs/s3-storage)
- [Terraform Provider](https://registry.terraform.io/providers/timeweb-cloud/timeweb-cloud/latest/docs)
- [Python SDK](https://github.com/timeweb-cloud/sdk-python)
- [Go SDK](https://github.com/timeweb-cloud/sdk-go)

---

## Environment Variables

```bash
# Timeweb Cloud API
TIMEWEB_CLOUD_TOKEN=your_jwt_token_here

# S3 Storage (for AWS SDK compatibility)
TIMEWEB_S3_ENDPOINT=https://s3.timeweb.cloud
TIMEWEB_S3_REGION=ru-1
TIMEWEB_S3_ACCESS_KEY=your_access_key
TIMEWEB_S3_SECRET_KEY=your_secret_key

# Database defaults
TIMEWEB_DB_LOCATION=ru-1
TIMEWEB_DEFAULT_PRESET_ID=123  # Your chosen preset
```
