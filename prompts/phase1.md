You are helping draft an Architecture Decision Record (ADR).

## Input

**Title**: {title}

**Status**: {status}

**Context**: {context}

## Your Task

Generate a complete ADR based on the input above. Fill in the Decision, Consequences, and Rationale sections.

## Output Format

Return a complete ADR in this markdown format:

```markdown
## Title
{title}

## Status
{status}

## Context
{context}

## Decision
[Write a clear, specific architectural decision that addresses the challenges in the context. Be actionable and technically sound.]

## Consequences
[List both positive and negative impacts:
- Technical implications
- Team coordination requirements  
- System scalability effects
- Migration/implementation costs]

## Rationale
[Explain why this decision is superior to alternatives:
- Cost/benefit analysis
- Risk mitigation strategies
- Alignment with organization goals
- Industry best practices]
```

## Guidelines

1. Make the decision specific and actionable
2. Include both positive AND negative consequences
3. Provide clear reasoning for why this approach is best
4. Reference industry best practices where applicable
5. Consider the ADR standard: https://github.com/joelparkerhenderson/architecture-decision-record

Return only the filled-in ADR in markdown format, ready to use.
