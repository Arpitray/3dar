#!/bin/bash
set -e
echo '=== Vercel Build Start ==='
npm ci --legacy-peer-deps
npm run build
rm -rf node_modules/mind-ar/node_modules/canvas 2>/dev/null || true
echo '=== Build Complete ==='
exit 0
