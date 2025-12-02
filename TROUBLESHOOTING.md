# Troubleshooting Guide - ADR Prompt Tuning

**Purpose**: Debug and fix common issues when generating ADRs using the three-phase workflow.

---

## Common Issues & Solutions

### Issue 1: ADR Scores Below 4.0/5.0

**Symptoms**:
- `tools/adr-scorer.js` reports score <4.0
- ADR "ready" status shows false
- Test phase shows poor results

**Root Causes** (in order of likelihood):

#### 1A: Vague Consequence Language
**Indicators**:
- Consequences Balance score <3.5/5.0
- Phrases like "may increase complexity", "makes operations harder", "requires more resources"

**Fix**:
```
BEFORE: "May increase complexity"
AFTER: "Requires event-driven patterns for data consistency; services can no longer use distributed transactions"

BEFORE: "Makes operations harder"
AFTER: "Operational teams must maintain separate deployment pipelines for each service, increasing release coordination from 30-minute monolithic releases to independent per-service deployments"
```

**How to Apply**:
1. Re-run Phase 2 review with Gemini (triggers critical review)
2. Ensure Phase 2 prompt includes specific consequence examples
3. Check that Phase 3 synthesis chooses the more specific version

**Prevention**:
- Add domain-specific examples to phase2.md for your use case
- Test with `node tools/prompt-tuner.js suggest-improvements phase2`
- Use suggestion output to strengthen consequences

---

#### 1B: Missing or Generic Team Factors
**Indicators**:
- Completeness score 3.5-4.0/5.0
- No mention of training duration, hiring needs, or team structure changes

**Fix**:
```
BEFORE: "Requires hiring expertise in distributed systems"
AFTER: "Requires hiring 2-3 distributed systems engineers ($200-300k annually); existing team of 8 needs 6-8 weeks training on event-driven patterns, Kafka semantics, and debugging distributed systems"
```

**How to Apply**:
1. Edit the Phase 2 prompt (prompts/phase2.md)
2. Find "If Team Factors Missing" section
3. Add your specific team factors as examples
4. Re-run Phase 2 test: `node tools/prompt-tuner.js test phase2 --mock`

**Prevention**:
- Include team size in Phase 1 context (e.g., "team of 8 engineers")
- Include current skills in context (e.g., "mostly full-stack JavaScript")
- Include hiring constraints (e.g., "limited budget for new hires")

---

#### 1C: Unclear or Missing Decision
**Indicators**:
- Clarity score <3.5/5.0
- Decision uses phrases like "strategic approach", "modern architecture", "critical intervention"
- Decision doesn't name specific pattern (microservices, monorepo, event-driven)

**Fix**:
```
BEFORE: "We will adopt a strategic approach to improve scalability"
AFTER: "We will migrate to domain-driven microservices, with each domain (Orders, Inventory, Shipping) owning its own PostgreSQL database and deploying independently"
```

**How to Apply**:
1. Check Phase 1 context - is it specific?
   - Good: "Currently 45-minute deployments blocking features"
   - Bad: "Need to improve deployment speed"
2. Run Phase 1 with more specific context
3. If Phase 1 still vague, re-run Phase 2 to strengthen
4. Ensure Phase 3 chooses the more specific wording

**Prevention**:
- Use concrete business drivers in context: "300% YoY growth", "45-minute deployments", "$150k annual cost"
- Name specific constraints: "must support 200+ API consumers", "team is 80% JavaScript"
- Test with `node tools/prompt-tuner.js test phase1 --mock` after improving context

---

### Issue 2: Phase 2 Review Not Actually Improving the ADR

**Symptoms**:
- Phase 2 output identical to Phase 1 (byte-for-byte same)
- Phase 2 output shorter than Phase 1
- No substantive changes between Phase 1 and Phase 2

**Root Cause**:
Phase 2 prompt may not be providing enough detail about what's wrong.

**Fix**:
1. Check if Phase 2 prompt has current version of critical improvements
   ```bash
   grep "Critical Improvements Required" prompts/phase2.md
   ```

2. Ensure Phase 2 prompt includes examples of vague → specific transformations
   ```bash
   grep "VAGUE:" prompts/phase2.md | head -5
   ```

3. If missing examples, update prompts/phase2.md with specific team factor examples

**Prevention**:
- Use `node tools/prompt-tuner.js suggest-improvements phase2` to identify what Gemini recommends
- Add those recommendations to prompts/phase2.md
- Re-test: `node tools/prompt-tuner.js test phase2 --mock`
- Validate improvement: `validate_phase2_improvement(phase1, phase2)` in API integration code

---

### Issue 3: Phase 3 Synthesis Doesn't Choose the Better Version

**Symptoms**:
- Phase 3 averages both versions: "may improve complexity with some mitigation"
- Phase 3 waters down both versions
- Phase 3 score lower than Phase 2

**Root Cause**:
Phase 3 prompt insufficient guidance on choosing vs. averaging.

**Fix**:
1. Check Phase 3 prompt for synthesis rules
   ```bash
   grep "Synthesis Decision Rules" prompts/phase3.md -A 10
   ```

2. Ensure prompt includes anti-patterns
   ```bash
   grep "Example of what NOT to do" prompts/phase3.md
   ```

3. If missing, update prompts/phase3.md to strengthen decision rules

**Current prompts/phase3.md section** (should exist):
```markdown
## Synthesis Decision Rules

When deciding between Phase 1 and feedback suggestions:
- **If Phase 1 is specific and concrete**: Keep it (don't weaken it)
- **If feedback suggests better specificity**: Adopt the specific version without hesitation
- **NEVER average or water down**: Choose the clearer, more concrete version EVERY time
- **Example of what NOT to do**: "may increase complexity (from Phase 1) with some mitigation (from Phase 2)" ❌
- **Example of what TO do**: "Requires distributed tracing implementation; debugging cross-service issues changes from grep-based to Jaeger visualization" ✅
```

**Prevention**:
- Add 2-3 synthesis examples to Phase 3 prompt
- Test: `node tools/prompt-tuner.js test phase3 --mock`
- Validate no averaging: Run `validate_phase3_not_averaged()` check

---

### Issue 4: Clarity Score Remains Low (<4.0) Despite Improvements

**Symptoms**:
- Clarity score stuck at 3.5-3.8 despite Phase 2 improvements
- Especially affects microservices, framework migration decisions
- Simpler decisions (auth, versioning) score much higher

**Root Cause**:
Complex architectural decisions inherently harder to phrase clearly. Need domain-specific prompting.

**Fix**:

**For Microservices Decisions**:
Add to Phase 1 prompt:
```markdown
### Microservices-Specific Clarity Requirements

When deciding to move to microservices:
- Name the specific service boundaries (e.g., "Orders domain", "Inventory domain")
- State exactly which monolith piece each service replaces
- Specify data ownership (e.g., "Orders owns order_id sequences, Inventory owns stock tables")
- Name specific deployment changes (e.g., "from 1 weekly coordinated release to 5 per-service deployments/day")

EXAMPLE:
"We will split the Order Management monolith (2000 lines) into Orders service and Inventory service. Orders owns all order state + order_items tables, Inventory owns product + stock tables. Each service deploys independently via separate CI/CD pipelines in GitHub Actions, enabling Orders to ship hotfixes in <5 minutes without Inventory coordination."
```

**For Framework Decisions**:
Add to Phase 1 prompt:
```markdown
### Framework Migration-Specific Clarity Requirements

When deciding on framework migration:
- Name the specific FROM and TO frameworks (e.g., "from AngularJS 1.x to React 18")
- Specify exact upgrade path (e.g., "side-by-side with routing split between old and new")
- Name teams/components affected (e.g., "Dashboard team migrates components gradually over Q1-Q2")
- Set specific timelines (e.g., "6-month migration, 1 month per team")

EXAMPLE:
"We will migrate from AngularJS 1.x (end-of-life Dec 2022) to React 18, starting with the Dashboard team (4 engineers, 12 components) in Q1, then Settings team (3 engineers, 8 components) in Q2. We will run both frameworks side-by-side, routing new features to React while AngularJS handles legacy features."
```

**How to Apply**:
1. Identify which domain is scoring low (microservices? frameworks?)
2. Find domain-specific examples above
3. Add to prompts/phase1.md or create domain-specific prompt variant
4. Test: `node tools/prompt-tuner.js test phase1 --mock`
5. Target: Move clarity from 3.5 to 4.2+

**Prevention**:
- Create separate prompt files for high-complexity domains
- Test with domain-specific test cases
- Document clarity patterns for your specific architectural domains

---

## Validation Commands

### Check Overall Health
```bash
# Run full test suite
node tools/prompt-tuner.js test phase1 --mock
node tools/prompt-tuner.js test phase2 --mock
node tools/prompt-tuner.js test phase3 --mock

# Expected output: all phases 3.9+/5.0
```

### Get Improvement Suggestions
```bash
# See what needs improvement for each phase
node tools/prompt-tuner.js suggest-improvements phase1
node tools/prompt-tuner.js suggest-improvements phase2
node tools/prompt-tuner.js suggest-improvements phase3
```

### Check Specific Issue
```bash
# View Phase 1 results file
cat prompt_tuning_results_architecture-decision-record/phase1_results_2025-12-02.json | jq '.test_cases[].scores'

# Find lowest scoring test cases
cat prompt_tuning_results_architecture-decision-record/phase1_results_2025-12-02.json | jq '.test_cases | sort_by(.score)'
```

### Validate ADR Manually
```bash
# Copy Phase 3 output to a file
node tools/adr-scorer.js your-adr.md

# Get detailed score breakdown
cat your-adr-score.json | jq '.'
```

---

## Quick Fixes by Symptom

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| Score < 3.9 | Vague consequences | Add specific consequences to Phase 2 |
| Score < 3.9 | Missing team factors | Include team size, skills in context |
| Clarity < 3.5 | Generic decision language | Use Phase 2 to strengthen specificity |
| Completeness 3.5-4.0 | Missing sections | Check that all required sections present |
| Phase 2 = Phase 1 | No improvement feedback | Update Phase 2 prompt with examples |
| Phase 3 < Phase 2 | Synthesis averaging | Strengthen Phase 3 synthesis rules |

---

## When to Re-Tune Prompts

**Re-tune Phase 1 if**:
- 2+ consecutive ADRs score <4.0
- Clarity score consistently <3.8
- Decision section uses vague language >25% of the time

**Re-tune Phase 2 if**:
- Phase 2 outputs not improving Phase 1 (identical content)
- Specific feedback suggestions missing
- Team factors not being expanded in Phase 2

**Re-tune Phase 3 if**:
- Phase 3 score lower than Phase 2 (synthesis failing)
- Averaging/watering down detected
- Clarity decreasing instead of improving

**Re-test after**:
```bash
# After any prompt edits
node tools/prompt-tuner.js test phase1 --mock
node tools/prompt-tuner.js test phase2 --mock
node tools/prompt-tuner.js test phase3 --mock

# Validate all phases improved or stayed same (never went down)
```

---

## Context Checklist

**Before running workflow, ensure context includes**:

- [ ] Current state: "We have X", "We use Y", "Team is Z"
- [ ] Problem: "This causes A", "We experience B", "We can't C"
- [ ] Specific numbers: "300% growth", "45 minutes", "$150k", "2-3 hours"
- [ ] Team context: "8 engineers", "mostly JavaScript", "new to distributed systems"
- [ ] Business drivers: "speed to market", "reduce cost", "improve reliability", "team retention"
- [ ] Constraints: "budget $X", "timeline Y months", "existing tool Z"

**Good context**:
```
We're experiencing 300% YoY growth. Our monolithic Node.js application has 2000 engineers using 45-minute coordinated deployments every Friday. This creates 2-3 hour deployment windows that block emergency patches and frustrate customers. Our 8-person team is skilled in JavaScript but new to distributed systems. We need to reduce deployment time to <10 minutes to enable daily releases.
```

**Poor context**:
```
We want to improve our architecture.
```

---

## When to Escalate

**Contact the prompt tuning team if**:
1. Score remains <3.9 after applying all fixes above
2. Domain-specific architecture (not covered by examples) scores consistently low
3. Synthesis quality degrading (Phase 3 < Phase 2) after prompt updates
4. Specific architectural pattern not covered by current prompts

**Provide**:
- [ ] ADR context (what decision you're trying to make)
- [ ] Output from `node tools/prompt-tuner.js suggest-improvements phase1/2/3`
- [ ] Score breakdown (which dimensions are weak?)
- [ ] Recent prompt changes (what did you try?)
- [ ] Example of what "good" looks like for your domain

---

## Resources

- **Validation Results**: See `VALIDATION_RESULTS.md` for detailed scoring breakdown
- **Usage Examples**: See `USAGE_EXAMPLES.md` for high-quality examples (4.0+)
- **API Integration**: See `API_INTEGRATION_GUIDE.md` for implementation details
- **Prompts**: Review `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md` directly
- **Scoring Engine**: See `tools/adr-scorer.js` for how scores are calculated

---

**Version**: 1.0  
**Last Updated**: 2025-12-02  
**Test Coverage**: All 5 test domains covered  
**Status**: Production-Ready for debugging and optimization
