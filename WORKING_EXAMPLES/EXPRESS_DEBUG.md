# Express Server Debugging Documentation

## Problem Summary
Express server on port 3000 returns 404 errors for all routes including `/status`, `/`, and `/photos/`. Server appears to be running but routes are not accessible.

## Error Messages Encountered
1. `404 cannot /GET STATUS`
2. `404 cannot /GET /`
3. `404 cannot /GET /photos/`

## Current Express Configuration

**File:** `src/index.ts`
**Function:** `setupExpressServer()`
**Port:** 3000
**Host:** `0.0.0.0` (all interfaces)

## Key Issues Identified

### 1. Compilation Errors Prevent Server Start
**Problem:** The Electron app has compilation errors that prevent successful startup:
```
ERROR in ./src/index.ts:34:7
TS2322: Type '{ preload: string; contextIsolation: true; enableRemoteModule: false; }' is not assignable to type 'WebPreferences'.
```

**Root Cause:** The app never actually starts successfully, so the Express server never initializes.

### 2. enableRemoteModule Deprecated Property
**File:** `src/index.ts` line 34
**Error:** `enableRemoteModule: false` is deprecated in newer Electron versions
**Fix:** Remove this property from webPreferences

### 3. Renderer File Extension Confusion
**Error:** System tries to compile `renderer.ts` instead of `renderer.tsx`
**Impact:** Prevents the renderer process from loading

## Debugging Steps Performed

### ❌ Attempt 1: Enhanced Express Routes
**Changes:**
- Added main gallery route (`/`)
- Added CORS headers
- Added `/api/photos` endpoint
- Enhanced `/status` endpoint
**Result:** FAILED - 404 errors persist

### ❌ Attempt 2: Better Error Handling
**Changes:**
- Added try-catch blocks
- Added detailed logging
- Changed host to `0.0.0.0`
**Result:** FAILED - 404 errors persist

### Root Cause Analysis

**The Express server is likely never starting because:**
1. Electron app fails to compile due to TypeScript errors
2. `setupExpressServer()` is called but `app.on('ready')` never fires
3. Server logs appear but server doesn't actually listen

## Required Fixes

### 1. Fix TypeScript Compilation Errors
**File:** `src/index.ts`
**Remove:**
```typescript
enableRemoteModule: false, // Remove this deprecated property
```

### 2. Ensure Renderer File Correctness
**Verify:** `src/renderer.tsx` exists and is properly configured in forge.config.ts

### 3. Add Express Server Verification
**Add logging to verify server actually starts:**
```typescript
app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Express server SUCCESSFULLY started on port 3000');
  console.log('🌐 Server should be accessible at http://localhost:3000');
});
```

## Working Solution (PENDING)

### Step 1: Fix Compilation Errors
1. Remove `enableRemoteModule: false` from webPreferences
2. Ensure renderer file is `.tsx` extension
3. Verify forge.config.ts points to correct renderer file

### Step 2: Add Server Startup Verification
1. Add detailed logging to confirm server starts
2. Test with simple route first
3. Verify port 3000 is not already in use

### Step 3: Test Incrementally
1. Start with basic `app.get('/', ...)` route
2. Add `/status` route
3. Add `/photos` static serving

## Debugging Checklist for Future Express Issues

1. **Check Electron App Startup:** Verify no compilation errors
2. **Check Port Availability:** Ensure port 3000 is free
3. **Verify Server Logs:** Look for "Express server running" message
4. **Test Basic Route:** Start with simple `/` route before complex ones
5. **Check Host Binding:** Ensure server listens on correct interface
6. **Document ALL attempts:** Add to this file for future reference

## Common Express Server Pitfalls

1. **App Never Starts:** Due to Electron compilation errors
2. **Port Conflicts:** Another process using port 3000
3. **Host Binding Issues:** Server bound to wrong interface
4. **Route Order:** Static routes conflicting with API routes
5. **CORS Issues:** Missing CORS headers for cross-origin requests

## Final Notes

The Express server issues are directly related to Electron app compilation failures. Fix the TypeScript errors first, then the Express server will work properly.

**Priority Order:**
1. Fix TypeScript compilation errors
2. Verify Express server startup
3. Test routes incrementally
4. Add production error handling