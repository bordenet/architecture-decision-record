# Deployment Guide

## GitHub Pages Deployment

This project is automatically deployed to GitHub Pages on every push to the `main` branch.

### Live Site
🌐 **URL:** https://bordenet.github.io/architecture-decision-record/

### How It Works

1. **GitHub Actions CI/CD Pipeline**
   - Workflow file: `.github/workflows/deploy.yml`
   - Runs on: Push to `main` branch or manual workflow dispatch
   - Steps:
     - Checkout code
     - Install dependencies
     - Run linting checks
     - Run unit tests
     - Build and upload to GitHub Pages
     - Deploy to `gh-pages` branch

2. **Repository Settings**
   - GitHub Pages is configured to deploy from the `gh-pages` branch
   - Settings → Pages → Source: Deploy from a branch → gh-pages
   - Custom domain: Not configured (uses default `bordenet.github.io`)

### Deployment Status

- Check deployment status: https://github.com/bordenet/architecture-decision-record/deployments
- View workflow runs: https://github.com/bordenet/architecture-decision-record/actions
- Most recent deployment: See "All deployments" in repository

### Manual Deployment

To deploy manually via command line:

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Run all tests
npm run test:unit

# Run linting
npm run lint

# Deploy via script
./scripts/deploy-web.sh
```

### Local Testing Before Deployment

Test the production build locally:

```bash
# Start local server
npm run serve

# Open browser to http://localhost:8000
# Test all three phases of ADR creation
```

### Troubleshooting

**Site not updating after push:**
1. Check GitHub Actions tab for workflow status
2. Verify the workflow passed all checks
3. Wait 1-2 minutes for GitHub Pages to update
4. Clear browser cache (Ctrl+Shift+Delete)

**Issues with IndexedDB:**
- IndexedDB works in deployed version (HTTPS enabled)
- Check browser DevTools → Application → IndexedDB
- Clear storage if encountering issues: DevTools → Application → Clear site data

**Performance issues:**
- Site is fully static (no server required)
- All data stored locally in browser
- Check browser DevTools → Network for slow assets

### Features Working on GitHub Pages

✅ All three phases (Draft → Review → Synthesis)
✅ Project creation and management
✅ IndexedDB local storage (privacy-first)
✅ Dark mode toggle
✅ Export to Markdown
✅ Responsive design (mobile/tablet)
✅ All UI interactions

### CI/CD Quality Gates

Before deployment, the pipeline verifies:
- ✅ Linting passes (0 errors/warnings)
- ✅ All unit tests pass
- ✅ No template variables remain
- ✅ Genesis cleanup verified

### Next Steps

1. Visit: https://bordenet.github.io/architecture-decision-record/
2. Create a test ADR to verify functionality
3. Check browser storage in DevTools
4. Test all three phases
5. Export an ADR to verify markdown generation

---

**Last updated:** 2024-12-01
**Deployment status:** Automated via GitHub Actions
