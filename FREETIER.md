# Free Tier Conversion Strategy

## Conversion Benchmarks

| Audience | Conversion Rate |
|----------|-----------------|
| General SaaS | 5-10% |
| Developer tools | 2-5% |
| Opt-in free trial | ~25% |
| Freemium | 2-5% |

---

## Tier Structure

### Free (0/mo) - "Build & Learn"

**Included:**
- 500MB database
- 1GB storage
- 50K API requests/mo
- Auth (10K MAU)
- REST API
- Community support (Telegram)

**Limitations (upgrade triggers):**
- Pauses after 7 days inactive
- "Powered by X" badge
- No Realtime subscriptions
- No Edge functions
- No backups
- No custom domain

### Pro (990/mo) - "Ship to Production"

**Everything in Free, plus:**
- 8GB database (16x)
- 25GB storage (25x)
- 500K API/mo (10x)
- Realtime subscriptions
- Edge functions (100K invocations)
- Daily backups (7 days)
- No pause, no badge
- Email support

**Still gated:**
- No PITR
- No custom domain
- No read replicas

### Pro+ (2,490/mo) - "Scale"

**Everything in Pro, plus:**
- 25GB database
- 100GB storage
- 2M API/mo
- PITR (14 days)
- Custom domain
- Longer log retention (14 days)
- Priority support
- Webhooks

### Business (9,990/mo) - "Enterprise-Ready"

**Everything in Pro+, plus:**
- 100GB database
- 500GB storage
- 10M API/mo
- Read replicas
- PITR (30 days)
- SLA 99.9%
- Dedicated support
- 152-FZ compliance docs

---

## Hard Limits (Forces Upgrade)

| Limit | Free | Pro | Why It Works |
|-------|------|-----|--------------|
| Project pause | 7 days inactive | Never | App goes down = panic |
| DB size | 500MB | 8GB | Read-only mode at limit |
| Storage | 1GB | 25GB | Can't upload files |
| Realtime | No | Yes | Need live updates? Pay |
| Edge functions | No | Yes | Need serverless? Pay |
| Backups | No | Daily | Lose data once = lesson |
| Custom domain | No | Pro+ | Production launch = pay |
| Badge | Yes | No | Embarrassment tax |

## Soft Limits (Encourages Upgrade)

| Limit | Free | Pro | Trigger |
|-------|------|-----|---------|
| API requests | 50K/mo | 500K/mo | Traffic spike |
| Auth MAU | 10K | 100K | User growth |
| Bandwidth | 10GB | 50GB | Media-heavy app |
| Support | Community | Email | Need help fast |

---

## Conversion Tactics

### Tier 1: Product Friction (Automatic)

| Tactic | Implementation | Impact |
|--------|----------------|--------|
| Pause inactive projects | 7 days -> banner -> pause | High |
| Read-only at DB limit | Can't INSERT when full | Very high |
| Usage warnings in dashboard | "85% storage used" | Medium |
| Feature walls | Click Realtime -> upgrade modal | Medium |

### Tier 2: Messaging (Semi-Automatic)

| Tactic | When | Message |
|--------|------|---------|
| Usage warning email | 70% of limit | "You're growing! Upgrade before limits" |
| Pause warning | Day 5 inactive | "Project pauses in 2 days" |
| Feature teaser | Weekly digest | "Pro users ship 3x faster with Edge Functions" |
| Success story | Monthly | "How X launched with Pro tier" |

### Tier 3: Human Touch (High-Value Users)

| Tactic | Trigger | Action |
|--------|---------|--------|
| Outreach to power users | >50% limits used | Personal email |
| Upgrade call | Enterprise signals | Demo call |
| Winback | Churned after trial | Discount offer |

---

## What Supabase Gates (Reference)

| Feature | Free | Pro ($25) | Team ($599) |
|---------|------|-----------|-------------|
| Project pause | 7 days | Never | Never |
| Database | 500MB | 8GB | 8GB |
| PITR backups | No | No | Yes |
| Branching | No | Yes | Yes |
| Log retention | 1 day | 7 days | 28 days |
| Support | Community | Email | Priority |
| SSO | No | No | Yes |
| SOC 2 | No | No | Yes |

---

## Feature Gating Strategy

### Free (adoption):
- Basic DB, storage, auth
- REST API
- Docs & community

### Pro 990 (production):
- Realtime <- killer feature
- Edge functions <- killer feature
- Backups <- peace of mind
- No pause <- production requirement
- No badge <- pride
- Email support

### Pro+ 2,490 (scale):
- PITR
- Custom domain
- Webhooks
- Priority support

### Business 9,990 (enterprise):
- Read replicas
- SLA
- Compliance docs
- Dedicated support

---

## Conversion Funnel

```
Signups -> Activated (30%) -> Hit limits (5%) -> Upgrade
```

### Math

```
1,000 signups
  | 30% activate
300 active free users
  | 5% convert
15 Pro users
  | 20% upgrade further
3 Pro+/Business users
```

### To Get 2,000 Paying Users

```
2,000 / 5% conversion = 40,000 active free users
40,000 / 30% activation = 133,000 signups needed
```

---

## Key Upgrade Triggers

### Strongest (panic):
1. Project pause (app down)
2. Read-only mode (DB full)
3. Data loss scare (no backups)

### Medium (need):
4. Realtime needed for feature
5. Edge functions for API
6. Traffic spike hits limits

### Weak (nice-to-have):
7. Remove badge
8. Custom domain
9. Faster support

---

## Email Sequences

### Activation (Day 1-7)
- Day 1: Welcome + quick start
- Day 3: First project tips
- Day 7: "Your project pauses soon"

### Usage-Based
- 50% DB: "Growing nicely!"
- 70% DB: "Running low on space"
- 90% DB: "Upgrade to avoid read-only"
- 100% DB: "Project is read-only - upgrade now"

### Re-engagement
- Day 5 inactive: "Miss you, project pauses in 2 days"
- Day 7 paused: "Project paused - reactivate"
- Day 14 paused: "Last chance before deletion"

### Feature Upsell (Monthly)
- "Ship faster with Realtime"
- "Secure your data with backups"
- "Go live with custom domain"

---

## Sources

- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Billing FAQ](https://supabase.com/docs/guides/platform/billing-faq)
- [Lenny's Newsletter - Conversion Rates](https://www.lennysnewsletter.com/p/what-is-a-good-free-to-paid-conversion)
- [Userpilot - SaaS Conversion](https://userpilot.com/blog/saas-average-conversion-rate/)
