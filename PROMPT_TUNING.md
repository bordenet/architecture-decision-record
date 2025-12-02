# Prompt Tuning for ADR Generation

This document describes the prompt tuning infrastructure for optimizing the three Claude/Gemini prompts that guide ADR generation.

## Quick Start

Test the prompts against realistic scenarios:

```bash
# Test phase 1 (initial draft) with mock responses
node tools/prompt-tuner.js test phase1 --mock

# Get suggestions for improving phase 1
node tools/prompt-tuner.js suggest-improvements phase1

# Analyze results across all test cases
node tools/prompt-tuner.js analyze-results phase1
```

## The Three-Phase Workflow

### Phase 1: Claude Initial Draft
**File**: `prompts/phase1.md`
**Role**: Generate a complete, specific ADR draft from user inputs
**Key Requirements**:
- Decision must name a specific architectural approach (e.g., "microservices", not "improve scalability")
- Decision must explain WHY, not HOW
- Consequences must list 2-3 positive AND 2-3 negative impacts

### Phase 2: Gemini Critical Review
**File**: `prompts/phase2.md`
**Role**: Identify gaps, weaknesses, and missed opportunities
**Key Requirements**:
- Review across 5 dimensions: specificity, consequences balance, context grounding, organizational realism, implementability
- Provide constructive, specific feedback (not just "add more detail")
- Highlight honest weaknesses, don't validate weak work

### Phase 3: Claude Synthesis
**File**: `prompts/phase3.md`
**Role**: Create final, production-ready ADR from draft + feedback
**Key Requirements**:
- Choose the clearer option each time (don't average/water down)
- Maintain honest balance in consequences (don't weight toward positive)
- Ensure final ADR is 3+ positive AND 3+ negative consequences

## Quality Scoring

The `tools/adr-scorer.js` evaluates ADR quality across five criteria:

1. **Completeness (1.0 weight)**
   - All required sections present (Status, Context, Decision, Consequences)
   - Status is valid (Proposed, Accepted, Superseded, Deprecated)
   - Decision and Consequences have substantive content (>100 chars each)

2. **Clarity (1.0 weight)**
   - No vague language (better, improve, optimize, easier, efficient)
   - Uses clear action verbs (use, adopt, implement, replace, migrate, split, combine)
   - Context clearly states the problem

3. **Consequences Balance (1.2 weight - CRITICAL)**
   - Lists positive consequences (not just phrases)
   - Lists negative consequences (not just phrases)
   - Minimum 2 positive AND 2 negative (3+ preferred)
   - Uses consequence language (will, may, requires, makes, reduces, increases)

4. **Technical Soundness (1.0 weight)**
   - Decision is specific (not generic)
   - Decision is implementable
   - No implementation details (avoid "use X framework")
   - Addresses root cause from context

5. **Industry Alignment (0.9 weight)**
   - Follows Michael Nygard ADR format
   - Decision focuses on "why" not "how"
   - Context explains constraints/alternatives

## Running the Scorer

Score any ADR file:

```bash
node tools/adr-scorer.js path/to/adr.md
```

Output includes:
- Overall score (1-5 scale)
- Scores for each criterion
- Detailed pass/fail for each check
- Recommendations for improvement

## Test Cases

The tuning tool includes 5 realistic test cases:

1. **Monolithic to Microservices Migration** - Scalability and deployment bottlenecks
2. **Frontend Framework Migration** - Maintainability and developer productivity
3. **Database Technology Selection** - Data volume and cost constraints
4. **Authentication Strategy** - Security and consistency across services
5. **API Versioning Strategy** - Partner integration and backward compatibility

Each test case includes realistic context statements that reveal:
- Specific problems (not generic ones)
- Quantified impact (% growth, hours, $ cost, etc.)
- Team/organizational constraints
- Competing concerns

## Interpreting Improvement Suggestions

The `suggest-improvements` command highlights areas where prompts can be stronger:

### Phase 1 Common Issues
- Decision uses vague language ("strategic approach", "critical intervention")
- Negative consequences are generic ("complexity", "overhead")
- Decision disconnected from specific context facts

### Phase 2 Common Issues
- Reviews are surface-level (not going deep into trade-offs)
- Suggestions are generic ("be more specific" instead of "name the pattern")
- Misses alternative approaches worth considering

### Phase 3 Common Issues
- Synthesis picks middle ground instead of best arguments
- Final ADR doesn't explain why this decision over alternatives
- Fails to strengthen vague language from Phase 1

## Refinement Process

1. **Run tests**: `node tools/prompt-tuner.js test phase1 --mock`
2. **Review scores**: Check which criteria are weak
3. **Get suggestions**: `node tools/prompt-tuner.js suggest-improvements phase1`
4. **Edit prompts**: Update `prompts/phase1.md` based on specific suggestions
5. **Re-test**: Run tests again to verify improvement
6. **Iterate**: Repeat until scores stabilize around 4.5+/5.0

## Scoring Interpretation

- **4.5-5.0**: Production-ready ADRs. Clear, specific, well-balanced.
- **3.5-4.5**: Good ADRs with minor gaps. Would benefit from editing.
- **2.5-3.5**: Needs work. Multiple sections need revision.
- **<2.5**: Major issues. Fundamental rework needed.

The goal is to tune prompts so that 80%+ of generated ADRs score 4.0+.

## Real-World Tuning

When you have access to Claude and Gemini APIs:

```bash
# Run tests with real LLM responses (requires API keys in .env)
node tools/prompt-tuner.js test phase1

# Results saved to: ./prompt_tuning_results_architecture-decision-record/
```

Real tuning provides:
- Actual model behavior (not mocks)
- Realistic failure cases
- Quantified improvement opportunities
- Data-driven prompt optimization

## Key Insights from Evolutionary Tuning

Based on work in [product-requirements-assistant](https://github.com/bordenet/product-requirements-assistant):

1. **Specific requirements beat generic ones**
   - ✅ "Include minimum 3 positive consequences"
   - ❌ "Include positive and negative consequences"

2. **Examples are more powerful than descriptions**
   - ✅ "Use action verbs: use, adopt, implement, migrate, split, combine"
   - ❌ "Use clear action verbs"

3. **Checklists prevent oversights**
   - ✅ "Quality Checklist Before Returning" section
   - ❌ "Follow quality guidelines"

4. **Honest assessment beats validation**
   - ✅ Phase 2 prompt emphasizes identifying gaps, not validating work
   - ❌ "Provide feedback on this ADR"

5. **Explicit trade-offs drive better synthesis**
   - ✅ "Choose the clearer option each time (don't average/water down)"
   - ❌ "Incorporate feedback into the final version"

## References

- [Michael Nygard ADR Format](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Evolutionary Prompt Optimization (PRD Assistant)](https://github.com/bordenet/product-requirements-assistant/tree/main/evolutionary-optimization)
- [ADR Examples](https://github.com/joelparkerhenderson/architecture-decision-record/tree/main/adr)

## Next Steps

1. Run `node tools/prompt-tuner.js test phase1 --mock` to see baseline scores
2. Review suggestions: `node tools/prompt-tuner.js suggest-improvements phase1`
3. Identify top 2-3 improvements per phase
4. Edit prompts based on specific suggestions
5. Re-test to verify improvements
6. Document what changed and why

The goal is iteratively improving prompts so they consistently generate 4.5+/5.0 quality ADRs.
