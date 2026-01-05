# normalized.ru Economics

## Pricing Tiers

| Tier | Monthly | Annual | Database | Storage | Requests |
|------|---------|--------|----------|---------|----------|
| Free | 0 ₽ | 0 ₽ | 500 MB | 1 GB | 50k/mo |
| Pro | 1,490 ₽ | 17,880 ₽ | 8 GB | 50 GB | Unlimited |
| Team | 4,990 ₽ | 59,880 ₽ | 32 GB | 200 GB | Unlimited |

---

## Russian Cloud Provider Comparison

### Market Share (2024)

| Provider | Market Share | Notes |
|----------|--------------|-------|
| Yandex Cloud | 25% | largest public cloud |
| VK Cloud | 7% | VK ecosystem |
| билайн cloud | 7% | telco-backed |
| Selectel | 6% | infra specialist |
| Cloud.ru | 4% | ex-SberCloud |

### Startup Infrastructure Bundle (monthly)

| Provider | VPS | GitLab | Runner | PostgreSQL | K8s | S3 | **Total** |
|----------|-----|--------|--------|------------|-----|-----|----------|
| **Timeweb** | 530 ₽ | 1,980 ₽ | 4,300 ₽ | 3,160 ₽ | 12,240 ₽ | 1,278 ₽ | **23,488 ₽** |
| **Selectel** | 1,207 ₽ | 5,425 ₽ | 11,676 ₽ | 6,900 ₽ | 27,360 ₽ | 1,143 ₽ | **53,711 ₽** |
| **VK Cloud** | 1,293 ₽ | 5,702 ₽ | 11,064 ₽ | 7,013 ₽ | 29,186 ₽ | 1,056 ₽ | **55,314 ₽** |
| **Yandex Cloud** | 2,712 ₽ | 6,845 ₽ | 13,317 ₽ | 8,931 ₽ | 28,397 ₽ | 1,083 ₽ | **61,285 ₽** |
| **Cloud.ru** | ~2,000 ₽ | ~6,000 ₽ | ~12,000 ₽ | ~8,000 ₽ | ~30,000 ₽ | ~1,200 ₽ | **~59,000 ₽** |

Source: [miops.dev](https://miops.dev/blog/clouds), [timeweb](https://timeweb.cloud/blog/top-5-rossijskih-oblachnyh-platform)

### Compute Pricing

| Provider | vCPU/hour | RAM GB/hour | vCPU/mo | RAM GB/mo |
|----------|-----------|-------------|---------|-----------|
| **Yandex Cloud** | 0.70 ₽ | 0.24 ₽ | 505 ₽ | 176 ₽ |
| **VK Cloud** | ~0.60 ₽ | ~0.22 ₽ | ~430 ₽ | ~160 ₽ |
| **Selectel** | ~0.45 ₽ | ~0.18 ₽ | ~320 ₽ | ~130 ₽ |
| **Cloud.ru** | ~0.65 ₽ | ~0.23 ₽ | ~470 ₽ | ~165 ₽ |
| **Timeweb** | ~0.20 ₽ | ~0.10 ₽ | ~150 ₽ | ~75 ₽ |

VK Cloud example: 4 vCPU + 8GB RAM + 150GB SSD = ~355 ₽/day = ~11,600 ₽/mo

### Managed PostgreSQL

| Provider | Price/GB/mo | Min config | 8GB DB | 32GB DB |
|----------|-------------|------------|--------|---------|
| **Selectel** | ~60-100 ₽ | 6,900 ₽ | ~7,000 ₽ | ~15,000 ₽ |
| **VK Cloud** | ~70-110 ₽ | 7,013 ₽ | ~8,000 ₽ | ~18,000 ₽ |
| **Cloud.ru** | ~75-120 ₽ | ~8,000 ₽ | ~9,000 ₽ | ~20,000 ₽ |
| **Yandex Cloud** | ~80-150 ₽ | 8,931 ₽ | ~10,000 ₽ | ~25,000 ₽ |
| **Timeweb** | ~40-70 ₽ | 3,160 ₽ | ~4,000 ₽ | ~10,000 ₽ |
| **Self-hosted** | ~30-50 ₽ | ~2,000 ₽ | ~3,000 ₽ | ~8,000 ₽ |

### Object Storage (S3)

| Provider | Storage/GB/mo | Egress/GB | Free tier |
|----------|---------------|-----------|-----------|
| **Timeweb** | 0.79 ₽ | 0.50 ₽ | — |
| **Selectel** | 1.20-2.00 ₽ | 0.80-1.20 ₽ | 3 TB egress |
| **VK Cloud** | 1.40-2.20 ₽ | 0.90-1.30 ₽ | 5,000 ₽ trial |
| **Cloud.ru** | 1.50-2.50 ₽ | 1.00-1.50 ₽ | free tier (limited) |
| **Yandex Cloud** | 1.50-2.50 ₽ | 1.00-1.50 ₽ | 10 GB |

### Provider Summary

| Provider | Best for | 152-FZ | SLA | Pros | Cons |
|----------|----------|--------|-----|------|------|
| **Yandex Cloud** | Enterprise, scale | ✓ | 99.95% | best managed services, Terraform | expensive |
| **VK Cloud** | Mid-market | ✓ | 99.9% | good ecosystem, 1С support | UI complexity |
| **Selectel** | Infra-focused | ✓ | 99.98% | dedicated servers, CDN | fewer PaaS |
| **Cloud.ru** | Gov, finance | ✓ (FSB/FSTEC) | 99.9% | max compliance, AI/ML | enterprise pricing |
| **Timeweb** | Startups, budget | ✓ | 99.9% | cheapest, simple | limited features |

---

## Infrastructure Scenarios

### Scenario A: MVP / Bootstrap (~10k ₽/mo)

| Component | Config | Provider | Monthly |
|-----------|--------|----------|---------|
| API servers | 2x (2c/4GB) | Timeweb | 600 ₽ |
| PostgreSQL | self-hosted (4c/8GB) | Timeweb | 1,500 ₽ |
| Realtime/WS | 2x (2c/2GB) | Timeweb | 600 ₽ |
| Object Storage | 200 GB | Timeweb | 160 ₽ |
| Load Balancer | basic | Timeweb | 150 ₽ |
| Backups | 50 GB | — | 50 ₽ |
| **TOTAL** | | | **~3,000 ₽/mo** |

### Scenario B: Standard / Traction (~35k ₽/mo)

| Component | Config | Provider | Monthly |
|-----------|--------|----------|---------|
| API servers | 2x (4c/8GB) | Selectel | 2,500 ₽ |
| PostgreSQL | managed 16GB | Selectel | 10,000 ₽ |
| Realtime/WS | 2x (4c/8GB) | Selectel | 2,500 ₽ |
| Object Storage | 1 TB | Selectel | 1,500 ₽ |
| K8s cluster | managed | Selectel | 15,000 ₽ |
| Load Balancer | HA | Selectel | 2,000 ₽ |
| Monitoring | basic | — | 1,500 ₽ |
| **TOTAL** | | | **~35,000 ₽/mo** |

### Scenario C: Growth / Scale (~100k ₽/mo)

| Component | Config | Provider | Monthly |
|-----------|--------|----------|---------|
| API servers | 4x (8c/16GB) | Yandex | 15,000 ₽ |
| PostgreSQL | MDB HA (64GB) | Yandex | 35,000 ₽ |
| Realtime/WS | 4x (8c/16GB) | Yandex | 15,000 ₽ |
| Object Storage | 5 TB | Yandex | 10,000 ₽ |
| CDN | 10 TB egress | Yandex | 8,000 ₽ |
| K8s cluster | managed HA | Yandex | 12,000 ₽ |
| Monitoring + Logs | full | Yandex | 5,000 ₽ |
| **TOTAL** | | | **~100,000 ₽/mo** |

### Scenario D: Enterprise (~300k ₽/mo)

| Component | Config | Provider | Monthly |
|-----------|--------|----------|---------|
| API servers | 8x (16c/32GB) | Cloud.ru | 50,000 ₽ |
| PostgreSQL | HA cluster (256GB) | Cloud.ru | 120,000 ₽ |
| Realtime/WS | 8x (16c/32GB) | Cloud.ru | 50,000 ₽ |
| Object Storage | 20 TB | Cloud.ru | 40,000 ₽ |
| CDN | 50 TB egress | Cloud.ru | 25,000 ₽ |
| K8s | multi-zone HA | Cloud.ru | 30,000 ₽ |
| Security/DDoS | premium | Cloud.ru | 15,000 ₽ |
| **TOTAL** | | | **~330,000 ₽/mo** |

---

## Per-User Unit Economics

### Optimized Model (Timeweb/Selectel)

| Tier | DB | Storage | Backup | BW | **COGS** | Revenue | **Margin** |
|------|-----|---------|--------|-----|----------|---------|------------|
| Free | 15 ₽ | 1 ₽ | 1 ₽ | 3 ₽ | 20 ₽ | 0 ₽ | **-20 ₽** |
| Pro | 250 ₽ | 40 ₽ | 10 ₽ | 30 ₽ | 330 ₽ | 1,490 ₽ | **+1,160 ₽ (78%)** |
| Team | 1,000 ₽ | 160 ₽ | 40 ₽ | 100 ₽ | 1,300 ₽ | 4,990 ₽ | **+3,690 ₽ (74%)** |

### Standard Model (VK Cloud)

| Tier | DB | Storage | Backup | BW | **COGS** | Revenue | **Margin** |
|------|-----|---------|--------|-----|----------|---------|------------|
| Free | 25 ₽ | 2 ₽ | 1 ₽ | 5 ₽ | 33 ₽ | 0 ₽ | **-33 ₽** |
| Pro | 400 ₽ | 80 ₽ | 15 ₽ | 50 ₽ | 545 ₽ | 1,490 ₽ | **+945 ₽ (63%)** |
| Team | 1,600 ₽ | 320 ₽ | 60 ₽ | 150 ₽ | 2,130 ₽ | 4,990 ₽ | **+2,860 ₽ (57%)** |

### Premium Model (Yandex/Cloud.ru)

| Tier | DB | Storage | Backup | BW | **COGS** | Revenue | **Margin** |
|------|-----|---------|--------|-----|----------|---------|------------|
| Free | 50 ₽ | 3 ₽ | 2 ₽ | 5 ₽ | 60 ₽ | 0 ₽ | **-60 ₽** |
| Pro | 800 ₽ | 100 ₽ | 20 ₽ | 60 ₽ | 980 ₽ | 1,490 ₽ | **+510 ₽ (34%)** |
| Team | 3,200 ₽ | 400 ₽ | 80 ₽ | 180 ₽ | 3,860 ₽ | 4,990 ₽ | **+1,130 ₽ (23%)** |

---

## Operational Costs

| Category | Monthly | Notes |
|----------|---------|-------|
| Infrastructure | 3,000-330,000 ₽ | see scenarios |
| Payment processing | 3-5% revenue | YooKassa, Tinkoff, CloudPayments |
| Legal/Accounting | 10,000-30,000 ₽ | 152-FZ, bookkeeping |
| Support | 0-100,000 ₽ | scales with users |
| Marketing/CAC | variable | target CAC < 4,000 ₽ |
| Domain + SSL | 300 ₽ | normalized.ru |

---

## Break-even Analysis

### Scenario A: Solo, budget infra (3k ₽ fixed)

| Users (F/P/T) | Revenue | COGS | Fixed | **Net** |
|---------------|---------|------|-------|---------|
| 50/3/0 | 4,470 ₽ | 1,990 ₽ | 3,000 ₽ | **-520 ₽** |
| 100/5/1 | 12,440 ₽ | 4,300 ₽ | 3,000 ₽ | **+5,140 ₽** |

**Break-even: ~3 Pro users**

### Scenario B: Standard (35k ₽ fixed)

| Users (F/P/T) | Revenue | COGS | Fixed | **Net** |
|---------------|---------|------|-------|---------|
| 200/20/5 | 54,750 ₽ | 18,960 ₽ | 35,000 ₽ | **+790 ₽** |
| 500/50/15 | 149,350 ₽ | 51,800 ₽ | 35,000 ₽ | **+62,550 ₽** |

**Break-even: ~20 Pro users**

### Scenario C: Growth (100k ₽ fixed)

| Users (F/P/T) | Revenue | COGS | Fixed | **Net** |
|---------------|---------|------|-------|---------|
| 1000/100/30 | 298,700 ₽ | 128,200 ₽ | 100,000 ₽ | **+70,500 ₽** |
| 2000/200/50 | 547,400 ₽ | 232,400 ₽ | 100,000 ₽ | **+215,000 ₽** |

**Break-even: ~70 Pro users**

---

## Key Metrics

| Metric | Target |
|--------|--------|
| Free → Pro conversion | 5-10% |
| Monthly churn (Pro) | < 5% |
| Monthly churn (Team) | < 3% |
| LTV Pro (12mo avg) | 12,000 ₽ |
| LTV Team (18mo avg) | 90,000 ₽ |
| CAC Pro | < 4,000 ₽ |
| CAC Team | < 30,000 ₽ |
| LTV:CAC ratio | > 3:1 |
| Payback period | < 4 months |

---

## 12-Month Projections

| Stage | Month | Users (F/P/T) | MRR | Costs | Profit/mo |
|-------|-------|---------------|-----|-------|-----------|
| MVP | 1-3 | 100/5/1 | 12,440 ₽ | 15,000 ₽ | -2,560 ₽ |
| Seed | 4-6 | 300/20/5 | 54,750 ₽ | 25,000 ₽ | +29,750 ₽ |
| Traction | 7-9 | 800/60/15 | 164,250 ₽ | 50,000 ₽ | +114,250 ₽ |
| Growth | 10-12 | 2000/150/40 | 423,350 ₽ | 80,000 ₽ | +343,350 ₽ |

**Year 1 totals:**
- Total revenue: ~2,400,000 ₽
- Total costs: ~600,000 ₽
- Net profit: ~1,800,000 ₽
- Required runway: 20,000-50,000 ₽ (months 1-3)

---

## Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low conversion (F→P) | High | onboarding, feature gates |
| High churn | High | support, feature parity |
| DB cost overruns | Medium | resource limits, overage billing |
| 152-FZ compliance | Medium | legal counsel |
| Competition | Medium | local support, RU-first |
| Provider price hikes | Low | multi-cloud ready |

---

## Provider Recommendations by Stage

| Stage | Primary | Backup | Rationale |
|-------|---------|--------|-----------|
| MVP (0-100) | Timeweb | Selectel | lowest cost, fast setup |
| Traction (100-500) | Selectel | VK Cloud | good balance price/features |
| Growth (500-2000) | VK Cloud | Yandex | mature PaaS, 1С support |
| Scale (2000+) | Yandex Cloud | Cloud.ru | best managed services |
| Enterprise/Gov | Cloud.ru | Yandex | FSB/FSTEC certs |

---

## Sources

- [Yandex Cloud Pricing](https://yandex.cloud/en/docs/compute/pricing)
- [VK Cloud Pricing](https://cloud.vk.com/pricing/)
- [Selectel Pricing](https://vds.selectel.ru/en/pricing.html)
- [Cloud.ru Tariffs](https://cloud.ru/documents/tariffs/index)
- [Timeweb Cloud](https://timeweb.cloud/)
- [miops.dev - Cloud Comparison](https://miops.dev/blog/clouds)
- [Top 5 Russian Cloud Platforms](https://timeweb.cloud/blog/top-5-rossijskih-oblachnyh-platform)
- [Anti-Malware Cloud Review 2025](https://www.anti-malware.ru/analytics/Market_Analysis/Top-10-Russian-Cloud-Platforms)
