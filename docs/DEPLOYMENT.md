# Deploying masukptn to Fly.io

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
