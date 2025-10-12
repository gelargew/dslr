# CSP Debugging Documentation

## Problem Summary
Electron Forge + Content Security Policy (CSP) blocking external images from DigiCamControl at `http://127.0.0.1:5513/liveview.jpg`.

## Error Messages Encountered
1. `Refused to load the image 'http://127.0.0.1:5513/liveview.jpg?t=...' because it violates the following Content Security Policy directive: "default-src 'self' 'unsafe-inline' data:". Note that 'img-src' was not explicitly set, so 'default-src' is used as a fallback.`

2. `Electron Security Warning (Insecure Content-Security-Policy) This renderer process has either no Content Security Policy set or a policy with "unsafe-eval" enabled.`

## Solutions Attempted (IN ORDER)

### ❌ Attempt 1: Package.json CSP Modification
**File:** `package.json`
**Change:**
```json
"devContentSecurityPolicy": "default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:* ws://localhost:*; img-src 'self' http://127.0.0.1:* data:;"
```
**Result:** FAILED - Same CSP error persisted

### ❌ Attempt 2: HTML Meta Tag CSP
**File:** `src/index.html`
**Change:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' http://127.0.0.1:* data:; connect-src 'self' http://localhost:* ws://localhost:*;">
```
**Result:** FAILED - Same CSP error persisted

### ❌ Attempt 3: Completely Permissive CSP
**File:** `package.json`
**Change:**
```json
"devContentSecurityPolicy": "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:; connect-src *; style-src * 'unsafe-inline';"
```
**Result:** FAILED - Same CSP error persisted

### ❌ Attempt 4: Remove CSP from package.json + HTML Meta Tag
**Files:** `package.json` and `src/index.html`
**Changes:**
- Removed `devContentSecurityPolicy` from package.json completely
- Added permissive meta tag: `<meta http-equiv="Content-Security-Policy" content="default-src *; script-src *; img-src * data:; style-src *; connect-src *;">`
**Result:** FAILED - App stopped rendering completely (empty body)

## Key Insights

### 1. CSP Error Message Analysis
The error consistently showed: `"default-src 'self' 'unsafe-inline' data:"` even after we changed the CSP configuration. This indicates our CSP changes were NOT being applied at all.

### 2. Web Security Setting
**File:** `src/index.ts`
**Current Setting:**
```typescript
webPreferences: {
  webSecurity: false, // Disable web security
  allowRunningInsecureContent: true, // Allow mixed content
  nodeIntegrationInWorker: true, // Allow node integration in workers
}
```

### 3. Root Cause Analysis
The CSP is being enforced despite `webSecurity: false`. This suggests:
- Electron Forge may have its own CSP enforcement mechanism
- There may be cached build files
- CSP configuration location may be incorrect

### ❌ Attempt 5: Balanced CSP Meta Tag
**File:** `src/index.html`
**Change:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' http://127.0.0.1:* data:; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:*;">
```
**Result:** FAILED - Same CSP error: `"default-src 'self' 'unsafe-inline' data:"` persists
**Key Insight:** CSP changes are NOT being applied at all. The error still shows the old CSP directive.

## Working Solution (CURRENT - NOT WORKING)

### Configuration Files Status

**`src/index.html`:**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' http://127.0.0.1:* data:; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:*;">
```

**`package.json`:**
- NO `devContentSecurityPolicy` line (removed completely)

**`src/index.ts`:**
```typescript
webPreferences: {
  webSecurity: false, // Disable web security
  allowRunningInsecureContent: true, // Allow mixed content
  nodeIntegrationInWorker: true, // Allow node integration in workers
}
```

### ❌ Attempt 6: Webpack Dev Server CSP Headers
**File:** `webpack.renderer.config.ts`
**Change:**
```typescript
devServer: {
  headers: {
    'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' http://127.0.0.1:* data:; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:*;"
  }
}
```
**Result:** FAILED - Same CSP error: `"default-src 'self' 'unsafe-inline' data:"` persists
**Key Insight:** Electron Forge completely overrides all CSP attempts. It has its own internal CSP mechanism that cannot be bypassed through HTML meta tags, webpack headers, or package.json.

### ❌ Attempt 7: WebpackPlugin contentSecurityPolicy: false
**File:** `forge.config.ts`
**Change:**
```typescript
new WebpackPlugin({
  // ... other config
  contentSecurityPolicy: false, // Disable CSP entirely
})
```
**Result:** FAILED - Same CSP error: `"default-src 'self' 'unsafe-inline' data:"` persists
**Key Insight:** This version of Electron Forge has a fundamental CSP bug or limitation. Even the official disable method doesn't work.

### Current Issue
Electron Forge has unbreakable CSP enforcement. All known bypass methods including official API fail completely. This may be a bug in this specific version of Electron Forge.

## Debugging Checklist for Future CSP Issues

1. **Check Error Messages Carefully**: Note the exact CSP directive being violated
2. **Verify CSP Application**: Check if CSP changes are actually being applied
3. **Clear Build Cache**: Restart development server completely
4. **Test Gradual CSP Relaxation**: Start with minimal changes, not all-or-nothing
5. **Check Web Security Settings**: Ensure `webSecurity: false` is properly set
6. **Verify File Extensions**: Ensure `.tsx` files are properly configured in webpack

## Recommended CSP for Development
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' http://127.0.0.1:* data:; connect-src 'self' http://localhost:* ws://localhost:* http://127.0.0.1:*;">
```

## Final Notes
- CSP configuration in Electron Forge is complex and not straightforward
- The interaction between `webSecurity: false` and CSP is not well documented
- Always test CSP changes incrementally rather than all at once
- Document all CSP changes to prevent debugging loops