# Architecture Decision Record - Adversarial Review

**Status:** ✅ Complete
**Date:** 2026-02-08

---

## Gemini Findings Verification

| Finding | Gemini Claim | Verdict | Action |
|---------|--------------|---------|--------|
| 1. Vague Language Incentivization | "complexity"/"overhead" in negative pattern rewards banned terms | ✅ REAL | Removed from negative, added VAGUE_CONSEQUENCE_TERMS |
| 2. 3+ Consequence Count | Validator only checks presence, not count | ❌ FALSE | Lines 467-480 DO check `posCount >= 3 && negCount >= 3` |
| 3. Rigid Review Timing | Only 30/60/90 days | ⚠️ PARTIAL | Pattern had `review in \d+` but missed "45 days review" |
| 4. Vague Decision Mimicry | No detection of banned vague phrases | ✅ REAL | Added VAGUE_DECISION_PATTERNS with -5 pts penalty |
| 5. Subsequent ADR False Positive | "triggers decision" too loose | ⚠️ PARTIAL | Tightened to require topic after "triggers decision" |

## Fixes Implemented

### 1. Vague Consequence Terms (Finding 1)
- Removed "complexity" and "overhead" from `CONSEQUENCES_PATTERNS.negative`
- Added `VAGUE_CONSEQUENCE_TERMS` pattern: `/\b(complexity|overhead|difficult|challenging|problematic|issues?|concerns?)\b/gi`
- Added -3 pts penalty in `scoreConsequences()` for vague terms
- Added specific negative terms: latency, coupling, dependency, bottleneck, single.point.of.failure, migration.effort

### 2. Vague Decision Detection (Finding 4)
- Added `VAGUE_DECISION_PATTERNS`: "strategic approach", "architectural intervention", "improve scalability", etc.
- Added -5 pts penalty in `scoreDecision()` for vague decisions
- Added action verb detection: use, adopt, implement, migrate, split, combine, establish, enforce
- Added +2 pts bonus for using 2+ action verbs

### 3. Review Timing Pattern (Finding 3)
- Expanded pattern to: `/\b\d+\s*(days?|weeks?|months?)\s*(review|reassess|revisit)|after-action|review.*timing|recommended.*review|review in \d+|quarterly\s+review|annual\s+review/i`
- Now catches: "45 days review", "2 weeks review", "quarterly review"

### 4. Subsequent ADR Pattern (Finding 5)
- Tightened to: `/subsequent ADR|follow-on ADR|triggers ADR|future ADR|ADR-\d+|triggers.*(?:decision|choice).*(?:on|for|about|regarding)\s+\w+/i`
- Requires topic after "triggers decision" (e.g., "triggers decision on service mesh")

### 5. Detection Functions Updated
- `detectDecision()`: Added `hasActionVerbs`, `actionVerbCount`, `hasVagueDecision`, `vagueDecisionCount`
- `detectConsequences()`: Added `hasVagueConsequences`, `vagueConsequenceCount`

## Tests
All 472 tests pass (added 1 new test for vague consequence detection).

