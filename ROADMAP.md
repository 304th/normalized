# normalized.ru Roadmap

## In Progress

- [ ] Frontend polish (dashboard UX)
- [ ] Billing integration (YooKassa/Tinkoff)

## Planned

### Branded Connection URLs

Replace Timeweb host exposure with branded URLs:

**Current:** `postgresql://user:pass@psql-ru-msk-123.timeweb.cloud:5432/db`

**Target:** `postgresql://postgres:[PASS]@db.{slug}.normalized.ru:5432/postgres`

**Implementation:**
1. Wildcard DNS: `*.normalized.ru` → proxy VPS
2. TCP proxy service (Go/Node) on port 5432
3. Lookup slug → Timeweb host from DB
4. Proxy TCP connection transparently

**Complexity:** ~200 LOC + VPS (~500₽/mo)

### Connection Pooling (PgBouncer)

Add pooler endpoint for serverless/edge functions:

- `db.{slug}.normalized.ru:5432` - direct connection
- `pooler.{slug}.normalized.ru:6543` - pooled connection (transaction mode)

### Realtime Subscriptions

WebSocket-based realtime changes (like Supabase Realtime):
- PostgreSQL LISTEN/NOTIFY
- Row-level security integration
- Client SDK support

### Edge Functions

Serverless functions at edge locations:
- Deno runtime
- Direct DB access
- Custom domains

### Storage CDN

S3-compatible storage with CDN:
- Timeweb S3 backend
- Image transformations
- Access policies

## Future

- [ ] Multi-region replication
- [ ] Point-in-time recovery
- [ ] Database branching (preview environments)
- [ ] GraphQL auto-generated API
- [ ] Supabase migration tool
