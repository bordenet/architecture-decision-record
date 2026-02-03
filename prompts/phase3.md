You are synthesizing a final, production-ready Architecture Decision Record (ADR).

Your job is to combine the best of the original draft with critical feedback to create the definitive ADR.

Reference the official ADR format: https://github.com/joelparkerhenderson/architecture-decision-record

## Original ADR (Phase 1 - Initial Draft)

{{PHASE1_OUTPUT}}

## Critical Feedback (Phase 2 - Review)

{{PHASE2_OUTPUT}}

## Your Synthesis Task

Create the final ADR by:

1. **Keeping what works**: Don't change sections that are already strong
2. **Fixing what's weak**: Address all identified gaps and vague language
3. **Adding missing elements**: Incorporate feedback about missing considerations
4. **Maintaining balance**: Ensure consequences remain honestly balanced (not weighted to positives)
5. **Improving specificity**: Replace vague language with concrete details

## Synthesis Decision Rules

When deciding between Phase 1 and feedback suggestions:
- **If Phase 1 is specific and concrete**: Keep it (don't weaken it)
- **If feedback suggests better specificity**: Adopt the specific version without hesitation
- **If Phase 1 is vague**: Replace with the concrete suggestion from Phase 2
- **NEVER average or water down**: Choose the clearer, more concrete version EVERY time
- **If both are strong but different**: Pick the one that better addresses the business drivers
- **Example of what NOT to do**: "may increase complexity (from Phase 1) with some mitigation (from Phase 2)" ❌
- **Example of what TO do**: "Requires distributed tracing implementation; debugging cross-service issues changes from grep-based to Jaeger visualization" ✅

## Critical Requirements for Final ADR

### Decision Section Must:
- Name the specific architectural approach chosen (not vague principles)
- Explain the RATIONALE (why this approach over alternatives)
- **Include explicit alternatives discussion** ("We considered X and Y, but chose Z because...")
- **Ground rationale in business drivers** (cost, time-to-market, team capability, risk mitigation)
- Include specific numbers/constraints from context where relevant
- Use decisive language ("will", "shall", "implements")

### Consequences Section Must:
- Include MINIMUM 3 positive consequences (specific, not generic)
- Include MINIMUM 3 negative consequences (honest, specific)
- **Address team factors explicitly** (training needs, skill gaps, hiring impact, team structure)
- **Include subsequent ADRs triggered by this decision** (e.g., "This necessitates decisions on X, Y, Z")
- **Include after-action review timing** (e.g., "Review in 30 days" or "after 3 production deployments")
- Address three dimensions: technical, organizational, operational
- Each consequence should be one substantive sentence, not a phrase
- Avoid generic words: "complexity", "overhead" - be specific about WHAT is complex

### Context Section Should:
- Reference specific numbers/facts that drive the decision
- Clearly state the problem that this decision solves
- Identify key constraints or trade-offs

## Interactive Question Phase (Final Synthesis)

**CRITICAL**: As you synthesize Phase 1 and Phase 2, ask 1-3 final clarifying questions to validate your synthesis:

These questions probe for:
- **Decision clarity** - "Did I understand the core decision correctly? Is there a better way to phrase it?"
- **Consequences completeness** - "Are there consequences I'm missing? What about [obvious impact]?"
- **Implementation readiness** - "Is this decision specific enough to implement? Or do you need more detail?"

**Format**: Return final questions BEFORE the synthesized ADR:

```
## Final Validation Questions

As I synthesized these two versions, I want to confirm a few things:

1. **On the core decision**: I'm reading this as "split the monolith into domain-driven microservices with independent databases and deployment pipelines". Is that the right decision? Or is there nuance I'm missing?

2. **On consequences**: The key negative impact I'm seeing is "requires distributed systems expertise and event-driven architecture mastery". Does this match your biggest concern? Or is there a different impact that matters more (e.g., cost, timeline, team retention)?

3. **On specificity**: Is this decision specific enough for your team to implement? Or do you need guidance on service boundaries, deployment architecture, or data migration strategy?

---

[Then provide the final ADR...]
```

**Why this matters**: Synthesis isn't mechanical averaging. It's about validating that you understood the decision correctly and that the final ADR will actually guide your team. These final questions catch misunderstandings before they're published.

---

## Output Format

Return the final ADR in this markdown format:

```markdown
# [Title]

## Status
[Status]

## Context
[Improved context addressing feedback]

## Decision
[Polished decision incorporating specificity feedback, alternatives discussion, and business drivers]

## Consequences

### Positive Consequences
[3+ specific positive impacts with details]

### Negative Consequences
[3+ specific negative impacts with honest assessment]

### Subsequent ADRs Triggered by This Decision
[List 2-3 architectural decisions that this decision necessitates]

### Recommended Review Timing
[Specify clear checkpoints for after-action review]

## If This ADR Is Updated Later

This is a **living document**. Document changes as amendments with dates:

### Amendment - YYYY-MM-DD
[What changed]: [Description]
Impact on decision: [Still valid? Needs revision? How does this affect implementation?]
```

## Quality Checklist Before Returning
- ✅ Decision names a specific approach (microservices, monorepo, event-driven, etc.)
- ✅ Decision explains why, not how
- ✅ **Decision includes alternatives discussion** ("We considered X and Y, but chose Z because...")
- ✅ **Decision is grounded in business drivers** (cost, time-to-market, capability, risk)
- ✅ 3+ positive consequences listed with specifics
- ✅ 3+ negative consequences listed with specifics
- ✅ **Team factors explicitly addressed** (training, skill gaps, hiring, team structure)
- ✅ Negative consequences are honest and realistic
- ✅ No vague words (improve, optimize, better, enhance, complexity)
- ✅ Specific technical implications (network latency, event-driven patterns, etc.)
- ✅ Organizational impact addressed (training needs, team coordination, etc.)
- ✅ **Subsequent ADRs section present** (lists 2-3 triggered decisions)
- ✅ **Recommended Review Timing present** (specific checkpoints)
- ✅ **Living document guidance included** (amendment pattern with dates)

Return the complete, production-ready ADR above. This is the version that will be published.
