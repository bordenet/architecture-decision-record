# Prompt Tuning Quick Start

Everything you need to know to use the prompt tuning infrastructure.

## 1-Minute Overview

The ADR prompt tuning system has THREE parts that work together:

```
┌─────────────────────────────────────────────────────────────┐
│ Your Prompts (prompts/*.md)                                 │
│ - phase1.md: Claude generates initial ADR draft             │
│ - phase2.md: Gemini reviews critically                      │
│ - phase3.md: Claude synthesizes final version               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ├─→ ADR Scorer (tools/adr-scorer.js)
                   │   Scores quality: 1-5 scale
                   │   5 dimensions: completeness, clarity, etc.
                   │
                   └─→ Prompt Tuner (tools/prompt-tuner.js)
                       Tests against 5 scenarios
                       Suggests improvements
```

## Quick Commands

### Test Prompts
```bash
# Test phase 1 (Claude draft)
node tools/prompt-tuner.js test phase1 --mock

# Test phase 2 (Gemini review)
node tools/prompt-tuner.js test phase2 --mock

# Test phase 3 (Claude synthesis)
node tools/prompt-tuner.js test phase3 --mock
```

### Get Suggestions
```bash
# See how to improve phase 1
node tools/prompt-tuner.js suggest-improvements phase1
```

### Score an ADR
```bash
# Score your generated ADR
node tools/adr-scorer.js path/to/your-adr.md
```

## Current Status

### Baseline Scores (Dec 2, 2025)
| Phase | Score | Status |
|-------|-------|--------|
| Phase 1 | 3.60/5.0 | Needs work |
| Phase 2 | 2.06/5.0 | Critical issues |
| Phase 3 | 2.79/5.0 | Needs work |

**Critical Issue**: Consequences Balance (1.80/5.0 - too vague)

### What Works
✅ All three prompts are here and refined
✅ Scoring system evaluates quality objectively
✅ Testing framework identifies improvement opportunities
✅ 5 realistic test cases included

### What Needs Work
⚠️ Phase 2 output structure needs improvement
⚠️ Consequences are too vague/generic
⚠️ Phase 1 needs minimum requirements enforcement

## Improvement Roadmap

### This Week (Priority Order)
1. Fix Phase 2 structure (critical for Phase 3 to work)
2. Improve Phase 1 consequences balance
3. Enhance Phase 3 synthesis quality

### Success Target
✅ 80%+ of generated ADRs score 4.0+/5.0 overall

## Key Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `prompts/phase1.md` | Claude draft prompt | When generating initial ADR |
| `prompts/phase2.md` | Gemini review prompt | When doing critical review |
| `prompts/phase3.md` | Claude synthesis prompt | When creating final version |
| `tools/adr-scorer.js` | Scores ADR quality | After generating any ADR |
| `tools/prompt-tuner.js` | Tests & improves prompts | When refining prompts |
| `PROMPT_TUNING.md` | Full methodology guide | For detailed reference |
| `PROMPT_TUNING_BASELINE.md` | Test results & analysis | For improvement planning |

## Example Workflow

### Generate an ADR
1. Copy prompt from `prompts/phase1.md`
2. Paste into Claude with your context
3. Get the Phase 1 output
4. Copy prompt from `prompts/phase2.md`
5. Paste into Gemini with Phase 1 output + context
6. Get the Phase 2 feedback
7. Copy prompt from `prompts/phase3.md`
8. Paste into Claude with Phase 1 + Phase 2
9. Get final ADR

### Quality Check
```bash
node tools/adr-scorer.js my-adr.md
```

Result: Score (1-5) + detailed report of strengths/weaknesses

## Common Issues

### Issue: "Consequences feel vague"
→ This is the main problem. See `PROMPT_TUNING_BASELINE.md` → Consequences Balance section

### Issue: "Phase 2 feedback isn't structured"
→ This is the critical blocker. Needs Phase 2 prompt restructuring.

### Issue: "How do I know if my prompt change helped?"
→ Run tests before and after: `node tools/prompt-tuner.js test phase1 --mock`

## Next Steps

1. **Run baseline tests** (take 2 min):
   ```bash
   node tools/prompt-tuner.js test phase1 --mock
   node tools/prompt-tuner.js test phase2 --mock
   node tools/prompt-tuner.js test phase3 --mock
   ```

2. **Review improvement suggestions** (take 5 min):
   ```bash
   node tools/prompt-tuner.js suggest-improvements phase1
   node tools/prompt-tuner.js suggest-improvements phase2
   node tools/prompt-tuner.js suggest-improvements phase3
   ```

3. **Read improvement roadmap** (take 10 min):
   Open `PROMPT_TUNING_BASELINE.md` → "Improvement Path" section

4. **Start refining prompts** based on specific suggestions

## Documentation Map

**Quick Reference**:
- This file (1-5 minute overview)

**Full Guides**:
- `PROMPT_TUNING.md` - Complete methodology
- `tools/README.md` - Tools documentation
- `IMPLEMENTATION_SUMMARY.md` - What was built

**Results & Analysis**:
- `PROMPT_TUNING_BASELINE.md` - Test results, improvement roadmap

## Getting Help

**Question**: How do I interpret the ADR score?
**Answer**: See `tools/adr-scorer.js` → "Scoring Interpretation" in PROMPT_TUNING.md

**Question**: What are the test cases testing?
**Answer**: See `PROMPT_TUNING_BASELINE.md` → "Test Cases & Scenarios"

**Question**: How do I improve Phase 1 specifically?
**Answer**: See `PROMPT_TUNING_BASELINE.md` → "Phase 1: Quick Wins"

---

**Start here**: Run `node tools/prompt-tuner.js test phase1 --mock` to see current baseline

Then read `PROMPT_TUNING_BASELINE.md` for improvement opportunities
