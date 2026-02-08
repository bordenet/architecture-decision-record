# ADVERSARIAL REVIEW: architecture-decision-record

## CONTEXT

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for an Architecture Decision Record (ADR) assistant tool. ADRs document architectural choices using the Michael Nygard template.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates initial ADR draft with alternatives comparison
2. **Phase 2 (Gemini)** - Reviews for completeness and balance
3. **Phase 3 (Claude)** - Synthesizes final ADR
4. **LLM Scoring (prompts.js)** - Sends ADR to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL ALIGNMENT CHAIN

These 5 components **MUST be perfectly aligned**:

| Component | Purpose | Risk if Misaligned |
|-----------|---------|-------------------|
| phase1.md | Generates ADR structure | LLM produces content validator can't detect |
| phase2.md | Reviews for balance | Different criteria than scoring rubric |
| phase3.md | Final synthesis | Quality gate doesn't match validator |
| prompts.js | LLM scoring rubric | Scores dimensions validator doesn't check |
| validator.js | JavaScript scoring | Misses patterns prompts.js rewards |

---

## CURRENT TAXONOMY (4 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight Description |
|-----------|------------|--------------|-------------------|
| Context | 25 pts | 25 pts | Problem description, constraints, business focus |
| Decision | 25 pts | 25 pts | Decision statement, options considered, rationale |
| Consequences | 25 pts | 25 pts | Balance (3+ pos/3+ neg), team factors, subsequent ADRs |
| Status | 25 pts | 25 pts | Status value, date, completeness |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (147 lines)

**Key Elements:**
- Decision must name SPECIFIC architectural approach (microservices, monorepo, event-driven)
- Include explicit alternatives comparison: "We considered [X], [Y], [Z], but chose..."
- MINIMUM 3 positive AND 3 negative consequences (MANDATORY)
- Include subsequent ADRs triggered by this decision
- Include after-action review guidance ("Review in 30 days...")
- Address team factors: skill gaps, training, hiring

**Examples of Vague vs Specific Decisions (from phase1.md):**
- ❌ VAGUE: "We will adopt a strategic approach to improve scalability"
- ✅ SPECIFIC: "We will migrate to domain-driven microservices...enabling 10x scaling"

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (179 lines)

**Scoring Rubric:**

### 1. Context (25 points)
- Context Section (10 pts): Clear problem/situation description
- Constraints (8 pts): Requirements, limitations, forces
- Business Focus (7 pts): Tied to business/stakeholder needs

### 2. Decision (25 points)
- Decision Statement (10 pts): Clear, unambiguous
- Options Considered (8 pts): Alternatives with pros/cons
- Rationale (7 pts): WHY this decision was made

### 3. Consequences (25 points)
- Consequences Section (5 pts): Dedicated section
- Balance (10 pts): 3+ positive AND 3+ negative
- Team Factors (5 pts): Training, skill gaps, hiring
- Subsequent ADRs (3 pts): Triggered decisions
- Review Timing (2 pts): After-action review specified

### 4. Status (25 points)
- Status Value (10 pts): Proposed/Accepted/Deprecated/Superseded
- Date (7 pts): When decision was made
- Completeness (8 pts): All sections present

---

# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. ALTERNATIVES REQUIREMENT
Phase1.md requires explicit alternatives comparison. Does validator.js:
- ✅ Detect "We considered [X], but chose..."?
- ✅ Reward multiple alternatives?

Look for: `alternative`, `considered`, `rejected`, `instead`

### 2. CONSEQUENCES BALANCE (Critical)
Phase1.md requires MINIMUM 3 positive AND 3 negative consequences. Does validator.js:
- ✅ Count positive consequences?
- ✅ Count negative consequences?
- ✅ Enforce the 3+/3+ minimum?

Look for: `positive`, `negative`, `benefit`, `drawback`, `trade-off`

### 3. SUBSEQUENT ADRs
Phase1.md requires listing triggered ADRs. Does validator.js detect this?

Look for: `triggers`, `subsequent`, `follow-up`, `ADR-`

### 4. AFTER-ACTION REVIEW
Phase1.md requires review timing ("Review in 30 days"). Does validator.js detect this?

Look for: `review`, `revisit`, `days`, `weeks`, `months`

### 5. TEAM FACTORS
prompts.js allocates 5 pts for team factors. Does validator.js detect:
- Training needs?
- Skill gaps?
- Hiring impact?

### 6. SLOP DETECTION
Does validator.js import and apply slop penalties?

```bash
grep -n "getSlopPenalty\|calculateSlopScore\|slop" validator.js
```

---

## DELIVERABLES

### 1. CRITICAL FAILURES
For each issue: Issue, Severity, Evidence, Fix

### 2. ALIGNMENT TABLE
| Component | Dimension | Weight | Aligned? | Issue |

### 3. GAMING VULNERABILITIES
- Vague decision wording ("strategic approach")
- Missing alternatives
- Imbalanced consequences (all positive, no negative)

### 4. RECOMMENDED FIXES (P0/P1/P2)

---

**VERIFY CLAIMS. Evidence before assertions.**

