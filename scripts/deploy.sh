#!/bin/bash
set -e

echo "🚀 Deploying masukptn to Fly.io..."

# Check if FLY_API_TOKEN is set
if [ -z "$FLY_API_TOKEN" ]; then
  echo "Error: FLY_API_TOKEN not set"
  echo "Run: export FLY_API_TOKEN=your_token"
  exit 1
fi

# Deploy with build arguments for NEXT_PUBLIC_ variables
flyctl deploy \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo "✅ Deployment complete!"
flyctl status
