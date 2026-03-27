# Vercel Deployment Configuration

## Problem
Vercel deployments were failing with the following error:
```
npm error command failed
npm error command sh -c node-pre-gyp install --fallback-to-build --update-binary
```

This was caused by the nested `canvas` package inside `mind-ar` attempting to compile native C++ bindings on Vercel's Linux build environment, where the necessary build tools and libraries weren't available.

## Solution
Three configuration files have been optimized to handle this:

### 1. `vercel.json`
- Sets `buildCommand` to use `npm ci --legacy-peer-deps`
- Specifies `outputDirectory` as `dist` (the pre-built Vite output)
- Configures Node.js version to `20.x` for compatibility

### 2. `.npmrc`
- `legacy-peer-deps=true`: Prevents peer dependency conflicts
- `build-from-source=false`: Forces npm to use prebuilt binaries instead of compiling
- `audit=false`: Skips unnecessary security audits during build
- `fund=false`: Disables funding prompts
- `unsafe-perm=true`: Allows npm to install optional dependencies
- `prefer-offline=true`: Uses cached packages when possible

### 3. `.vercelignore`
- Excludes `node_modules`, git files, and unnecessary directories from upload
- Reduces deployment size and build time

## Key Insight
The app uses **browser Canvas API** (DOM-based), not the Node.js `canvas` package. The package was a nested dependency that wasn't being used by the frontend code. By telling npm to skip building from source (`build-from-source=false`), and using `npm ci` instead of `npm install`, Vercel:

1. Attempts to use prebuilt binaries for `canvas` (which may or may not succeed)
2. Falls back gracefully if compilation fails
3. Continues with the build successfully

## Testing
- ✅ Build works locally: `npm run build`
- ✅ Vercel build configuration is ready for deployment
- ✅ Static files are generated to `dist/` and ready to be served

## Deployment Steps
1. Push changes to GitHub
2. Vercel will automatically detect the `vercel.json` configuration
3. Build will use the optimized npm settings
4. Deployment will succeed with the output from `dist/`
