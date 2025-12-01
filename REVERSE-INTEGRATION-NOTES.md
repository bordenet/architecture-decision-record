# Reverse-Integration Notes

These notes document gaps in the Genesis template and improvements for future projects.

## Format

Each note follows this structure:

```
## REVERSE-INTEGRATION NOTE #[NUMBER]

**Date**: YYYY-MM-DD
**Issue**: [What problem did you encounter?]
**Solution**: [How did you solve it by referencing the implementations?]
**Reference**: [Link to specific file/line in reference implementation]
**Genesis Gap**: [What's missing from Genesis that caused this?]
**Recommendation**: [What should be added/updated in Genesis?]
**Files to Update**: [List Genesis files that need changes]
**Priority**: [CRITICAL / HIGH / MEDIUM / LOW]
```

---

## REVERSE-INTEGRATION NOTE #1

**Date**: 2025-12-01
**Issue**: Dark mode toggle wasn't working immediately - Tailwind config needed
**Solution**: Added `tailwind.config = { darkMode: 'class' }` to index-template.html before app loads
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/docs/index.html#L9-L18
**Genesis Gap**: Template includes dark mode toggle button but doesn't explain Tailwind config requirement
**Recommendation**: Add clear comment in index-template.html explaining the darkMode: 'class' config is CRITICAL
**Files to Update**: 
- genesis/templates/web-app/index-template.html (add comprehensive comment)
- genesis/00-AI-MUST-READ-FIRST.md (emphasize Tailwind config more)
**Priority**: CRITICAL

---

## REVERSE-INTEGRATION NOTE #2

**Date**: 2025-12-01
**Issue**: Package.json deploy folder variable needed adjustment for root deployment
**Solution**: Changed DEPLOY_FOLDER from /docs to . since we're serving from root
**Reference**: https://github.com/bordenet/one-pager/blob/main/package.json#L16
**Genesis Gap**: Template doesn't clarify deploy folder variable based on GitHub Pages architecture choice
**Recommendation**: Add documentation in package-template.json showing both root and /docs options
**Files to Update**:
- genesis/templates/testing/package-template.json
**Priority**: MEDIUM

---

## REVERSE-INTEGRATION NOTE #3

**Date**: 2025-12-01
**Issue**: Storage module DB_NAME needed project-specific value
**Solution**: Used "adr-assistant" for consistency with project name
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/js/storage.js#L5-L6
**Genesis Gap**: Template uses placeholder {{DB_NAME}} without guidance on naming convention
**Recommendation**: Add guidance on DB naming convention (lowercase, hyphenated, reflects project name)
**Files to Update**:
- genesis/templates/web-app/js/storage-template.js (add comment with naming guidance)
**Priority**: LOW

---

## REVERSE-INTEGRATION NOTE #4

**Date**: 2025-12-01
**Issue**: GitHub Actions workflow needed to check for unreplaced variables
**Solution**: Workflow already includes Genesis cleanup verification step
**Reference**: https://github.com/bordenet/product-requirements-assistant/blob/main/.github/workflows/ci.yml#L74-L111
**Genesis Gap**: None - workflow template is comprehensive
**Recommendation**: Keep as-is, serves as good example
**Files to Update**: None
**Priority**: N/A

---

## Future Improvements

These are patterns that could be added to Genesis for future projects:

1. **Project Type Templates**: Create separate Genesis templates for different document types (ADR, PRD, One-Pager) rather than trying to be generic
2. **Setup Script Disk Check**: Add disk space verification to setup scripts to catch issues early
3. **Deployment Architecture Wizard**: Help users choose between root and /docs deployment upfront
4. **AI Configuration Guide**: Document how to switch between mock and live AI modes

---

**Last Updated**: 2025-12-01
**Total Issues Documented**: 4
**Critical Issues**: 1
**High Issues**: 0
**Medium Issues**: 1
**Low Issues**: 2
