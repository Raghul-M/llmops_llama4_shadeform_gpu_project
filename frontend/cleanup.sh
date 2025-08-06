#!/bin/bash

echo "🧹 Cleaning up unused files in frontend..."

# Remove macOS system files
echo "Removing .DS_Store files..."
find . -name ".DS_Store" -delete

# Remove unused lock file
echo "Removing bun.lockb..."
rm -f bun.lockb

# Remove unused CSS file
echo "Removing App.css..."
rm -f src/App.css

# Remove unused public files
echo "Removing placeholder.svg..."
rm -f public/placeholder.svg

# Remove unused hook
echo "Removing use-mobile.tsx..."
rm -f src/hooks/use-mobile.tsx

echo "✅ Cleanup complete!"
echo ""
echo "📊 Removed files:"
echo "   - .DS_Store files (macOS system files)"
echo "   - bun.lockb (unused lock file)"
echo "   - src/App.css (unused CSS)"
echo "   - public/placeholder.svg (unused asset)"
echo "   - src/hooks/use-mobile.tsx (unused hook)" 