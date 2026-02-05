/**
 * Inline ADR Validator for Assistant UI
 * @module validator-inline
 *
 * Lightweight validation for inline scoring after Phase 3 completion.
 * Scoring Dimensions:
 * 1. Context (25 pts) - Clear problem context and constraints
 * 2. Decision (25 pts) - Clear statement of the decision
 * 3. Consequences (25 pts) - Positive and negative consequences
 * 4. Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

const CONTEXT_PATTERNS = {
  section: /^#+\s*(context|background|problem|situation)/im,
  language: /\b(context|background|problem|situation|challenge|need|requirement|constraint)\b/gi,
  constraints: /\b(constraint|limitation|requirement|must|should|cannot|restriction)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$)/gi
};

const DECISION_PATTERNS = {
  section: /^#+\s*(decision|choice|selected|chosen)/im,
  language: /\b(decide|decision|choose|chose|select|selected|adopt|use|implement|will)\b/gi,
  clarity: /\b(we.will|we.have.decided|the.decision.is|we.chose|we.selected)\b/gi
};

const CONSEQUENCES_PATTERNS = {
  section: /^#+\s*(consequence|impact|result|outcome|implication)/im,
  positive: /\b(benefit|advantage|improve|enable|allow|simplify|reduce|faster|easier|better)\b/gi,
  negative: /\b(drawback|disadvantage|risk|cost|complexity|overhead|slower|harder|worse|trade.?off)\b/gi
};

const STATUS_PATTERNS = {
  section: /^#+\s*(status|state)/im,
  values: /\b(proposed|accepted|deprecated|superseded|rejected|draft)\b/gi
};

function scoreContext(text) {
  let score = 0;
  const issues = [];

  // Has context section (10 pts)
  if (CONTEXT_PATTERNS.section.test(text)) score += 10;
  else issues.push('Add a Context or Background section');

  // Context language (8 pts)
  const contextMatches = (text.match(CONTEXT_PATTERNS.language) || []).length;
  if (contextMatches >= 3) score += 8;
  else if (contextMatches >= 1) { score += 4; issues.push('Explain the problem context more clearly'); }
  else issues.push('Describe the problem context');

  // Constraints (7 pts)
  const constraintMatches = (text.match(CONTEXT_PATTERNS.constraints) || []).length;
  if (constraintMatches >= 2) score += 7;
  else if (constraintMatches >= 1) { score += 4; issues.push('Add more constraints or requirements'); }
  else issues.push('Document constraints and requirements');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreDecision(text) {
  let score = 0;
  const issues = [];

  // Has decision section (10 pts)
  if (DECISION_PATTERNS.section.test(text)) score += 10;
  else issues.push('Add a Decision section');

  // Decision language (8 pts)
  const decisionMatches = (text.match(DECISION_PATTERNS.language) || []).length;
  if (decisionMatches >= 3) score += 8;
  else if (decisionMatches >= 1) { score += 4; issues.push('State the decision more clearly'); }
  else issues.push('State the decision explicitly');

  // Clear decision statement (7 pts)
  if (DECISION_PATTERNS.clarity.test(text)) score += 7;
  else issues.push('Use clear language like "We will..." or "We have decided..."');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreConsequences(text) {
  let score = 0;
  const issues = [];

  // Has consequences section (8 pts)
  if (CONSEQUENCES_PATTERNS.section.test(text)) score += 8;
  else issues.push('Add a Consequences section');

  // Positive consequences (9 pts)
  const positiveMatches = (text.match(CONSEQUENCES_PATTERNS.positive) || []).length;
  if (positiveMatches >= 2) score += 9;
  else if (positiveMatches >= 1) { score += 5; issues.push('Document more benefits'); }
  else issues.push('Document the benefits of this decision');

  // Negative consequences (8 pts)
  const negativeMatches = (text.match(CONSEQUENCES_PATTERNS.negative) || []).length;
  if (negativeMatches >= 2) score += 8;
  else if (negativeMatches >= 1) { score += 4; issues.push('Document more trade-offs'); }
  else issues.push('Document drawbacks and trade-offs');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreStatus(text) {
  let score = 0;
  const issues = [];

  // Has status section (10 pts)
  if (STATUS_PATTERNS.section.test(text)) score += 10;
  else issues.push('Add a Status section');

  // Valid status value (15 pts)
  const statusMatches = text.match(STATUS_PATTERNS.values);
  if (statusMatches && statusMatches.length >= 1) score += 15;
  else issues.push('Include status (proposed, accepted, deprecated, or superseded)');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

export function validateADR(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return {
      totalScore: 0,
      context: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      decision: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      consequences: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      status: { score: 0, maxScore: 25, issues: ['No content to validate'] }
    };
  }

  const context = scoreContext(text);
  const decision = scoreDecision(text);
  const consequences = scoreConsequences(text);
  const status = scoreStatus(text);

  return {
    totalScore: context.score + decision.score + consequences.score + status.score,
    context, decision, consequences, status
  };
}

export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}

