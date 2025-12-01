# Context: Genesis Module System Fix & architecture-decision-record

**Date**: 2025-12-01  
**Purpose**: Reference document explaining why architecture-decision-record needed a bundler and how Genesis will be fixed  
**Audience**: Developers resuming after reboot

---

## Why This Project Needed a Bundler (And Won't After Genesis Fix)

### The Problem We Solved
This project works today because we added `esbuild` bundler to compile CommonJS to browser-compatible JavaScript:

```bash
npm run build  # → Generates app-bundle.js
```

But this is a **workaround**, not a solution. The root cause is in the Genesis templates themselves.

### The Root Cause (In Genesis)
Genesis templates expect:
- All modules use **ES6 import/export**
- HTML loads scripts with `<script type="module">`
- No CommonJS, no require()

But when AI generates code from templates, it produces:
- CommonJS `require()` and `module.exports`
- Result: Browser says "require is not defined" → app dies

### Why This Project Required Bundler
Without bundler:
```
index.html → <script type="module" src="js/app.js">
          ↓
Browser loads app.js as ES6 module
          ↓
App.js tries: const { storage } = require('./storage.js')
          ↓
Error: require is not defined
          ↓
App broken
```

With bundler (current solution):
```
esbuild bundles all JS
          ↓
Converts CommonJS to ES6
          ↓
Creates app-bundle.js with all modules combined
          ↓
index.html → <script src="app-bundle.js">
          ↓
Works!
```

---

## The Genesis Fix (In Progress)

### What Will Change
Instead of "AI generates CommonJS, bundler converts it", Genesis will enforce:
**"Templates guide AI to generate ES6 from the start. No bundler needed."**

### The Fix Has 5 Phases
1. **Templates** (2-3 hrs): Add ES6 guardrails to all 12 JS templates
2. **AI Instructions** (1 hr): Explicit "module system validation" section
3. **Automation** (1-2 hrs): Validation script catches CommonJS at bootstrap
4. **Testing** (1-2 hrs): Verify fix against existing failures
5. **Documentation** (30 min): Update guides and CHANGELOG

### Where the Work Happens
- **Repository**: `/Users/matt/GitHub/Personal/genesis`
- **Design Document**: `docs/plans/GENESIS-MODULE-SYSTEM-FIX.md` (550 lines)
- **Latest Commit**: `3d0fa8f` (design committed)

### When This Project Benefits
After Genesis fix is merged:
1. New projects bootstrapped from Genesis won't need bundler
2. Dark mode, buttons, all UI will work immediately
3. No "silent failures" (event listeners properly attached)
4. No unreplaced template variables

---

## Current Status: This Project

### What's Working
✅ Live deployment: https://bordenet.github.io/architecture-decision-record/  
✅ Unit tests: 46/46 passing  
✅ Coverage: 77.38% (exceeds 45% threshold)  
✅ Linting: 0 errors  
✅ Dark mode: Working (with Tailwind config workaround)  
✅ 3-phase workflow: Fully functional  

### What's a Workaround (Will Improve With Genesis Fix)
⚠️ **esbuild bundler** - Not needed after Genesis fix  
⚠️ **CommonJS throughout** - Will be ES6 after Genesis fix  
⚠️ **App-bundle.js** - Won't be needed in future projects  

### What's Still Blocked
❌ E2E tests: Blocked by disk space (ENOSPC) - needs reboot to reclaim space  
❌ Playwright browsers: Need ~160MB to install  

### Next Steps for This Project (After Genesis Fix)
1. Reboot to free disk space
2. Run E2E tests with Playwright
3. Verify all 16 E2E tests pass
4. Add navigation links to related projects
5. Final deployment

---

## Technical Details: Why CommonJS Doesn't Work in ES6 Modules

### The Incompatibility
```html
<!-- index.html tells browser: "Load this as ES6 module" -->
<script type="module" src="js/app.js"></script>
```

```javascript
// js/app.js (generated with CommonJS)
const { storage } = require('./storage.js');  // ← Problem!
module.exports = { initApp };                 // ← Problem!
```

**Why Broken**:
- `require()` is a Node.js function, not available in browsers
- ES6 modules can only `import`, not `require()`
- These are fundamentally incompatible systems

### The Correct Pattern (What Genesis Will Enforce)
```html
<!-- HTML: Load as ES6 module -->
<script type="module" src="js/app.js"></script>
```

```javascript
// js/app.js (proper ES6)
import { storage } from './storage.js';  // ✅ Works in browser
export { initApp };                      // ✅ Works in browser
```

---

## Secondary Failures (Also Being Fixed)

### Problem 1: Event Listeners Not Attached
```javascript
// ui.js defines function
export function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}

// But never attaches it to button
// Result: Button exists, function works, but nothing connects them
// User sees: "Dark mode button doesn't work" (silently fails)
```

**Fix**: Templates will include `setupDOMBindings()` scaffold
```javascript
export function setupDOMBindings() {
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', toggleTheme);
}
```

### Problem 2: Template Variables Not Validated
```javascript
// After bootstrap, files still contain unreplaced variables:
const DB_NAME = '{{DB_NAME}}';           // ← Should be 'adr-assistant'
const PROJECT_TITLE = '{{PROJECT_TITLE}}'; // ← Should be 'Architecture Decision Record'
```

**Fix**: Validation script will catch these
```bash
grep -r "{{[A-Z_]*}}" . # Finds unreplaced variables
# Exit with error if any found
```

---

## References

### Key Files in This Repository
- `index.html` - Main application HTML (has workarounds)
- `js/` - All modules (currently CommonJS, will be ES6 after fix)
- `package.json` - Has esbuild build step (won't be needed after fix)
- `app-bundle.js` - Generated bundle (won't be needed after fix)
- `SESSION-CHECKPOINT.md` - Reboot checkpoint (disk space issue)

### Key Files in Genesis Repository
- `docs/plans/GENESIS-MODULE-SYSTEM-FIX.md` - Complete design (550 lines)
- `genesis/templates/web-app/index-template.html` - Will be updated
- `genesis/templates/web-app/js/*.js` - 12 files will be updated
- `genesis/01-AI-INSTRUCTIONS.md` - Will get module-system section
- `SESSION-CHECKPOINT-MODULE-SYSTEM-FIX.md` - Reboot checkpoint for Genesis work

### Related Projects (Reference Implementations)
- [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant) - Uses same patterns
- [one-pager](https://github.com/bordenet/one-pager) - Uses same patterns
- Both projects show correct module structure (though one-pager also uses bundler as workaround)

---

## Timeline

**What Happened** (2025-12-01):
- ✅ Root cause investigation complete
- ✅ Design document created (550 lines)
- ✅ 4-level solution designed
- ✅ 5-phase implementation plan created
- ✅ Design committed to genesis repo

**What's Next** (After reboot):
- [ ] Phase 1: Update 12 templates (2-3 hours)
- [ ] Phase 2: Update AI instructions (1 hour)
- [ ] Phase 3: Create validation script (1-2 hours)
- [ ] Phase 4: Test against failures (1-2 hours)
- [ ] Phase 5: Documentation (30 min)

**Total Work**: 8-10 hours (can be done in 1-2 sessions)

---

## How This Project Will Change

### Before Genesis Fix (Current)
```
Project Bootstrap
    ↓
AI generates CommonJS code
    ↓
"require is not defined" error
    ↓
Developer must add bundler
    ↓
npm run build → esbuild compiles CommonJS
    ↓
Finally works
```

### After Genesis Fix (Coming)
```
Project Bootstrap
    ↓
Templates guide AI to use ES6
    ↓
Validation prevents CommonJS
    ↓
Event listeners automatically attached
    ↓
Works immediately, no bundler needed
    ↓
More features work: dark mode, buttons, navigation
```

---

**Document Purpose**: Bridge sessions and preserve context  
**Status**: Ready for reboot  
**Next Step**: Implement Phase 1 after reboot (template updates)
