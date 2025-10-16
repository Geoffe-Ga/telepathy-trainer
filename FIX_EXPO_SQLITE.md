# Fix for expo-sqlite v14.0.6 Module Resolution Issue

## Problem
The `expo-sqlite` package v14.0.6 has a bug where the compiled JavaScript files use ES module syntax but don't include `.js` extensions in import paths. This causes Node.js to fail when resolving modules.

## Solution

### Option 1: Manual Fix (Quick - Temporary)

Run this command after every `npm install`:

```bash
# Fix the index.js file
sed -i '' "s|from './SQLiteDatabase'|from './SQLiteDatabase.js'|g" node_modules/expo-sqlite/build/index.js
sed -i '' "s|from './SQLiteStatement'|from './SQLiteStatement.js'|g" node_modules/expo-sqlite/build/index.js
sed -i '' "s|from './hooks'|from './hooks.js'|g" node_modules/expo-sqlite/build/index.js
```

### Option 2: Use Patch Package (Recommended - Permanent)

1. Install patch-package:
```bash
npm install -D patch-package postinstall-postinstall
```

2. Add to package.json scripts:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

3. Create patch:
```bash
# First apply the manual fix above, then:
npx patch-package expo-sqlite
```

This will create `patches/expo-sqlite+14.0.6.patch` that auto-applies after every install.

### Option 3: Downgrade expo-sqlite (Alternative)

If the above doesn't work, downgrade to a stable version:

```bash
npm install expo-sqlite@13.4.0
```

Note: This may require code changes as v13 uses different API.

## Current Status

The manual fix has been applied. You should now be able to run:

```bash
npx expo start
```

## If Issues Persist

1. Clear all caches:
```bash
rm -rf node_modules
rm -rf .expo
rm package-lock.json
npm install
# Apply manual fix again
```

2. Check Node version (requires v18+):
```bash
node --version
```

3. Report issue to Expo:
https://github.com/expo/expo/issues
