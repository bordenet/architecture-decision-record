/**
 * Tests for ADR Validator - Integration tests for assistant
 *
 * Note: Comprehensive validator tests are in validator/tests/validator.test.js
 * These tests verify that the assistant correctly imports from the canonical validator.
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  // Detection functions
  detectContext,
  detectDecision,
  detectOptions,
  detectConsequences,
  detectStatus,
  detectRationale,
  detectSections
} from '../../validator/js/validator.js';

describe('ADR Validator Integration', () => {
  describe('validateDocument', () => {
    test('should return totalScore for valid content', () => {
      const result = validateDocument(`# ADR-001: Use PostgreSQL

## Status
Accepted

## Context
We need a database with strong ACID compliance.

## Decision
We will use PostgreSQL.

## Consequences
Better data integrity.`);
      expect(result.totalScore).toBeDefined();
      expect(typeof result.totalScore).toBe('number');
    });

    test('should return zero for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
    });

    test('should return zero for null content', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for scores >= 70', () => {
      expect(getScoreColor(70)).toBe('green');
      expect(getScoreColor(85)).toBe('green');
    });

    test('should return yellow for scores 50-69', () => {
      expect(getScoreColor(50)).toBe('yellow');
      expect(getScoreColor(65)).toBe('yellow');
    });

    test('should return orange for scores 30-49', () => {
      expect(getScoreColor(30)).toBe('orange');
      expect(getScoreColor(45)).toBe('orange');
    });

    test('should return red for scores < 30', () => {
      expect(getScoreColor(0)).toBe('red');
      expect(getScoreColor(29)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for scores >= 80', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(100)).toBe('Excellent');
    });

    test('should return Ready for scores 70-79', () => {
      expect(getScoreLabel(70)).toBe('Ready');
      expect(getScoreLabel(79)).toBe('Ready');
    });

    test('should return Needs Work for scores 50-69', () => {
      expect(getScoreLabel(50)).toBe('Needs Work');
      expect(getScoreLabel(69)).toBe('Needs Work');
    });

    test('should return Draft for scores 30-49', () => {
      expect(getScoreLabel(30)).toBe('Draft');
      expect(getScoreLabel(49)).toBe('Draft');
    });

    test('should return Incomplete for scores < 30', () => {
      expect(getScoreLabel(0)).toBe('Incomplete');
      expect(getScoreLabel(29)).toBe('Incomplete');
    });
  });
});

// ============================================================================
// Detection Functions Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectContext', () => {
    test('should detect context section', () => {
      const result = detectContext('## Context\nWe need a database solution.');
      expect(result).toBeDefined();
    });
  });

  describe('detectDecision', () => {
    test('should detect decision section', () => {
      const result = detectDecision('## Decision\nWe will use PostgreSQL.');
      expect(result).toBeDefined();
    });
  });

  describe('detectOptions', () => {
    test('should detect options considered', () => {
      const result = detectOptions('## Options\n1. PostgreSQL\n2. MySQL\n3. MongoDB');
      expect(result).toBeDefined();
    });
  });

  describe('detectConsequences', () => {
    test('should detect consequences section', () => {
      const result = detectConsequences('## Consequences\nBetter data integrity.');
      expect(result).toBeDefined();
    });
  });

  describe('detectStatus', () => {
    test('should detect status', () => {
      const result = detectStatus('## Status\nAccepted');
      expect(result).toBeDefined();
    });
  });

  describe('detectRationale', () => {
    test('should detect rationale', () => {
      const result = detectRationale('We chose this because it provides ACID compliance.');
      expect(result).toBeDefined();
    });
  });

  describe('detectSections', () => {
    test('should detect ADR sections', () => {
      const result = detectSections('## Context\nTest\n## Decision\nTest');
      expect(result).toBeDefined();
    });
  });
});
