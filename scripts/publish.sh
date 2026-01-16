#!/bin/bash
# =============================================================================
# publish.sh - Build, Deploy & Push
# =============================================================================
# Usage: npm run publish
# =============================================================================

set -e

echo ""
echo "========================================"
echo "  PUBLISH - camisetabox.cl"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Build
echo -e "${BLUE}[1/4] Building project...${NC}"
npm run build

# Step 2: Deploy to Hostinger
echo -e "${BLUE}[2/4] Deploying to Hostinger...${NC}"
node scripts/deploy.js

# Step 3: Git add
echo -e "${BLUE}[3/4] Adding changes to git...${NC}"
git add .

# Step 4: Commit and push
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
echo -e "${BLUE}[4/4] Committing and pushing...${NC}"
git commit -m "content: update site ${TIMESTAMP} [skip ci]" || echo "Nothing to commit"
git push origin main || echo "Nothing to push"

echo ""
echo -e "${GREEN}Publish completed!${NC}"
echo "========================================"
