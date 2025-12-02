You are refining an Architecture Decision Record (ADR) based on critical review feedback.

Your job is to analyze the draft ADR and produce an improved version that addresses identified weaknesses while maintaining what works well.

Reference the official ADR format: https://github.com/joelparkerhenderson/architecture-decision-record

## Draft ADR (Original)

{phase1_output}

## Your Refinement Task

Review the ADR across these dimensions and produce an improved version:

### 1. Decision Specificity
- Does the decision name a specific architectural approach (microservices, event-driven, monorepo, etc.)?
- Does it explain WHY, not just WHAT?
- **Does it include explicit alternatives comparison** ("We considered X and Y, but chose Z because...")?
- **Is the rationale grounded in business drivers** (cost, time-to-market, team capability, risk)?
- Are there any vague words (improve, optimize, better, enhance, complexity, overhead)?

### 2. Consequences Balance & Depth
- Are BOTH positive AND negative consequences equally present?
- Do consequences include specific, measurable impacts (not generic statements)?
- Are three dimensions covered: technical, organizational, operational?
- Does each consequence address WHAT the impact is and HOW it affects the team?
- **Are subsequent ADRs triggered by this decision mentioned** (e.g., "This necessitates decisions on X, Y, Z")?
- **Is after-action review timing specified** (e.g., "Review in 30 days" not "monitor later")?

### 3. Context Grounding
- Are specific numbers/facts from the context referenced in the decision and consequences?
- Does the decision clearly solve the problem stated in Context?
- Could someone understand WHY this decision was chosen over alternatives?

## Critical Improvements Required

**If Decision is Vague**: Replace with specific architectural pattern (e.g., "domain-driven microservices" not "improve scalability")

**If Consequences are Generic**: Replace with concrete, measurable impacts:
- VAGUE: "May increase complexity" ❌
- SPECIFIC: "Requires event-driven patterns for data consistency; services can't use distributed transactions" ✅

**If Balance is Off**: Ensure minimum 3 positive AND 3 negative consequences. Be honest about trade-offs.

**If Missing Impact Areas**: Add consequences addressing:
- Technical: network latency, distributed systems patterns, technology requirements
- Organizational: training needs, team coordination overhead, hiring requirements
- Operational: deployment complexity, monitoring/observability needs, runbooks

## Output Format

Return ONLY the improved ADR in this markdown format (no explanation, no preamble):

```markdown
# [Title]

## Status
[Status]

## Context
[Original context - keep as-is unless critical gap identified]

## Decision
[Improved decision with specific architectural approach, alternatives comparison, business drivers, and clear rationale]

## Consequences

### Positive Consequences
[3+ specific, concrete positive impacts with details]

### Negative Consequences
[3+ specific, concrete negative impacts with honest assessment]

### Subsequent ADRs Triggered by This Decision
[List 2-3 architectural decisions that this decision necessitates]

### Recommended Review Timing
[Specify clear checkpoints for after-action review]
```

## Quality Checklist Before Returning
- ✅ Decision names a specific approach (not vague principles)
- ✅ Decision explains WHY, not HOW
- ✅ **Decision includes alternatives comparison** ("We considered X, but chose Y because...")
- ✅ **Decision is grounded in business drivers** (cost, time-to-market, capability, risk)
- ✅ 3+ positive consequences listed with concrete specifics
- ✅ 3+ negative consequences listed with concrete specifics
- ✅ No vague words (complexity, overhead, improve, optimize, better)
- ✅ Specific technical implications (latency, patterns, technology requirements)
- ✅ Organizational impact addressed (training, team coordination, expertise)
- ✅ Operational impact addressed (deployment, monitoring, dependencies)
- ✅ Each consequence is a substantive sentence, not a phrase
- ✅ **Subsequent ADRs section present** (lists 2-3 triggered decisions)
- ✅ **Recommended Review Timing present** (specific checkpoints, not vague timelines)

Return the complete, refined ADR above. This version will feed into final synthesis.
