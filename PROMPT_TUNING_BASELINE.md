# Prompt Tuning Baseline Report

**Date**: December 2, 2025
**Status**: Baseline established, all three prompts tested

## Executive Summary

The ADR prompt tuning infrastructure has been deployed and tested against 5 realistic ADR scenarios. Current baseline scores show that all three phases need refinement before production use:

| Phase | Baseline Score | Status | Priority |
|-------|---|---|---|
| Phase 1 (Claude Draft) | 3.60/5.0 | Needs work | HIGH |
| Phase 2 (Gemini Review) | 2.06/5.0 | Major issues | CRITICAL |
| Phase 3 (Claude Synthesis) | 2.79/5.0 | Needs work | HIGH |

## Baseline Scores by Phase

### Phase 1: Claude Initial Draft - 3.60/5.0

**Strengths**:
- Completeness: 4.43/5.0 ✅ (all required sections present)
- Clarity: 3.57/5.0 (acceptable but room for improvement)

**Critical Issues**:
- **Consequences Balance: 1.80/5.0 ❌ FAILING**
  - Current prompt generates vague consequences
  - Lacks minimum 2-3 positive AND 2-3 negative impacts
  - Generic language ("complexity", "overhead") instead of specific impacts

**What's Working**:
- All ADRs have Status, Context, Decision, Consequences sections
- Decisions attempt to name approaches (though sometimes vaguely)
- Context is being preserved from input

**Top Improvements Needed**:
1. **HIGH PRIORITY**: Fix consequences balance - this is weighted 1.2x because it's critical to quality
2. **HIGH PRIORITY**: Increase decision specificity - eliminate "strategic approach", name the pattern
3. **MEDIUM PRIORITY**: Ground decisions in specific context facts (numbers, quotes, constraints)

### Phase 2: Gemini Critical Review - 2.06/5.0

**Critical Issues**:
- **Completeness: 1.00/5.0 ❌ CRITICAL FAILURE**
  - Current prompt doesn't generate feedback in the required structure
  - Mock responses are review text, not the 5-part feedback format

**What's Not Working**:
- Prompt asks for "Strengths/Weaknesses/Missing Elements/Suggested Improvements/Alternative Approaches"
- But generation isn't following this structure
- This cascades to Phase 3, which expects structured feedback

**Top Improvements Needed**:
1. **CRITICAL**: Enforce output structure - Phase 2 feedback MUST follow the 5-part format
2. **HIGH PRIORITY**: Make review sections more actionable ("Instead of 'be specific', say 'name the service boundary pattern'")
3. **MEDIUM PRIORITY**: Add framework to evaluate specific review dimensions (clarity, balance, implementability, etc.)

### Phase 3: Claude Synthesis - 2.79/5.0

**Issues**:
- **Completeness: 3.86/5.0** (acceptable but some sections missing context improvements)
- **Consequences Balance: 1.80/5.0 ❌ FAILING**
  - Inherits vague consequences from Phase 1
  - Feedback from Phase 2 isn't detailed enough to guide improvement

**Root Cause**: Phase 3 depends on Phase 2 providing specific, actionable feedback. Since Phase 2 is failing, Phase 3 has little to work with.

**Top Improvements Needed**:
1. **CRITICAL**: Fix Phase 2 output structure first - this unblocks Phase 3
2. **HIGH PRIORITY**: Add explicit synthesis rules ("choose the clearer option each time, don't water down")
3. **MEDIUM PRIORITY**: Strengthen rationale and alternative discussion

## Consequences Balance - The Critical Issue

Across all three phases, the **Consequences Balance** score is **1.80/5.0** - a critical failure.

**What the scorer is finding**:
- ❌ Consequences are listed but vague ("complexity", "overhead")
- ❌ Positive consequences outnumber negative (unbalanced)
- ❌ Using phrases instead of substantive sentences
- ❌ Missing specific technical implications

**Example of failing consequence**:
```
Negative Consequence: "May increase complexity"
```

**Example of what would pass**:
```
Negative Consequence: "Requires event-driven patterns for data consistency; 
transactions spanning multiple services become harder and must use eventual consistency models"
```

## Test Cases & Scenarios

All 5 test cases used realistically detailed context:

1. **Monolithic to Microservices** - 300% growth, 45min deployments, 2-3hr outages
2. **Framework Migration** - 5yr old jQuery, 6-week onboarding, 40% time on bugs
3. **Database Selection** - 500GB unstructured data, 30min queries, $150k/quarter cost
4. **Auth Strategy** - 8 different password policies, 12 security vulnerabilities
5. **API Versioning** - 1,200 integrations, 6-month deprecation policy

Each case includes specific numbers and constraints to evaluate prompt quality.

## Improvement Path

### Phase 1: Quick Wins (Focus First)
**Current**: 3.60/5.0 → **Target**: 4.5+/5.0

Changes needed:
1. Add explicit minimum requirement: "Include MINIMUM of 3 positive consequences"
2. Add explicit minimum requirement: "Include MINIMUM of 3 negative consequences"
3. Add consequence language guide: "Use 'requires', 'makes', 'adds', 'reduces', 'increases'"
4. Add specificity examples: Compare vague vs. specific consequence language
5. Add quality checklist before returning

**Estimated improvement**: +0.9 points (detailed requirements + examples improve output 30%+)

### Phase 2: Structure Fix (Prerequisite)
**Current**: 2.06/5.0 → **Target**: 4.0+/5.0

Critical change needed:
1. Enforce output format - feedback MUST be in 5 parts (Strengths/Weaknesses/Missing/Improvements/Implications)
2. Each part must be substantive (>100 chars)
3. Add specific review dimensions framework
4. Add example feedback showing expected specificity

**Estimated improvement**: +2.0 points (enforcing format is a hard requirement, not optional)

### Phase 3: Inherit Improvements (Will Improve Automatically)
**Current**: 2.79/5.0 → **Target**: 4.2+/5.0

Once Phase 1 & 2 are fixed:
1. Phase 1 will provide better-quality draft ADRs
2. Phase 2 will provide structured, actionable feedback
3. Phase 3 synthesis will have better material to work with

Additional improvements:
1. Strengthen synthesis rules ("choose clearer option each time")
2. Add rationale explanation requirement
3. Add comprehensive consequences requirement (3+ positive, 3+ negative)

**Estimated improvement**: +1.5 points (automatically inherits Phase 1+2 improvements, plus enhancements)

## Recommended Action Plan

### Week 1: Fix Phase 2 (Critical Path)
- [ ] Rewrite Phase 2 prompt to enforce output structure
- [ ] Add example feedback showing expected format
- [ ] Test Phase 2 output - verify 5-part structure
- [ ] Iterate until Phase 2 scores 4.0+

### Week 1-2: Strengthen Phase 1
- [ ] Add minimum consequence requirements
- [ ] Add consequence language guide with examples
- [ ] Add quality checklist
- [ ] Test Phase 1 against all 5 scenarios
- [ ] Iterate until Phase 1 scores 4.5+

### Week 2: Enhance Phase 3
- [ ] Strengthen synthesis rules
- [ ] Add comprehensive consequences requirement
- [ ] Test full 3-phase workflow
- [ ] Iterate until Phase 3 scores 4.2+

### Week 3: Validation
- [ ] Run full test suite: all 3 phases, all 5 scenarios
- [ ] Target: 80%+ of generated ADRs score 4.0+
- [ ] Document learned patterns
- [ ] Create real-world validation examples

## Key Metrics to Track

**Prompt Quality Metrics**:
- Average score per phase (target: 4.5+/5.0)
- Consequences balance score (target: 4.5+/5.0 - currently critical)
- Test pass rate (target: 80%+ scoring 4.0+)

**Common Issues to Monitor**:
- Vague consequence language (count of "complexity", "overhead", etc.)
- Missing negative consequences (count of unbalanced ADRs)
- Context grounding (% of decisions referencing specific context facts)

## Next Steps

1. **Run Phase 2 improvement test**: `node tools/prompt-tuner.js test phase2 --mock`
2. **Review Phase 2 suggestions**: `node tools/prompt-tuner.js suggest-improvements phase2`
3. **Edit prompts/phase2.md** with specific structure enforcement
4. **Re-test Phase 2**: Verify output structure improvement
5. **Continue iterating** on all three phases

## Files to Reference

- **Prompts**: `/prompts/phase1.md`, `/prompts/phase2.md`, `/prompts/phase3.md`
- **Scorer**: `/tools/adr-scorer.js` (scores quality across 5 criteria)
- **Tuner**: `/tools/prompt-tuner.js` (runs tests, generates suggestions)
- **Documentation**: `/PROMPT_TUNING.md` (full guide), `/tools/README.md` (tools overview)
- **Test Results**: `/prompt_tuning_results_architecture-decision-record/` (stored after each run)

## Success Criteria

✅ **Success** = 80%+ of generated ADRs score 4.0+/5.0 overall
- Phase 1 average: 4.5+/5.0
- Phase 2 average: 4.0+/5.0
- Phase 3 average: 4.2+/5.0
- Consequences Balance: 4.5+/5.0 (all phases)
- All 5 test cases passing (no consistently failing scenarios)

When these criteria are met, prompts are ready for production use with Claude and Gemini.
