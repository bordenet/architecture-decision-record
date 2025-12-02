You are helping draft an Architecture Decision Record (ADR) following the Michael Nygard template.

Your goal is to produce a clear, implementable architectural decision that will guide team decisions for years.

## Input

**Title**: {title}

**Status**: {status}

**Context**: {context}

## Your Task

Generate a complete ADR based on the input above. You must:

1. **Decision section**: State a specific, actionable architectural choice (not vague principles)
2. **Consequences section**: List BOTH positive and negative impacts with equal weight (this is mandatory)

## Critical Requirements for Quality

### Decision Section Must:
- Name a specific architectural approach, pattern, or technology choice (e.g., "microservices", "monorepo", "event-driven", not "improve scalability")
- Explain WHY this approach is chosen, not HOW to implement it
- Include **explicit alternatives comparison**: "We considered [X], [Y], and [Z], but chose [decision] because..."
- Be implementable by a reasonable engineering team
- Be specific enough that someone reading it knows what decision was made
- Use clear action verbs: use, adopt, implement, migrate, split, combine, establish, enforce
- Ground rationale in specific business drivers: cost, time-to-market, team capability, risk mitigation

### Examples of Vague vs. Specific Decisions
**VAGUE (DO NOT DO THIS)**:
- "We will adopt a strategic approach to improve scalability" ❌
- "We will implement a critical architectural intervention" ❌
- "We will make the system more maintainable" ❌

**SPECIFIC (DO THIS)**:
- "We considered monolith optimization and strangler pattern (slower, $200k cost to maintain), but will migrate to domain-driven microservices, with each domain owning its own database and deploying independently. This enables 10x scaling for the growth we've seen and faster deployments (5 min vs. 45 min)." ✅
- "We considered shared libraries in existing monorepo and package management (tight coupling), but will establish a monorepo structure for our five frontend services. This reduces code duplication 60% and enables shared component libraries across teams." ✅
- "We considered point-to-point integration (unmaintainable at scale) and synchronous RPCs (tight coupling), but will adopt event-driven architecture with Kafka. This decouples order processing, inventory, and shipping domains, enabling independent scaling." ✅

### Consequences Section Must:
- Include a MINIMUM of 3 positive consequences (concrete, not generic)
- Include a MINIMUM of 3 negative consequences (be honest about trade-offs)
- **Include subsequent ADRs triggered by this decision** (e.g., "This triggers decisions on: service mesh selection, distributed tracing strategy, API gateway choice")
- **Include after-action review guidance** (e.g., "Review in 30 days to compare actual deployment time with 5-minute target")
- **Address team factors**: team skill gaps, training requirements, hiring needs, team structure impact
- State what becomes EASIER and what becomes HARDER
- List specific technical implications (e.g., "requires event-driven patterns", "adds network latency", "needs distributed tracing")
- Address team/organizational impact (training needs, hiring, coordination overhead)
- Use clear consequence language: "will", "may", "requires", "makes", "reduces", "increases"

### Examples of Vague vs. Specific Consequences
**VAGUE (DO NOT DO THIS)**:
- "May increase complexity" ❌
- "Makes operations harder" ❌
- "Better scalability" ❌
- "Requires more resources" ❌

**SPECIFIC (DO THIS)**:
- "Requires implementing event-driven patterns for data consistency; services can no longer use distributed transactions" ✅
- "Adds 50-100ms network latency for inter-service calls; request tracing becomes mandatory" ✅
- "Enables horizontal scaling of individual services; microservice #1 can handle 10x traffic without scaling all others" ✅
- "Requires hiring expertise in message queues (Kafka, RabbitMQ) and distributed systems; existing team needs 6-8 weeks training" ✅
- "Operational teams must maintain separate deployment pipelines for each service, increasing release coordination from 30-minute monolithic releases to independent per-service deployments (5 minutes each)" ✅
- "Requires investment in distributed tracing tooling (X-Ray, Jaeger); debugging cross-service issues that once required grep now need trace visualization" ✅

## Interactive Question Phase

**CRITICAL**: Before generating the ADR, ask 3-5 clarifying questions to strengthen the decision:

These questions should probe for:
- Missing business drivers ("What's the financial impact?", "What's the timeline pressure?")
- Unstated alternatives ("What other options did you consider?", "Why not just [obvious alternative]?")
- Team factors ("What's your team's skill level in this area?", "Do you have capacity to learn this?")
- Hidden constraints ("Are there organizational/political constraints?", "Legacy system dependencies?")
- Success metrics ("How will you know this decision worked?", "What are failure scenarios?")

**Example questions to ask** (customize based on context):
- "You mentioned 300% growth - what's the timeframe? This month? Next year?"
- "Why is deployment time critical - what blocks are you hitting specifically?"
- "Have you considered [obvious alternative]? What made you rule it out?"
- "Will your team need hiring/training? What's the budget for that?"
- "What would failure look like for this decision?"

**Format**: Return questions BEFORE the ADR, like:
```
## Clarifying Questions

I'd like to ask a few questions to make this ADR stronger:

1. **On timing**: You mention 45-minute deployments are blocking features. How often are you trying to deploy per week?
2. **On alternatives**: You considered monolith optimization but chose microservices. What was the cost comparison?
3. **On team**: Your team is skilled in JavaScript - do you have distributed systems expertise for event-driven patterns?
4. **On success**: How will you measure if this migration actually improved deployment velocity?
5. **On constraints**: Are there any organization/political constraints that influence this decision?

---

# [ADR Title]

[Then proceed with the full ADR as usual...]
```

**Why this matters**: The best ADRs emerge from dialogue. Users often don't think deeply about alternatives, team impacts, or success metrics until prompted. Your job is to ask the smart questions that reveal what they're missing.

---

## Output Format

Return the completed ADR in this markdown format:

```markdown
# {title}

## Status
{status}

## Context
{context}

## Decision
[Your decision statement here - specific and actionable, INCLUDING alternatives comparison and business drivers]

## Consequences

### Positive Consequences
[At least 2-3 specific positive impacts]

### Negative Consequences
[At least 2-3 specific negative impacts]

### Subsequent ADRs Triggered by This Decision
[List 2-3 architectural decisions that this decision necessitates]

### Recommended Review Timing
[Specify when to review: e.g., "30 days", "end of Q1", or "after 3 deployments"]

## If This ADR Is Updated Later

This is a **living document**. If circumstances change (new tools, new constraints, new learning), add a dated amendment instead of modifying the original text:

### Amendment - YYYY-MM-DD
[Date]: [What changed]
Impact on decision: [How does this affect the original decision? Still valid? Needs revision?]

Example: 
### Amendment - 2025-12-15
Kubernetes became the standard for orchestration (was Mesos). Impact: Our service mesh strategy (Istio) is now more aligned with industry standard. Decision remains valid; implementation easier than initially planned.
```

## Context Grounding
Reference specific facts from the context in your Decision and Consequences:
- Include specific numbers: "45-minute deployments", "300% growth", "$150k annual cost"
- Reference specific problems: "2-3 hour outages", "6-week onboarding", "30-minute query times"
- Ground rationale in context: "The 300% growth makes current monolith unscalable, requiring..."

**Example**: Instead of "improves deployment", say "Reduces 45-minute deployments to 5-minute per-service deployments, eliminating the need for coordinated releases"

## Quality Checklist Before Returning
- ✅ Decision names a specific architectural approach (microservices, monorepo, event-driven, etc.)
- ✅ Decision explains WHY (references specific context facts)
- ✅ **Decision includes alternatives comparison** ("We considered X and Y, but chose Z because...")
- ✅ **Decision grounds rationale in business drivers** (cost, time-to-market, team capability, etc.)
- ✅ Decision does NOT explain HOW (no implementation details like "use Kafka")
- ✅ At least 3 positive consequences listed with concrete technical/organizational specifics
- ✅ At least 3 negative consequences listed with concrete technical/organizational specifics
- ✅ Each consequence is a substantive sentence, not a phrase
- ✅ Negative consequences are honest and realistic (not minimized)
- ✅ Consequences reference specific impacts: "adds X latency", "requires Y expertise", "enables Z benefit"
- ✅ **Consequences explicitly address team factors**: training needs, skill gaps, hiring requirements, team structure changes
- ✅ Consequences address ALL three dimensions: technical, organizational, operational
- ✅ **NO vague consequence language**: Replace "complexity" with specific impacts, "overhead" with measurable costs
- ✅ **Subsequent ADRs section lists 2-3 triggered decisions** (e.g., "service mesh selection", "distributed tracing strategy")
- ✅ **Recommended Review Timing specifies clear checkpoints** (not vague; e.g., "30 days" not "later")

Return the complete ADR formatted as markdown above. Be specific and concrete throughout.
