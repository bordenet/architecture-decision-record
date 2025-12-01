# Development Roadmap

## Optional Enhancements - In Progress

### 1. E2E Tests with Playwright
**Status:** TODO
**Description:** Implement full Playwright E2E tests to verify:
- Project creation workflow
- Phase navigation (1 → 2 → 3)
- Form saving and data persistence
- Export functionality
- Dark mode toggle
- Project list operations

**Completion Criteria:**
- All E2E tests passing
- Coverage of critical user workflows
- Tests documented in e2e/

**Notes:**
- Base test stub exists at e2e/app.spec.js
- WebServer configured in playwright.config.js
- Run with: `npm run test:e2e`

---

### 2. GitHub Pages Deployment
**Status:** COMPLETED ✅
**Description:** Enable GitHub Pages and verify deployment:
- Configure GitHub Pages settings
- Verify deploy-web.sh script works end-to-end
- Test site accessibility at https://bordenet.github.io/architecture-decision-record/
- Verify IndexedDB works in deployed version

**Completion Criteria:**
- Site live and accessible
- All features functional
- Performance acceptable

**Notes:**
- Requires repo settings update
- Deploy script already created
- .nojekyll file already in place

---

### 3. Enhanced Documentation
**Status:** TODO
**Description:** Expand README and add user guide:
- Add architecture diagrams
- Screenshot/gif of workflow
- Step-by-step user guide
- API documentation for modules
- Deployment instructions
- Live demo link

**Completion Criteria:**
- Comprehensive README
- Clear user onboarding
- Developer documentation

**Notes:**
- Current README is minimal
- Include reference to product-requirements-assistant pattern

---

### 4. Advanced Features
**Status:** TODO
**Description:** Implement production features:

#### 4a. Live LLM Integration
- Replace mock AI with real Claude API
- Environment variable config
- Graceful fallback to mock
- Error handling

#### 4b. Team Collaboration
- Share projects via URL
- Collaborative editing
- Comments on ADRs
- Access control

#### 4c. Version History
- Track changes per phase
- Diff view between versions
- Rollback capability

#### 4d. ADR Search
- Full-text search across projects
- Filter by status/date
- Export search results

**Completion Criteria:**
- At least 4a (Live LLM) working
- Tests for new features
- Documentation updated

**Notes:**
- Will require OpenAI/Anthropic API keys
- Consider rate limiting

---

## Completed Tasks

✅ Bootstrap project with tests and scripts
✅ Implement Phase 1: Form-based workflow
✅ Implement Phase 2: Adversarial review workflow
✅ Implement Phase 3: Final ADR synthesis and export

---

## Testing Checklist

Before each push:
- [ ] `npm run lint` - 0 errors/warnings
- [ ] `npm run test:unit` - All tests passing
- [ ] `npm run test:coverage` - Threshold met
- [ ] `npm run test:e2e` - E2E tests passing (when implemented)
- [ ] Manual verification of feature
- [ ] Git commit with clear message
- [ ] Git push to origin/main

---

## Notes

- Context resets may happen; use this file to track state
- Each section has clear completion criteria
- Push to main after each enhancement
- Maintain test coverage above 45%
- Keep linting at 0 errors/warnings
