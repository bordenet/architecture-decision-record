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
- Be implementable by a reasonable engineering team
- Be specific enough that someone reading it knows what decision was made
- Use clear action verbs: use, adopt, implement, migrate, split, combine, establish, enforce

### Examples of Vague vs. Specific Decisions
**VAGUE (DO NOT DO THIS)**:
- "We will adopt a strategic approach to improve scalability" ❌
- "We will implement a critical architectural intervention" ❌
- "We will make the system more maintainable" ❌

**SPECIFIC (DO THIS)**:
- "We will migrate from monolithic architecture to domain-driven microservices, with each domain owning its own database and deploying independently" ✅
- "We will establish a monorepo structure for our five frontend services to reduce code duplication and enable shared component libraries" ✅
- "We will adopt event-driven architecture with a message queue (Kafka) to decouple our order processing, inventory, and shipping domains" ✅

### Consequences Section Must:
- Include a MINIMUM of 3 positive consequences (concrete, not generic)
- Include a MINIMUM of 3 negative consequences (be honest about trade-offs)
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

## Output Format

Return ONLY the completed ADR in this markdown format (no explanation, no preamble):

```markdown
# {title}

## Status
{status}

## Context
{context}

## Decision
[Your decision statement here - specific and actionable]

## Consequences

### Positive Consequences
[At least 2-3 specific positive impacts]

### Negative Consequences
[At least 2-3 specific negative impacts]
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
- ✅ Decision does NOT explain HOW (no implementation details like "use Kafka")
- ✅ At least 3 positive consequences listed with concrete technical/organizational specifics
- ✅ At least 3 negative consequences listed with concrete technical/organizational specifics
- ✅ Each consequence is a substantive sentence, not a phrase
- ✅ Negative consequences are honest and realistic (not minimized)
- ✅ Consequences reference specific impacts: "adds X latency", "requires Y expertise", "enables Z benefit"
- ✅ Consequences address ALL three dimensions: technical, organizational, operational

Return the complete ADR formatted as markdown above. Be specific and concrete throughout.
