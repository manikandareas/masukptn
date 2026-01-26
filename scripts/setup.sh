#!/bin/bash
set -e

echo "🔧 Setting up masukptn on Fly.io..."

# Launch the app (interactive)
flyctl launch

# Set secrets (prompt for values)
echo "Setting secrets..."
flyctl secrets set DATABASE_URL
flyctl secrets set SUPABASE_SERVICE_ROLE_KEY

# Set region to Singapore (closest to Indonesia)
flyctl regions set sin

echo "✅ Setup complete!"
echo "Run './scripts/deploy.sh' to deploy"
