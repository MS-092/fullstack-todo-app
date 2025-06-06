# 🔧 Troubleshooting Guide

## Common Installation Issues

### 1. NPM Dependency Conflicts (ERESOLVE)

If you encounter dependency resolution errors during `npm install`, try these solutions in order:

#### Solution 1: Use Compatible Versions (Recommended)
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Install with the updated package.json
npm install
\`\`\`

#### Solution 2: Use Legacy Peer Deps (Quick Fix)
\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

#### Solution 3: Force Resolution (Last Resort)
\`\`\`bash
npm install --force
\`\`\`

#### Solution 4: Use Yarn Instead
\`\`\`bash
# Install yarn if you don't have it
npm install -g yarn

# Install dependencies with yarn
yarn install
\`\`\`

### 2. Specific date-fns Conflict Fix

If you're still having issues with date-fns, manually install compatible versions:

\`\`\`bash
# Remove conflicting packages
npm uninstall date-fns react-day-picker

# Install compatible versions
npm install date-fns@^3.6.0 react-day-picker@^8.10.1
\`\`\`

### 3. Alternative: Remove Date Picker Dependency

If you don't need the date picker functionality, you can remove it:

\`\`\`bash
npm uninstall react-day-picker
\`\`\`

Then remove any date picker imports from the code.

## Environment Setup Issues

### 1. Environment Variables Not Loading
- Ensure `.env.local` is in the root directory
- Restart the development server after adding variables
- Check that variables start with `NEXT_PUBLIC_`

### 2. Supabase Connection Issues
- Verify your Supabase URL and key are correct
- Check that your Supabase project is active
- Ensure Row Level Security policies are set up

## Development Server Issues

### 1. Port Already in Use
\`\`\`bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
\`\`\`

### 2. Module Not Found Errors
\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Restart development server
npm run dev
\`\`\`

## Build Issues

### 1. Build Failures
\`\`\`bash
# Clear all caches
npm cache clean --force
rm -rf .next node_modules package-lock.json

# Reinstall and build
npm install
npm run build
\`\`\`

### 2. TypeScript Errors (if using TS)
\`\`\`bash
# Check TypeScript configuration
npx tsc --noEmit

# Update TypeScript
npm install typescript@latest
\`\`\`

## Database Issues

### 1. Supabase Connection Timeout
- Check your internet connection
- Verify Supabase project status
- Try refreshing your API keys

### 2. RLS Policies Not Working
- Ensure you're authenticated
- Check policy syntax in Supabase dashboard
- Verify user permissions

## Getting Help

If none of these solutions work:

1. **Check the logs**: Look at the full error message in the terminal
2. **Clear everything**: Delete `node_modules`, `.next`, and `package-lock.json`, then reinstall
3. **Use different package manager**: Try yarn or pnpm instead of npm
4. **Check Node.js version**: Ensure you're using Node.js 18 or higher
5. **Create an issue**: If the problem persists, create a GitHub issue with the full error log

## Quick Reset Script

Create this script to quickly reset your development environment:

\`\`\`bash
#!/bin/bash
# reset-dev.sh

echo "🧹 Cleaning up development environment..."

# Remove caches and builds
rm -rf node_modules
rm -rf .next
rm -f package-lock.json
rm -f yarn.lock

# Clear npm cache
npm cache clean --force

echo "📦 Reinstalling dependencies..."
npm install

echo "🚀 Starting development server..."
npm run dev
\`\`\`

Make it executable and run:
\`\`\`bash
chmod +x reset-dev.sh
./reset-dev.sh
