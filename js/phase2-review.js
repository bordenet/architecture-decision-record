/**
 * Phase 2 Review Module
 * Generates adversarial reviews using same-LLM detection
 */

const { getAdversarialStrategy } = require("./same-llm-adversarial.js");

async function generatePhase2Review(title, context, decision, currentModel = "Claude") {
  const strategy = getAdversarialStrategy(currentModel);

  const critiques = [
    "Critical analysis: What are the hidden assumptions in this decision?",
    "Risk assessment: What could go wrong with this approach?",
    "Alternative evaluation: Have all alternatives been properly explored?",
    "Scalability concerns: How will this decision impact future growth?",
    "Team impact: What are the implications for team structure and processes?",
    "Cost-benefit analysis: Is the value truly proportional to the effort required?"
  ];

  const review = `
[ADVERSARIAL CRITIQUE - ${strategy}]

Decision Being Reviewed: "${title}"

Context: ${context}

Proposed Decision: ${decision}

CRITICAL FEEDBACK:

${critiques.map((c, i) => `${i + 1}. ${c}`).join("\n")}

KEY CONCERNS:

1. Incomplete Information: The decision may not account for [TBD] constraints.

2. Implementation Risk: Executing this decision will require [TBD] resources and expertise.

3. Alternative Approaches: Consider exploring these alternatives:
   - Option A: Different architecture approach
   - Option B: Phased implementation strategy
   - Option C: Hybrid solution combining benefits

4. Success Criteria: Success metrics should include:
   - Performance targets
   - Team adoption metrics
   - Risk mitigation milestones

RECOMMENDATION:

Before proceeding, address the following:
- [ ] Document all assumptions and constraints
- [ ] Create a detailed implementation plan
- [ ] Identify rollback/mitigation strategies
- [ ] Get stakeholder sign-off on trade-offs

This adversarial review intentionally highlights potential weaknesses to ensure robust decision-making.
  `.trim();

  return review;
}

module.exports = { generatePhase2Review };
