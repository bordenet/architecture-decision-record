# AI Assistant Instructions for architecture-decision-record

**Project Status**: Production-ready. Live at https://bordenet.github.io/architecture-decision-record/

---

## ⚠️ CRITICAL: Fix ALL Linting Issues Immediately

**MANDATE**: When you detect ANY linting issue in a file you're working with, you MUST fix it immediately - regardless of whether it was pre-existing or newly introduced.

- Do NOT note that issues are "pre-existing" and move on
- Do NOT defer fixing to a later step
- Do NOT push code with known linting issues
- Fix ALL issues in the file before committing

**Rationale**: Linting issues indicate code quality problems. Ignoring them because they existed before your changes still means shipping low-quality code. Every touch point is an opportunity to improve the codebase. Sweeping lint errors "under the rug" causes them to accumulate over time, making each round of changes worse than the last.

---

## 🎯 Core Principles

### 0. **MANDATORY: Reference Known-Good Implementations FIRST**

**⚠️ BEFORE implementing ANY feature, reference these working examples:**

#### Primary References:
1. **[product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant)** ⭐ **PRIMARY**
   - Dark mode toggle (CRITICAL - always broken without Tailwind config)
   - Workflow architecture (3-phase mock/manual pattern)
   - Form-to-prompt pattern
   - Deployment scripts (compact mode, quality gates)
   - Setup scripts (fast, resumable, smart caching)

2. **[one-pager](https://github.com/bordenet/one-pager)** ⭐ **SECONDARY**
   - Same workflow pattern, different document type
   - UI patterns (related projects dropdown, privacy notice)
   - Lessons learned from Genesis implementation

#### When to Reference:
**✅ Check these implementations when:**
- Implementing dark mode (check Tailwind config patterns)
- Setting up workflow phases (check 3-phase architecture)
- Creating forms (check form patterns)
- Writing scripts (check script best practices)
- Adding UI patterns (check CSS/HTML patterns)
- **ANY TIME you're unsure how to implement something**

---

### 1. **MANDATORY: Script-Only Deployments and Setup**

**⚠️ CRITICAL - READ THIS FIRST**:

#### Deployment Rule (ABSOLUTE REQUIREMENT)
**ALL deployments MUST be performed using project scripts. NEVER use manual git commands.**

```bash
# ✅ CORRECT - Use deployment script
./scripts/deploy-web.sh

# ❌ WRONG - Manual deployment
git add .
git commit -m "Deploy"
git push
```

**Why**: The deployment script enforces quality gates (linting, tests, coverage) before deploying. Manual deployments bypass these checks and can deploy broken code.

#### Setup Rule (ABSOLUTE REQUIREMENT)
**ALL project dependencies MUST be installed via setup scripts. NEVER tell users to run manual install commands.**

```bash
# ✅ CORRECT - Use setup script
./scripts/setup-macos.sh

# ❌ WRONG - Manual setup
npm install
brew install shellcheck
```

**Why**: Setup scripts ensure reproducible environments. Manual setup leads to "works on my machine" problems.

#### Required Setup Scripts
Every project MUST have these scripts in `scripts/`:
- **`setup-macos.sh`** - MANDATORY for all projects
- **`setup-linux.sh`** - If project supports Linux
- **`setup-windows-wsl.sh`** - If project supports Windows WSL
- **`setup-codecov.sh`** - If project uses code coverage tools
- **`deploy-web.sh`** - For web applications

**Reference**: https://github.com/bordenet/product-requirements-assistant/tree/main/scripts

### 2. **ALWAYS Complete the Full Workflow**
When asked to do a task, you MUST:
1. ✅ Complete the work
2. ✅ Lint the code (`npm run lint` or `npm run lint:fix`)
3. ✅ Run tests (`npm test`)
4. ✅ Verify tests pass
5. ✅ Check coverage if applicable
6. ✅ **PROACTIVELY tell the user what's left** - don't wait to be asked

**BAD**: "I've created the files."
**GOOD**: "I've created the files, linted them (0 errors), ran tests (37/37 passing), and verified coverage (73%). What's left: [specific list]"

### 3. **NEVER Include Build Artifacts**
When creating examples or templates:
- ❌ NEVER commit `node_modules/`
- ❌ NEVER commit `coverage/`
- ❌ NEVER commit `dist/` or `build/`
- ✅ ALWAYS create `.gitignore` files
- ✅ ALWAYS verify directory size before committing

### 4. **Proactive Status Updates**
After EVERY significant change:
```
✅ What I did: [specific actions]
✅ Quality checks: [linting, tests, coverage]
✅ What's left: [specific remaining tasks]
```

Don't make the user ask "what's left?" multiple times.

---

## 📋 Standard Workflow Checklist

### When Creating New Code
- [ ] **FIRST**: Check coding standards (see "Coding Standards" section below)
- [ ] Write the code following style guides
- [ ] Create/update tests
- [ ] Run linter: `npm run lint` or `npm run lint:fix`
- [ ] Run tests: `npm test`
- [ ] Check coverage: `npm run test:coverage` (if applicable)
- [ ] Verify all checks pass
- [ ] Create `.gitignore` if needed
- [ ] **Tell user: what's done, what's left**

### When Modifying Existing Code
- [ ] Make changes
- [ ] Update affected tests
- [ ] Run linter
- [ ] Run tests
- [ ] Verify no regressions
- [ ] **Tell user: what's done, what's left**

### When Deploying
- [ ] **MANDATORY**: Use `./scripts/deploy-web.sh` (NEVER manual git commands)
- [ ] Verify deployment script exists and is executable
- [ ] Let script handle linting, testing, coverage, commit, push
- [ ] Verify deployment URL after script completes

### When Adding Dependencies
- [ ] **MANDATORY**: Update `./scripts/setup-macos.sh` FIRST
- [ ] Update `./scripts/setup-linux.sh` if project supports Linux
- [ ] Add dependency to package.json/requirements.txt/etc.
- [ ] Test setup script works
- [ ] Commit setup script AND package file together
- [ ] **NEVER** tell user to run `npm install` or `pip install` manually

### When Asked "What's Left?"
This means you failed to proactively communicate. Improve by:
1. Always ending responses with "What's left: [list]"
2. Being specific about remaining tasks
3. Prioritizing tasks (blocking vs. nice-to-have)

---

## 🏗️ Project Structure

### Main Application
- `index.html` - Main application (3-phase workflow)
- `css/` - Styles (Tailwind + custom)
- `js/` - JavaScript modules (ES6)
- `tests/` - Jest unit tests
- `e2e/` - Playwright E2E tests

### Scripts (CRITICAL - ALWAYS USE THESE)
- **`scripts/setup-macos.sh`** - Install ALL dependencies (MANDATORY)
- **`scripts/setup-linux.sh`** - Linux setup (if supported)
- **`scripts/deploy-web.sh`** - Deploy to GitHub Pages (MANDATORY for web apps)
- `scripts/lib/common.sh` - Common shell functions
- `scripts/lib/compact.sh` - Compact display utilities

### Configuration
- `.env.example` - Environment template (tracked in git)
- `.env` - Actual secrets (gitignored, never commit)
- `package.json` - Dependencies and scripts
- `jest.config.js` - Test configuration
- `.eslintrc.json` - Linting rules

---

## 🧪 Testing Standards

### Coverage Requirements
- **Main application**: 85% minimum (statements, branches, functions, lines)
- **UI code**: Can be excluded if E2E tested

### Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Fix linting errors
npm run lint:fix
```

### Setup Commands (MANDATORY - Use These, Not Manual Install)
```bash
# Initial setup (macOS)
./scripts/setup-macos.sh

# Initial setup (Linux)
./scripts/setup-linux.sh

# Deploy to GitHub Pages
./scripts/deploy-web.sh

# Deploy with verbose output
./scripts/deploy-web.sh -v

# Deploy skipping tests (emergency only)
./scripts/deploy-web.sh --skip-tests
```

### ALWAYS Run These After Code Changes
1. `npm run lint` (or `lint:fix`)
2. `npm test`
3. Verify output shows all passing
4. **Deploy using `./scripts/deploy-web.sh`** (NEVER manual git commands)

---

## 🚫 What NOT to Do

### NEVER
- ❌ **Deploy using manual git commands** (ALWAYS use `./scripts/deploy-web.sh`)
- ❌ **Tell users to run `npm install` or `pip install`** (ALWAYS use setup scripts)
- ❌ **Add dependencies without updating setup scripts**
- ❌ Create files without linting them
- ❌ Create tests without running them
- ❌ Commit `node_modules/` or build artifacts
- ❌ Make user ask "what's left?" multiple times
- ❌ Use hyperbolic language ("amazing", "revolutionary", "production-grade")
- ❌ Create documentation files unless explicitly requested
- ❌ Do more than the user asked

### ALWAYS
- ✅ **Use `./scripts/deploy-web.sh` for ALL deployments**
- ✅ **Use `./scripts/setup-macos.sh` for ALL setup instructions**
- ✅ **Update setup scripts BEFORE adding dependencies**
- ✅ Lint after creating/modifying code
- ✅ Run tests after creating/modifying tests
- ✅ Create `.gitignore` for new directories with dependencies
- ✅ Proactively communicate what's left
- ✅ Use factual, professional language
- ✅ Ask before committing, pushing, or deploying

---

## 📐 Coding Standards

### JavaScript Style Guide

**Key Rules**:
- Use ES6+ features (const/let, arrow functions, async/await)
- Double quotes for strings
- 2-space indentation
- Semicolons required
- Descriptive variable names (no single letters except loop counters)
- JSDoc comments for all functions
- Defensive coding (validate inputs, handle errors)

### Testing Standards
- ≥70% code coverage (≥85% for production apps)
- Test all public functions
- Test error cases
- Use descriptive test names
- Mock external dependencies

---

## 📝 Communication Style

### User Expectations
- **No flattery**: Don't say "great question", "excellent idea", etc.
- **Be direct**: Skip pleasantries, get to the point
- **Be specific**: "37/37 tests passing" not "tests are working"
- **Be proactive**: Always end with "What's left: [list]"

### Status Update Template
```
✅ Completed:
- [Specific action 1]
- [Specific action 2]

✅ Quality Checks:
- Linting: PASSED (0 errors)
- Tests: PASSED (37/37)
- Coverage: 73% (exceeds 70% threshold)

✅ What's Left:
- [Specific remaining task 1]
- [Specific remaining task 2]
```

---

**Remember**: Match the user's high standards for professionalism and completeness.
