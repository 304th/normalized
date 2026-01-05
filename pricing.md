# Pricing & Unit Economics

## Infrastructure Costs (Timeweb Cloud)

### PostgreSQL Managed DB

| Config | vCPU | RAM | Disk | Cost/mo |
|--------|------|-----|------|---------|
| Cloud DB 1/1/8 | 1 | 1GB | 8GB | 380 |
| Cloud DB 1/2/20 | 1 | 2GB | 20GB | 600 |
| Cloud DB 2/2/30 | 2 | 2GB | 30GB | 1,050 |
| Cloud DB 2/4/40 | 2 | 4GB | 40GB | 1,575 |
| Cloud DB 4/8/80 | 4 | 8GB | 80GB | 2,775 |
| Cloud DB 8/16/220 | 8 | 16GB | 220GB | 6,000 |

### S3 Object Storage

| Item | Cost |
|------|------|
| Storage | ~2/GB/mo |
| Bulk bucket | 3,999 for 2TB |
| Egress (first 100GB) | Free |
| Egress (over 100GB) | 1/GB |
| API requests | Free |

### Compute (API/Auth/Edge)

| Config | vCPU | RAM | Cost/mo |
|--------|------|-----|---------|
| Minimal | 1 | 1GB | 400 |
| Small | 2 | 2GB | 800 |
| Medium | 2 | 4GB | 1,400 |
| Large | 4 | 8GB | 2,600 |

---

## Storage Cost Breakdown (per GB)

### Database Storage

| Tier | DB Config | Total Disk | Shared Users | Your Cost/GB | Charge/GB | Margin |
|------|-----------|------------|--------------|--------------|-----------|--------|
| Free | Cloud DB 2/4/40 | 40GB | 80 users (0.5GB each) | 39/GB | 0 | -100% |
| Pro | Cloud DB 2/4/40 | 40GB | 5 users (8GB each) | 39/GB | 124/GB | 68% |
| Pro+ | Cloud DB 4/8/80 | 80GB | 3 users (25GB each) | 35/GB | 100/GB | 65% |
| Business | Cloud DB 8/16/220 | 220GB | 2 users (100GB each) | 27/GB | 100/GB | 73% |
| Enterprise | Dedicated | custom | 1 user | 27/GB | 50-100/GB | 50-73% |

**Calculation**: Cost/GB = (DB instance cost) / (total disk GB)
- Cloud DB 2/4/40: 1,575 / 40GB = 39/GB
- Cloud DB 4/8/80: 2,775 / 80GB = 35/GB
- Cloud DB 8/16/220: 6,000 / 220GB = 27/GB

### Object Storage (S3)

| Tier | Included | Your Cost/GB | Charge/GB | Overage Charge | Margin |
|------|----------|--------------|-----------|----------------|--------|
| Free | 1GB | 2 | 0 | n/a | -100% |
| Pro | 25GB | 2 | 40 | 20/GB | 95% |
| Pro+ | 100GB | 2 | 25 | 20/GB | 92% |
| Business | 500GB | 2 | 20 | 15/GB | 90% |

**Calculation**: Using bulk rate 3,999/2TB = 2/GB

### Bandwidth/Egress

| Tier | Included | Your Cost/GB | Charge/GB | Margin |
|------|----------|--------------|-----------|--------|
| Free | 10GB | 0 (free tier) | 0 | 0% |
| Pro | 50GB | 0-1 | 5 | 80-100% |
| Pro+ | 200GB | 1 | 5 | 80% |
| Business | 1TB | 1 | 3 | 67% |

---

## Pricing Tiers

### Free (0/mo)

**Included:**
- 500MB database
- 1GB storage
- 50K API req/mo
- 10K auth users
- Community support (Telegram)
- "Powered by X" badge
- Pauses after 7 days inactive

**Your cost**: 15-30/mo (amortized across shared infra)
**Margin**: -100%

### Pro (990/mo)

**Included:**
- 8GB database
- 25GB storage
- 500K API req/mo
- 100K auth users
- Realtime subscriptions
- Edge functions (100K invocations)
- Daily backups (7 days)
- Email support

**Your cost**: 380-500/mo
**Gross profit**: 490-610/mo
**Margin**: 50-62%

### Pro+ (2,490/mo)

**Included:**
- 25GB database
- 100GB storage
- 2M API req/mo
- Unlimited auth users
- Realtime + Edge unlimited
- PITR backups (14 days)
- Priority support
- Custom domain

**Your cost**: 1,050/mo
**Gross profit**: 1,440/mo
**Margin**: 58%

### Business (9,990/mo)

**Included:**
- 100GB database
- 500GB storage
- 10M API req/mo
- Read replicas
- 30-day PITR
- SLA 99.9%
- Dedicated support

**Your cost**: 4,800/mo
**Gross profit**: 5,190/mo
**Margin**: 52%

### Enterprise (50,000+/mo)

**Included:**
- Dedicated cluster
- Multi-region
- Custom SLA
- Premium support
- On-prem option

**Your cost**: 15,000-20,000/mo
**Gross profit**: 30,000-35,000/mo
**Margin**: 60-70%

---

## Overage Pricing

| Resource | Your Cost | Charge | Margin |
|----------|-----------|--------|--------|
| +1GB database | 27-39 | 50 | 28-46% |
| +1GB storage | 2 | 20 | 90% |
| +1GB bandwidth | 1 | 5 | 80% |
| +100K API calls | 5 | 10 | 50% |
| +100K edge invocations | 10 | 15 | 33% |
| +10K auth MAU | 5 | 50 | 90% |

---

## Multi-Tenancy Strategy

Key to margins: shared infrastructure

```
Free:     100 users -> 1 shared PG (1,575)  = 16/user
Pro:      10 users  -> 1 shared PG (2,775)  = 277/user
Pro+:     3 users   -> 1 shared PG (2,775)  = 925/user
Business: 2 users   -> 1 shared PG (6,000)  = 3,000/user
Enterprise: dedicated
```

Use schema isolation or row-level security, not separate instances.

---

## Breakeven Analysis

**Fixed monthly costs:**
- Base infra (always-on): 5,000
- Domains/SSL/services: 2,000
- **Total fixed**: 7,000/mo

**Breakeven scenarios:**
- 15 Pro users (990 x 15 = 14,850)
- 3 Business users (9,990 x 3 = 29,970)
- 1 Enterprise user (50,000+)

---

## Summary: Cost vs Charge per GB

| Resource | Your Cost | Free | Pro | Pro+ | Business |
|----------|-----------|------|-----|------|----------|
| DB storage | 27-39/GB | 0 | 124/GB | 100/GB | 100/GB |
| S3 storage | 2/GB | 0 | 40/GB | 25/GB | 20/GB |
| Bandwidth | 0-1/GB | 0 | 5/GB | 5/GB | 3/GB |

**Best margins**: S3 storage (90%+), Auth MAU overages (90%), Bandwidth (80%)
**Worst margins**: Database (28-46% on overages), Edge functions (33%)

---

## Sources

- [Timeweb Cloud Pricing](https://timeweb.cloud/prices)
- [Timeweb S3 Storage](https://timeweb.cloud/services/s3-storage)
- [Timeweb PostgreSQL](https://timeweb.cloud/services/postgresql)
- [Selectel PostgreSQL](https://selectel.ru/services/cloud/managed-databases/postgresql/)
- [Supabase Pricing](https://supabase.com/pricing) (reference)
