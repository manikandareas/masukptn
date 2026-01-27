# Deploying masukptn to Fly.io

## GitHub Actions Setup

To enable automatic deployment on push to main:

### 1. Generate Fly.io API Token

```bash
flyctl auth token
```

Copy the output token.

### 2. Configure GitHub Secrets

Go to: `https://github.com/your-org/masukptn/settings/secrets/actions`

Add the following secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `FLY_API_TOKEN` | Fly.io authentication token | Run `flyctl auth token` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | From Supabase dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | From Supabase dashboard |

### 3. Verify

Push to main branch and check the Actions tab for successful deployment.

## Prerequisites

1. Install flyctl:
   ```bash
   brew install flyctl
   ```

2. Authenticate:
   ```bash
   flyctl auth signup
   ```

## Initial Setup

Run the setup script:
```bash
./scripts/setup.sh
```

Or manually:
```bash
flyctl launch
flyctl regions set sin
```

## Setting Secrets

Set required environment secrets:

```bash
flyctl secrets set DATABASE_URL="postgresql://..."
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Deployment

### Deploy manually:
```bash
./scripts/deploy.sh
```

### Or use flyctl directly:
```bash
flyctl deploy \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

## Monitoring

- View logs: `flyctl logs -a masukptn`
- Check status: `flyctl status -a masukptn`
- Open app: `flyctl apps open masukptn`
- SSH console: `flyctl ssh console -a masukptn`

## Scaling

### Adjust memory:
```bash
flyctl scale memory 1024 -a masukptn
```

### Adjust CPU:
```bash
flyctl scale count 2 -a masukptn
```

## Troubleshooting

### Out of memory:
```bash
flyctl scale memory 1024 -a masukptn
```

### View recent logs:
```bash
flyctl logs -a masukptn --line-limit 50
```

### Rebuild without cache:
```bash
flyctl deploy --no-cache
```

---

## Environment Variables in Docker

> **Question:** Why is `DATABASE_URL` not in the Dockerfile even though the app uses it?

**Answer:** This is **correct and intentional**. Here's why:

### Two Types of Environment Variables

There are **two types** of environment variables in this setup:

#### 1. Build-Time Variables (NEXT_PUBLIC_*)

These are baked into the Docker image during build:

```dockerfile
# In Dockerfile - Stage 2: Builder
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
```

**Why build-time?**
- Next.js `NEXT_PUBLIC_*` variables are **inlined into the client-side JavaScript bundle** during `bun run build`
- They are exposed to the browser, so they must be set at build time
- Cannot be changed at runtime without rebuilding the image

**How to pass:**
```bash
flyctl deploy \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="..." \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

#### 2. Runtime Variables (DATABASE_URL)

These are injected when the container starts:

```dockerfile
# NOT in Dockerfile - set via Fly.io secrets
# DATABASE_URL is read at runtime by Node.js
```

**Why runtime?**
- `DATABASE_URL` is **server-side only** - never exposed to the browser
- Read by Node.js when `process.env.DATABASE_URL` is accessed
- Can be changed via `flyctl secrets set` without rebuilding

**How to set:**
```bash
flyctl secrets set DATABASE_URL="postgresql://..."
```

### Current Configuration Summary

| Variable Type | When | Where | Why |
|---------------|------|-------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Build | Dockerfile ARG/ENV | Inlined into client bundle |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build | Dockerfile ARG/ENV | Inlined into client bundle |
| `DATABASE_URL` | Runtime | Fly.io secrets | Server-side only, sensitive |

### Why This Design is Correct

**Security:** Database credentials should never be in the Docker image or in git.

**Flexibility:** Can change `DATABASE_URL` without rebuilding.

### Verification Commands

Check current Fly.io secrets:
```bash
flyctl secrets list -a masukptn
```

Set DATABASE_URL if not set:
```bash
flyctl secrets set DATABASE_URL="your-connection-string" -a masukptn
```

Deploy with build args:
```bash
flyctl deploy \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
```
