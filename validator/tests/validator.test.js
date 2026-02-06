/**
 * ADR Validator tests - Comprehensive scoring tests
 * Tests all exported functions for scoring Architecture Decision Records
 */

import {
  validateADR,
  scoreContext,
  scoreDecision,
  scoreConsequences,
  scoreStatus,
  detectContext,
  detectDecision,
  detectOptions,
  detectConsequences,
  detectStatus,
  detectRationale,
  detectSections
} from '../js/validator.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixtures = JSON.parse(
  readFileSync(join(__dirname, '../testdata/scoring-fixtures.json'), 'utf-8')
);

// ============================================================================
// validateADR tests
// ============================================================================
describe('validateADR', () => {
  describe('empty/invalid input', () => {
    test('returns zero score for empty string', () => {
      const result = validateADR('');
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for null', () => {
      const result = validateADR(null);
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for undefined', () => {
      const result = validateADR(undefined);
      expect(result.totalScore).toBe(0);
    });

    test('returns all dimensions with issues for empty input', () => {
      const result = validateADR('');
      expect(result.context.issues).toContain('No content to validate');
      expect(result.decision.issues).toContain('No content to validate');
      expect(result.consequences.issues).toContain('No content to validate');
      expect(result.status.issues).toContain('No content to validate');
    });
  });

  describe('fixture-based scoring', () => {
    test('scores minimal ADR correctly', () => {
      const result = validateADR(fixtures.minimal.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.minimal.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.minimal.expectedMaxScore);
    });

    test('scores complete ADR correctly', () => {
      const result = validateADR(fixtures.complete.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.complete.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.complete.expectedMaxScore);
    });
  });

  describe('score structure', () => {
    test('returns all required dimensions', () => {
      const result = validateADR('# Context\nSome content');
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('decision');
      expect(result).toHaveProperty('consequences');
      expect(result).toHaveProperty('status');
    });

    test('each dimension has score, maxScore, issues, strengths', () => {
      const result = validateADR('# Context\nSome content');
      for (const dim of ['context', 'decision', 'consequences', 'status']) {
        expect(result[dim]).toHaveProperty('score');
        expect(result[dim]).toHaveProperty('maxScore');
        expect(result[dim]).toHaveProperty('issues');
        expect(result[dim]).toHaveProperty('strengths');
      }
    });

    test('total score equals sum of dimension scores minus slop deduction', () => {
      const result = validateADR(fixtures.complete.content);
      const sum = result.context.score + result.decision.score +
                  result.consequences.score + result.status.score;
      const expectedTotal = sum - (result.slopDetection?.deduction || 0);
      expect(result.totalScore).toBe(expectedTotal);
    });
  });
});

// ============================================================================
// scoreContext tests
// ============================================================================
describe('scoreContext', () => {
  test('maxScore is 25', () => {
    const result = scoreContext('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for context section', () => {
    const withSection = scoreContext('# Context\nWe need to decide on a database technology.');
    const withoutSection = scoreContext('We need to decide on a database technology.');
    expect(withSection.score).toBeGreaterThan(withoutSection.score);
  });

  test('awards points for constraints', () => {
    const withConstraints = scoreContext('# Context\nWe must support 10,000 concurrent users and have a budget of $50k.');
    const withoutConstraints = scoreContext('# Context\nWe need to make a decision.');
    expect(withConstraints.score).toBeGreaterThan(withoutConstraints.score);
  });
});

// ============================================================================
// scoreDecision tests
// ============================================================================
describe('scoreDecision', () => {
  test('maxScore is 25', () => {
    const result = scoreDecision('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for decision section', () => {
    const withSection = scoreDecision('# Decision\nWe will use PostgreSQL as our primary database.');
    const withoutSection = scoreDecision('We will use PostgreSQL as our primary database.');
    expect(withSection.score).toBeGreaterThan(withoutSection.score);
  });

  test('awards points for clear decision language', () => {
    const clearDecision = scoreDecision('# Decision\nWe will adopt React for the frontend framework.');
    const vagueDecision = scoreDecision('# Decision\nSomething about frontend.');
    expect(clearDecision.score).toBeGreaterThan(vagueDecision.score);
  });
});

// ============================================================================
// scoreConsequences tests
// ============================================================================
describe('scoreConsequences', () => {
  test('maxScore is 25', () => {
    const result = scoreConsequences('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for consequences section', () => {
    const withSection = scoreConsequences('# Consequences\nThis will improve performance by 50%.');
    const withoutSection = scoreConsequences('This will improve performance by 50%.');
    expect(withSection.score).toBeGreaterThan(withoutSection.score);
  });

  test('awards points for positive and negative consequences', () => {
    const balanced = scoreConsequences('# Consequences\nPositive: Faster development. Negative: Higher learning curve.');
    const oneSided = scoreConsequences('# Consequences\nIt will be good.');
    expect(balanced.score).toBeGreaterThan(oneSided.score);
  });
});

// ============================================================================
// scoreStatus tests
// ============================================================================
describe('scoreStatus', () => {
  test('maxScore is 25', () => {
    const result = scoreStatus('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for status section', () => {
    const withStatus = scoreStatus('# Status\nAccepted');
    const withoutStatus = scoreStatus('Some content.');
    expect(withStatus.score).toBeGreaterThan(withoutStatus.score);
  });

  test('awards points for valid status values', () => {
    const validStatus = scoreStatus('# Status\nProposed - 2024-01-15');
    const noDate = scoreStatus('# Status\nSomething');
    expect(validStatus.score).toBeGreaterThan(noDate.score);
  });
});

// ============================================================================
// Detection function tests
// ============================================================================
describe('detectContext', () => {
  test('detects context section', () => {
    const result = detectContext('# Context\nWe need to choose a framework.');
    expect(result.hasContextSection).toBe(true);
  });

  test('detects context language', () => {
    const result = detectContext('Given the constraints of our system, we need to decide.');
    expect(result.hasContextLanguage).toBe(true);
  });

  test('detects constraints', () => {
    const result = detectContext('We must support 1000 users. Budget is limited to $10k.');
    expect(result.hasConstraints).toBe(true);
  });
});

describe('detectDecision', () => {
  test('detects decision section', () => {
    const result = detectDecision('# Decision\nWe will use PostgreSQL.');
    expect(result.hasDecisionSection).toBe(true);
  });

  test('detects decision language', () => {
    const result = detectDecision('We have decided to adopt React for our frontend.');
    expect(result.hasDecisionLanguage).toBe(true);
  });
});

describe('detectOptions', () => {
  test('detects options section', () => {
    const result = detectOptions('# Options Considered\nOption 1: PostgreSQL. Option 2: MySQL.');
    expect(result.hasOptionsSection).toBe(true);
  });

  test('detects comparison language', () => {
    const result = detectOptions('PostgreSQL vs MySQL: The advantages are clear. Pro: better performance.');
    expect(result.hasComparison).toBe(true);
  });
});

describe('detectConsequences', () => {
  test('detects consequences section', () => {
    const result = detectConsequences('# Consequences\nThis will increase development speed.');
    expect(result.hasConsequencesSection).toBe(true);
  });

  test('detects positive consequences', () => {
    const result = detectConsequences('This will result in better performance and lower costs.');
    expect(result.hasPositive).toBe(true);
  });

  test('detects negative consequences', () => {
    const result = detectConsequences('However, this increases complexity and maintenance burden.');
    expect(result.hasNegative).toBe(true);
  });
});

describe('detectStatus', () => {
  test('detects status section', () => {
    const result = detectStatus('# Status\nAccepted');
    expect(result.hasStatusSection).toBe(true);
  });

  test('detects valid status values', () => {
    const proposed = detectStatus('Status: Proposed');
    expect(proposed.hasProposed).toBe(true);

    const accepted = detectStatus('Status: Accepted');
    expect(accepted.hasAccepted).toBe(true);
  });

  test('detects date patterns', () => {
    const result = detectStatus('Accepted on 2024-01-15');
    expect(result.hasDate).toBe(true);
  });
});

describe('detectRationale', () => {
  test('detects rationale section', () => {
    const result = detectRationale('# Rationale\nWe chose this because of performance.');
    expect(result.hasRationaleSection).toBe(true);
  });

  test('detects rationale language', () => {
    const result = detectRationale('The reason for this decision is scalability.');
    expect(result.hasRationaleLanguage).toBe(true);
  });
});

describe('detectSections', () => {
  test('finds present sections', () => {
    const result = detectSections('# Context\n# Decision\n# Consequences');
    expect(result.found.length).toBeGreaterThan(0);
  });

  test('identifies missing sections', () => {
    const result = detectSections('# Context\nSome content.');
    expect(result.missing.length).toBeGreaterThan(0);
  });
});
