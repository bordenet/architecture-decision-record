# ADR Tools

Tools for generating, scoring, and tuning Architecture Decision Record (ADR) prompts.

## Tools

### adr-scorer.js
Evaluates ADR quality using objective criteria.

```bash
node tools/adr-scorer.js path/to/adr.md
```

**Scoring criteria**:
- Completeness: All required sections present and substantive
- Clarity: Clear, specific language without vague terms
- Consequences Balance: Both positive AND negative impacts listed
- Technical Soundness: Specific, implementable decision
- Industry Alignment: Follows Michael Nygard format

**Output**: Full scoring report with recommendations

### prompt-tuner.js
Tests and refines ADR generation prompts.

```bash
# Test a phase with mock responses
node tools/prompt-tuner.js test phase1 --mock

# Get improvement suggestions
node tools/prompt-tuner.js suggest-improvements phase1

# Analyze stored results
node tools/prompt-tuner.js analyze-results phase1
```

**Features**:
- 5 realistic test cases covering different ADR scenarios
- Mock LLM responses for offline testing
- Automatic scoring against quality criteria
- Improvement suggestions based on test results
- Results saved to `prompt_tuning_results_architecture-decision-record/`

## How They Work Together

```
Your ADR Input
     ↓
[prompts/phase1.md] → LLM → ADR Draft
     ↓
[prompts/phase2.md] → LLM → Critical Review
     ↓
[prompts/phase3.md] → LLM → Final ADR
     ↓
[adr-scorer.js] → Quality Score (1-5) + Recommendations
     ↓
[prompt-tuner.js] → Test Results + Improvement Suggestions
```

## Typical Workflow

1. **Generate ADR**: Use phase1-3 prompts with Claude/Gemini
2. **Score result**: `node tools/adr-scorer.js output.md`
3. **Identify issues**: Review scoring report
4. **Test prompts**: `node tools/prompt-tuner.js test phase1 --mock`
5. **Get suggestions**: `node tools/prompt-tuner.js suggest-improvements phase1`
6. **Refine prompts**: Edit `prompts/phase1.md` based on suggestions
7. **Re-test**: Verify improvements

## Test Cases

The prompt tuner includes 5 test cases:

1. **Monolithic to Microservices** - Scalability issues, deployment bottlenecks
2. **Framework Migration** - Maintainability and developer productivity
3. **Database Selection** - Performance, cost, retention constraints
4. **Auth Strategy** - Security and consistency across services
5. **API Versioning** - Partner compatibility and deprecation

Each case includes realistic context that demands specific, implementable decisions.

## Quality Targets

| Criterion | Target | Weight |
|-----------|--------|--------|
| Completeness | 4.5+/5 | 1.0 |
| Clarity | 4.5+/5 | 1.0 |
| Consequences Balance | 4.5+/5 | 1.2 ← CRITICAL |
| Technical Soundness | 4.5+/5 | 1.0 |
| Industry Alignment | 4.5+/5 | 0.9 |
| **Overall** | **4.5+/5** | — |

The goal is 80%+ of generated ADRs scoring 4.0+ overall.

## Improvement Priorities

**High Impact** (focus first):
- Consequences balance (weight 1.2x) - ensure honest positive/negative
- Decision clarity - must name specific approach
- Concrete examples - beats generic descriptions

**Medium Impact**:
- Context grounding - reference specific numbers
- Organizational realism - acknowledge costs and constraints
- Alternative consideration - don't oversell single approach

**Lower Impact**:
- Format compliance - usually OK if content is strong
- Rationale depth - important but secondary to clarity

## Common Issues & Fixes

### Decision is vague
**Problem**: "We will adopt a strategic approach"
**Fix**: "We will split the monolith into domain-driven microservices"

### Consequences are generic
**Problem**: "Will have more complexity"
**Fix**: "Requires event-driven patterns for data consistency, adds network latency of 50-100ms per call, needs distributed tracing infrastructure"

### Missing negative consequences
**Problem**: Lists 4 positive, 1 negative
**Fix**: Ensure 3+ of each by addressing: technical debt, team skills, operational overhead, migration risk

### Decision doesn't address context
**Problem**: Context mentions "45-minute deployments", decision doesn't reference this
**Fix**: Tie decision to specific problems: "Enables deployment of individual services without database locks, reducing outage duration"

## References

- **Michael Nygard ADR Format**: https://github.com/joelparkerhenderson/architecture-decision-record
- **ADR Examples**: https://github.com/joelparkerhenderson/architecture-decision-record/tree/main/adr
- **Prompt Tuning Guide**: See `../PROMPT_TUNING.md`

## Next Steps

1. Run baseline tests: `node tools/prompt-tuner.js test phase1 --mock`
2. Review current prompt quality
3. Get specific improvement suggestions
4. Edit prompts to address top issues
5. Re-test to verify improvements
6. Iterate until 4.5+/5.0 consistently achieved
