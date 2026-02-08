/**
 * ADR Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Context (25 pts) - Clear problem context and constraints
 * 2. Decision (25 pts) - Clear statement of the decision
 * 3. Consequences (25 pts) - Positive and negative consequences
 * 4. Status (25 pts) - Clear status (proposed/accepted/deprecated/superseded)
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Constants
// ============================================================================

const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(context|background|problem|situation)/im, name: 'Context', weight: 2 },
  { pattern: /^#+\s*(decision|choice|selected|chosen)/im, name: 'Decision', weight: 2 },
  { pattern: /^#+\s*(consequence|impact|result|outcome|implication)/im, name: 'Consequences', weight: 2 },
  { pattern: /^#+\s*(status|state)/im, name: 'Status', weight: 2 },
  { pattern: /^#+\s*(option|alternative|considered)/im, name: 'Options Considered', weight: 1 },
  { pattern: /^#+\s*(rationale|reason|justification|why)/im, name: 'Rationale', weight: 1 }
];

// Context patterns
const CONTEXT_PATTERNS = {
  contextSection: /^#+\s*(context|background|problem|situation|why)/im,
  contextLanguage: /\b(context|background|problem|situation|challenge|need|requirement|constraint|driver|force)\b/gi,
  constraints: /\b(constraint|limitation|requirement|must|should|cannot|restriction|boundary)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value|stakeholder)\b/gi
};

// Decision patterns
const DECISION_PATTERNS = {
  decisionSection: /^#+\s*(decision|choice|selected|chosen|we.will)/im,
  decisionLanguage: /\b(decide|decision|choose|chose|select|selected|adopt|use|implement|will)\b/gi,
  clarity: /\b(we.will|we.have.decided|the.decision.is|we.chose|we.selected)\b/gi,
  specificity: /\b(specifically|exactly|precisely|concretely|particular)\b/gi,
  // Phase1.md required action verbs: use, adopt, implement, migrate, split, combine, establish, enforce
  actionVerbs: /\b(use|adopt|implement|migrate|split|combine|establish|enforce)\b/gi
};

// Vague decision phrases explicitly banned in phase1.md examples
// "We will adopt a strategic approach to improve scalability" ❌
// "We will implement a critical architectural intervention" ❌
// "We will make the system more maintainable" ❌
const VAGUE_DECISION_PATTERNS = /\b(strategic\s+approach|architectural\s+intervention|improve\s+scalability|more\s+maintainable|better\s+architecture|enhance\s+performance|optimize\s+the\s+system|modernize\s+the\s+platform|transform\s+the\s+infrastructure)\b/gi;

// Options patterns
const OPTIONS_PATTERNS = {
  optionsSection: /^#+\s*(option|alternative|considered|candidate)/im,
  optionsLanguage: /\b(option|alternative|candidate|possibility|approach|solution|choice)\b/gi,
  comparison: /\b(compare|versus|vs|pro|con|advantage|disadvantage|trade.?off|benefit|drawback)\b/gi,
  rejected: /\b(reject|not.chosen|ruled.out|dismissed|discarded|eliminated)\b/gi
};

// Consequences patterns
const CONSEQUENCES_PATTERNS = {
  consequencesSection: /^#+\s*(consequence|impact|result|outcome|implication)/im,
  consequencesLanguage: /\b(consequence|impact|result|outcome|implication|effect|affect)\b/gi,
  // Positive consequences - specific, measurable terms
  positive: /\b(benefit|advantage|improve|enable|allow|simplify|reduce|faster|easier|better|scalable|maintainable|testable|decoupled|independent|automated)\b/gi,
  // Negative consequences - REMOVED "complexity" and "overhead" per phase1.md vague language ban
  // These are now in VAGUE_CONSEQUENCE_TERMS below
  negative: /\b(drawback|disadvantage|risk|cost|slower|harder|worse|trade.?off|latency|coupling|dependency|bottleneck|single.point.of.failure|migration.effort)\b/gi,
  neutral: /\b(change|require|need|must|will.need|migration|update)\b/gi
};

// Vague consequence terms that phase1.md explicitly bans
// "Replace 'complexity' with specific impacts, 'overhead' with measurable costs"
const VAGUE_CONSEQUENCE_TERMS = /\b(complexity|overhead|difficult|challenging|problematic|issues?|concerns?)\b/gi;

// Status patterns
const STATUS_PATTERNS = {
  statusSection: /^#+\s*(status|state)/im,
  statusValues: /\b(proposed|accepted|deprecated|superseded|rejected|draft|approved|implemented)\b/gi,
  datePatterns: /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  supersededBy: /\b(superseded.by|replaced.by|see.also|successor)\b/gi
};

// Rationale patterns
const RATIONALE_PATTERNS = {
  rationaleSection: /^#+\s*(rationale|reason|justification|why)/im,
  rationaleLanguage: /\b(because|reason|rationale|justification|why|due.to|since|therefore|thus)\b/gi,
  evidence: /\b(evidence|data|research|study|benchmark|test|experiment|proof|demonstrate)\b/gi
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect context section in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Context detection results
 */
export function detectContext(text) {
  const hasContextSection = CONTEXT_PATTERNS.contextSection.test(text);
  const contextMatches = text.match(CONTEXT_PATTERNS.contextLanguage) || [];
  const constraintMatches = text.match(CONTEXT_PATTERNS.constraints) || [];
  const quantifiedMatches = text.match(CONTEXT_PATTERNS.quantified) || [];
  const businessMatches = text.match(CONTEXT_PATTERNS.businessFocus) || [];

  return {
    hasContextSection,
    hasContextLanguage: contextMatches.length > 0,
    hasConstraints: constraintMatches.length > 0,
    constraintCount: constraintMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    indicators: [
      hasContextSection && 'Dedicated context section',
      contextMatches.length > 0 && 'Context framing language',
      constraintMatches.length > 0 && `${constraintMatches.length} constraints identified`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/stakeholder focus'
    ].filter(Boolean)
  };
}

/**
 * Detect decision statement in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Decision detection results
 */
export function detectDecision(text) {
  const hasDecisionSection = DECISION_PATTERNS.decisionSection.test(text);
  const decisionMatches = text.match(DECISION_PATTERNS.decisionLanguage) || [];
  const clarityMatches = text.match(DECISION_PATTERNS.clarity) || [];
  const specificityMatches = text.match(DECISION_PATTERNS.specificity) || [];
  const actionVerbMatches = text.match(DECISION_PATTERNS.actionVerbs) || [];
  const vagueDecisionMatches = text.match(VAGUE_DECISION_PATTERNS) || [];

  return {
    hasDecisionSection,
    hasDecisionLanguage: decisionMatches.length > 0,
    hasClarity: clarityMatches.length > 0,
    clarityCount: clarityMatches.length,
    hasSpecificity: specificityMatches.length > 0,
    hasActionVerbs: actionVerbMatches.length > 0,
    actionVerbCount: actionVerbMatches.length,
    hasVagueDecision: vagueDecisionMatches.length > 0,
    vagueDecisionCount: vagueDecisionMatches.length,
    indicators: [
      hasDecisionSection && 'Dedicated decision section',
      decisionMatches.length > 0 && 'Decision language present',
      clarityMatches.length > 0 && 'Clear decision statement',
      specificityMatches.length > 0 && 'Specific details provided',
      actionVerbMatches.length > 0 && `${actionVerbMatches.length} action verbs used`,
      vagueDecisionMatches.length > 0 && `⚠️ ${vagueDecisionMatches.length} vague decision phrases detected`
    ].filter(Boolean)
  };
}

/**
 * Detect options considered in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Options detection results
 */
export function detectOptions(text) {
  const hasOptionsSection = OPTIONS_PATTERNS.optionsSection.test(text);
  const optionsMatches = text.match(OPTIONS_PATTERNS.optionsLanguage) || [];
  const comparisonMatches = text.match(OPTIONS_PATTERNS.comparison) || [];
  const rejectedMatches = text.match(OPTIONS_PATTERNS.rejected) || [];

  return {
    hasOptionsSection,
    hasOptionsLanguage: optionsMatches.length > 0,
    optionsCount: optionsMatches.length,
    hasComparison: comparisonMatches.length > 0,
    comparisonCount: comparisonMatches.length,
    hasRejected: rejectedMatches.length > 0,
    indicators: [
      hasOptionsSection && 'Dedicated options section',
      optionsMatches.length > 0 && `${optionsMatches.length} options mentioned`,
      comparisonMatches.length > 0 && 'Options compared',
      rejectedMatches.length > 0 && 'Rejected options explained'
    ].filter(Boolean)
  };
}

/**
 * Detect consequences in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Consequences detection results
 */
export function detectConsequences(text) {
  const hasConsequencesSection = CONSEQUENCES_PATTERNS.consequencesSection.test(text);
  const consequencesMatches = text.match(CONSEQUENCES_PATTERNS.consequencesLanguage) || [];
  const positiveMatches = text.match(CONSEQUENCES_PATTERNS.positive) || [];
  const negativeMatches = text.match(CONSEQUENCES_PATTERNS.negative) || [];
  const neutralMatches = text.match(CONSEQUENCES_PATTERNS.neutral) || [];
  const vagueConsequenceMatches = text.match(VAGUE_CONSEQUENCE_TERMS) || [];

  return {
    hasConsequencesSection,
    hasConsequencesLanguage: consequencesMatches.length > 0,
    hasPositive: positiveMatches.length > 0,
    positiveCount: positiveMatches.length,
    hasNegative: negativeMatches.length > 0,
    negativeCount: negativeMatches.length,
    hasNeutral: neutralMatches.length > 0,
    hasBothPosNeg: positiveMatches.length > 0 && negativeMatches.length > 0,
    hasVagueConsequences: vagueConsequenceMatches.length > 0,
    vagueConsequenceCount: vagueConsequenceMatches.length,
    indicators: [
      hasConsequencesSection && 'Dedicated consequences section',
      positiveMatches.length > 0 && `${positiveMatches.length} positive consequences`,
      negativeMatches.length > 0 && `${negativeMatches.length} negative consequences`,
      neutralMatches.length > 0 && 'Neutral impacts noted',
      vagueConsequenceMatches.length > 0 && `⚠️ ${vagueConsequenceMatches.length} vague terms (complexity/overhead)`
    ].filter(Boolean)
  };
}

/**
 * Detect status in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Status detection results
 */
export function detectStatus(text) {
  const hasStatusSection = STATUS_PATTERNS.statusSection.test(text);
  const statusMatches = text.match(STATUS_PATTERNS.statusValues) || [];
  const dateMatches = text.match(STATUS_PATTERNS.datePatterns) || [];
  const supersededMatches = text.match(STATUS_PATTERNS.supersededBy) || [];

  // Check for specific status values
  const hasProposed = /\bproposed\b/i.test(text);
  const hasAccepted = /\baccepted\b/i.test(text);
  const hasDeprecated = /\bdeprecated\b/i.test(text);
  const hasSuperseded = /\bsuperseded\b/i.test(text);

  return {
    hasStatusSection,
    hasStatusValue: statusMatches.length > 0,
    statusValues: statusMatches,
    hasDate: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasSupersededBy: supersededMatches.length > 0,
    hasProposed,
    hasAccepted,
    hasDeprecated,
    hasSuperseded,
    indicators: [
      hasStatusSection && 'Dedicated status section',
      statusMatches.length > 0 && `Status: ${statusMatches.join(', ')}`,
      dateMatches.length > 0 && 'Date information present',
      supersededMatches.length > 0 && 'Supersession reference'
    ].filter(Boolean)
  };
}

/**
 * Detect rationale in ADR
 * @param {string} text - Text to analyze
 * @returns {Object} Rationale detection results
 */
export function detectRationale(text) {
  const hasRationaleSection = RATIONALE_PATTERNS.rationaleSection.test(text);
  const rationaleMatches = text.match(RATIONALE_PATTERNS.rationaleLanguage) || [];
  const evidenceMatches = text.match(RATIONALE_PATTERNS.evidence) || [];

  return {
    hasRationaleSection,
    hasRationaleLanguage: rationaleMatches.length > 0,
    rationaleCount: rationaleMatches.length,
    hasEvidence: evidenceMatches.length > 0,
    evidenceCount: evidenceMatches.length,
    indicators: [
      hasRationaleSection && 'Dedicated rationale section',
      rationaleMatches.length > 0 && `${rationaleMatches.length} rationale statements`,
      evidenceMatches.length > 0 && 'Evidence-based reasoning'
    ].filter(Boolean)
  };
}

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}



// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score context quality (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreContext(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const contextDetection = detectContext(text);

  // Context section exists and is clear (0-10 pts)
  if (contextDetection.hasContextSection && contextDetection.hasContextLanguage) {
    score += 10;
    strengths.push('Clear context section with problem framing');
  } else if (contextDetection.hasContextLanguage) {
    score += 5;
    issues.push('Context mentioned but lacks dedicated section');
  } else {
    issues.push('Context section missing - explain the situation and problem');
  }

  // Constraints and drivers identified (0-8 pts)
  if (contextDetection.hasConstraints && contextDetection.constraintCount >= 2) {
    score += 8;
    strengths.push(`${contextDetection.constraintCount} constraints/drivers identified`);
  } else if (contextDetection.hasConstraints) {
    score += 4;
    issues.push('Some constraints mentioned - add more specific requirements and limitations');
  } else {
    issues.push('Constraints missing - list requirements, limitations, and forces');
  }

  // Business/stakeholder focus (0-7 pts)
  if (contextDetection.hasBusinessFocus) {
    score += 7;
    strengths.push('Context tied to business/stakeholder needs');
  } else {
    issues.push('Add business context - explain why this matters to stakeholders');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score decision clarity (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreDecision(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const decisionDetection = detectDecision(text);
  const optionsDetection = detectOptions(text);
  const rationaleDetection = detectRationale(text);

  // Decision clearly stated (0-10 pts)
  if (decisionDetection.hasDecisionSection && decisionDetection.hasClarity) {
    score += 10;
    strengths.push('Decision clearly stated with dedicated section');
  } else if (decisionDetection.hasDecisionLanguage) {
    score += 5;
    issues.push('Decision mentioned but could be clearer - use "We will..." format');
  } else {
    issues.push('Decision statement missing - clearly state what was decided');
  }

  // Vague decision penalty (-5 pts) - Phase1 explicitly bans these phrases
  // "We will adopt a strategic approach to improve scalability" ❌
  if (decisionDetection.hasVagueDecision) {
    score -= 5;
    issues.push(`Vague decision detected (${decisionDetection.vagueDecisionCount} phrases) - be specific about technology/pattern choice`);
  }

  // Action verb bonus (+2 pts) - Phase1 requires: use, adopt, implement, migrate, split, combine, establish, enforce
  if (decisionDetection.hasActionVerbs && decisionDetection.actionVerbCount >= 2) {
    score += 2;
    strengths.push(`Strong action verbs used (${decisionDetection.actionVerbCount})`);
  } else if (!decisionDetection.hasActionVerbs) {
    issues.push('Missing action verbs - use: adopt, implement, migrate, split, combine, establish, enforce');
  }

  // Explicit alternatives comparison pattern: "We considered X, Y, Z but chose..." (0-6 pts, reduced from 8)
  // This is the mandated Phase1 format for alternatives documentation
  const alternativesPattern = /we considered .+?,\s*.+?(?:,\s*.+?)?\s*(?:and\s+.+?\s+)?but (?:chose|selected|decided|went with)/i;
  const hasExplicitAlternatives = alternativesPattern.test(text);

  if (hasExplicitAlternatives) {
    score += 6;
    strengths.push('Explicit alternatives comparison with "considered X but chose Y" format');
  } else if (optionsDetection.hasOptionsSection && optionsDetection.hasComparison) {
    score += 4;
    strengths.push('Options compared with pros/cons');
    issues.push('Use explicit format: "We considered X, Y, Z but chose..."');
  } else if (optionsDetection.hasOptionsLanguage) {
    score += 2;
    issues.push('Options mentioned but not compared - use "We considered X, Y, Z but chose..." format');
  } else {
    issues.push('Alternatives not documented - use "We considered X, Y, Z but chose..." format');
  }

  // Rationale provided (0-7 pts)
  if (rationaleDetection.hasRationaleSection || rationaleDetection.hasEvidence) {
    score += 7;
    strengths.push('Rationale explained with evidence');
  } else if (rationaleDetection.hasRationaleLanguage) {
    score += 3;
    issues.push('Some rationale provided - strengthen with evidence or data');
  } else {
    issues.push('Rationale missing - explain WHY this decision was made');
  }

  return {
    score: Math.max(0, Math.min(score, maxScore)),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score consequences documentation (25 pts max)
 * Phase1.md requires: 3+ positive, 3+ negative, team factors, subsequent ADRs, review timing
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreConsequences(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const consequencesDetection = detectConsequences(text);

  // Consequences section exists (0-5 pts)
  if (consequencesDetection.hasConsequencesSection) {
    score += 5;
    strengths.push('Dedicated consequences section');
  } else if (consequencesDetection.hasConsequencesLanguage) {
    score += 2;
    issues.push('Consequences mentioned but lack dedicated section');
  } else {
    issues.push('Consequences section missing - document impacts of this decision');
  }

  // Positive/Negative balance check (0-10 pts) - Phase1 requires 3+ each
  const posCount = consequencesDetection.positiveCount || 0;
  const negCount = consequencesDetection.negativeCount || 0;
  const hasBalance = posCount >= 3 && negCount >= 3;

  if (hasBalance) {
    score += 10;
    strengths.push(`Balanced consequences: ${posCount} positive, ${negCount} negative`);
  } else if (posCount >= 2 && negCount >= 2) {
    score += 6;
    issues.push(`Need 3+ each: currently ${posCount} positive, ${negCount} negative`);
  } else if (posCount >= 1 || negCount >= 1) {
    score += 3;
    issues.push(`Imbalanced: ${posCount} positive, ${negCount} negative - need 3+ each`);
  } else {
    issues.push('Missing positive AND negative consequences - need 3+ each');
  }

  // Vague consequence penalty (-3 pts) - Phase1 bans "complexity", "overhead"
  // "Replace 'complexity' with specific impacts, 'overhead' with measurable costs"
  if (consequencesDetection.hasVagueConsequences) {
    score -= 3;
    issues.push(`Vague consequence terms detected (${consequencesDetection.vagueConsequenceCount}) - replace "complexity"/"overhead" with specific impacts`);
  }

  // Team factors detection (0-5 pts) - Phase1 requires training/skill/hiring
  const teamPatterns = /training.*need|skill gap|hiring impact|team ramp|learning curve|expertise required|onboarding|team structure|hiring|staffing/i;
  if (teamPatterns.test(text)) {
    score += 5;
    strengths.push('Team factors addressed (training/skills/hiring)');
  } else {
    issues.push('Missing team factors - address training needs, skill gaps, hiring impact');
  }

  // Subsequent ADR detection (0-3 pts) - Phase1 requires triggered decisions
  // Tightened pattern to require specific decision topics, not just "triggers a decision"
  const subsequentPattern = /subsequent ADR|follow-on ADR|triggers ADR|future ADR|ADR-\d+|triggers.*(?:decision|choice).*(?:on|for|about|regarding)\s+\w+/i;
  if (subsequentPattern.test(text)) {
    score += 3;
    strengths.push('Subsequent ADRs/decisions identified');
  } else {
    issues.push('Missing subsequent ADRs - what decisions does this trigger?');
  }

  // After-action review timing (0-2 pts) - Phase1 requires review timing
  // Expanded pattern to catch more variations: "45 days", "2 weeks", "quarterly"
  const reviewPattern = /\b\d+\s*(days?|weeks?|months?)\s*(review|reassess|revisit)|after-action|review.*timing|recommended.*review|review in \d+|quarterly\s+review|annual\s+review/i;
  if (reviewPattern.test(text)) {
    score += 2;
    strengths.push('Review timing specified');
  } else {
    issues.push('Missing review timing - when should this decision be reassessed?');
  }

  return {
    score: Math.max(0, Math.min(score, maxScore)),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score status and completeness (25 pts max)
 * @param {string} text - ADR content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStatus(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const statusDetection = detectStatus(text);
  const sections = detectSections(text);

  // Status clearly indicated (0-10 pts)
  if (statusDetection.hasStatusSection && statusDetection.hasStatusValue) {
    score += 10;
    strengths.push(`Status: ${statusDetection.statusValues.join(', ')}`);
  } else if (statusDetection.hasStatusValue) {
    score += 5;
    issues.push('Status mentioned but lacks dedicated section');
  } else {
    issues.push('Status missing - add Proposed, Accepted, Deprecated, or Superseded');
  }

  // Date information present (0-7 pts)
  if (statusDetection.hasDate) {
    score += 7;
    strengths.push('Date information included');
  } else {
    issues.push('Date missing - add when this decision was made');
  }

  // Required sections present (0-8 pts)
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 8;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.60) {
    score += 4;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate an ADR and return comprehensive scoring results
 * @param {string} text - ADR content
 * @returns {Object} Complete validation results
 */
export function validateADR(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      context: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      decision: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      consequences: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      status: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] }
    };
  }

  const context = scoreContext(text);
  const decision = scoreDecision(text);
  const consequences = scoreConsequences(text);
  const status = scoreStatus(text);

  // AI slop detection - ADRs should be precise and technical
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (max 5 points for ADRs)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    context.score + decision.score + consequences.score + status.score - slopDeduction
  );

  return {
    totalScore,
    context,
    decision,
    consequences,
    status,
    // Dimension mappings for app.js compatibility
    dimension1: context,
    dimension2: decision,
    dimension3: consequences,
    dimension4: status,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

// Alias for backward compatibility
export const validateOnePager = validateADR;
