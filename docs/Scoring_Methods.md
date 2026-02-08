# Architecture Decision Record Scoring Methods

This document describes the scoring methodology used by the ADR Validator.

## Overview

The validator scores ADRs on a **100-point scale** across four equally-weighted dimensions. The scoring emphasizes decision clarity, options considered, and balanced consequence analysis.

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Context** | 25 | Problem clarity, constraints, quantification, business focus |
| **Decision** | 25 | Clarity, options considered, rationale, action verbs |
| **Consequences** | 25 | Positive/negative/neutral, team factors, vague term penalty |
| **Status** | 25 | Status values, dates, required sections |

## Dimension Details

### 1. Context (25 pts)

**Scoring Breakdown:**
- Context section with clear language: 10 pts
- Constraints identified: 5 pts
- Quantified (metrics/data): 5 pts
- Business focus language: 5 pts

**Detection Patterns:**
```javascript
contextSection: /^#+\s*(context|background|problem|situation|why)/im
contextLanguage: /\b(context|background|problem|situation|challenge|need|requirement|constraint|driver|force)\b/gi
constraints: /\b(constraint|limitation|requirement|must|should|cannot|restriction|boundary)\b/gi
quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi
businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value|stakeholder)\b/gi
```

### 2. Decision (25 pts)

**Scoring Breakdown:**
- Decision section with clear statement: 10 pts
- Options considered (2+): 5 pts
- Rationale with evidence: 5 pts
- Required action verbs used: 5 pts
- Vague decision language: -5 pts penalty

**Required Action Verbs (from phase1.md):**
```javascript
actionVerbs: /\b(use|adopt|implement|migrate|split|combine|establish|enforce)\b/gi
```

**Vague Decision Detection:**
```javascript
VAGUE_DECISION_PATTERNS: /\b(strategic\s+approach|architectural\s+intervention|improve\s+scalability|more\s+maintainable|better\s+architecture|enhance\s+performance|optimize\s+the\s+system|modernize\s+the\s+platform|transform\s+the\s+infrastructure)\b/gi
```

**Example of vague vs clear:**
- ❌ "We will make the system more maintainable"
- ✅ "We will adopt microservices using Spring Boot"

### 3. Consequences (25 pts)

**Scoring Breakdown:**
- Consequences section present: 5 pts
- Positive consequences listed: 5 pts
- Negative consequences listed: 5 pts
- Neutral/trade-off consequences: 5 pts
- Team factors (training/skills/hiring): 5 pts
- Vague consequence terms: -5 pts penalty

**Consequence Categories:**
```javascript
positive: /\b(benefit|advantage|improve|enable|allow|simplify|reduce|faster|easier|better|scalable|maintainable|testable|decoupled|independent|automated)\b/gi
negative: /\b(risk|cost|increase|harder|slower|difficult|complex|dependency|require|need|learning\s+curve|training)\b/gi
neutral: /\b(trade.?off|either|or|depends|varies|conditional|sometimes|may|might|could)\b/gi
```

**Vague Consequence Terms (banned per phase1.md):**
```javascript
VAGUE_CONSEQUENCE_TERMS: /\b(adds?\s+complexity|additional\s+overhead|increased?\s+complexity|more\s+overhead)\b/gi
```

**Required Replacement:**
- ❌ "adds complexity" → ✅ "requires 2 weeks developer training"
- ❌ "additional overhead" → ✅ "$5K/month infrastructure cost"

**Team Factors Detection:**
```javascript
teamPatterns: /training.*need|skill gap|hiring impact|team ramp|learning curve|expertise required|onboarding|team structure|hiring|staffing/i
```

### 4. Status (25 pts)

**Scoring Breakdown:**
- Status clearly indicated: 10 pts
- Date present: 5 pts
- Required sections present: 10 pts (weighted by section count)

**Status Values:**
```javascript
statusValues: /\b(proposed|accepted|deprecated|superseded|rejected|draft|approved|implemented)\b/gi
```

**Required Sections:**
- Context, Decision, Status (critical)
- Options, Consequences (supporting)

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| "Strategic approach to modernization" | Vague decision pattern triggers penalty |
| "Adds complexity to the system" | Vague consequence term triggers penalty |
| Decision without action verbs | Action verb requirement not met |
| Consequences without negatives | Negative consequence check fails |
| Missing team impact | Team factors detection flags gap |
| "30 day review" only | Expanded review timing patterns required |

## Calibration Notes

### Action Verbs Are Required
ADRs must use specific action verbs: use, adopt, implement, migrate, split, combine, establish, enforce. "We will improve..." is not a decision.

### Balanced Consequences
Every decision has trade-offs. ADRs with only positive consequences are incomplete. Negatives must be quantified.

### Team Factor Reality
Phase1.md requires addressing training needs, skill gaps, and hiring impact. Missing these = missing real consequences.

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | Architecture-ready - clear decision, balanced trade-offs |
| 60-79 | B | Good - needs consequence or options refinement |
| 40-59 | C | Incomplete - vague decision or missing consequences |
| 20-39 | D | Weak - restart with specific language |
| 0-19 | F | Not an ADR - missing structure entirely |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)

