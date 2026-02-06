/**
 * Tests for validator/js/prompts.js
 * Tests prompt generation functions for LLM-based ADR scoring
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
  cleanAIResponse
} from '../js/prompts.js';

describe('prompts.js', () => {
  const sampleADR = `# ADR-001: Use PostgreSQL for Primary Database
## Status
Accepted (2024-01-15)
## Context
We need a relational database for our new microservices architecture.
## Decision
We will use PostgreSQL 15 as our primary database.
## Consequences
- Positive: Strong ACID compliance, excellent JSON support
- Negative: Requires operational expertise for high availability`;

  describe('generateLLMScoringPrompt', () => {
    test('should generate a prompt containing the ADR content', () => {
      const prompt = generateLLMScoringPrompt(sampleADR);
      expect(prompt).toContain(sampleADR);
    });

    test('should include scoring rubric sections', () => {
      const prompt = generateLLMScoringPrompt(sampleADR);
      expect(prompt).toContain('Context');
      expect(prompt).toContain('Decision');
      expect(prompt).toContain('Consequences');
      expect(prompt).toContain('Status');
    });

    test('should include point values', () => {
      const prompt = generateLLMScoringPrompt(sampleADR);
      expect(prompt).toContain('25 points');
      expect(prompt).toContain('/100');
    });

    test('should include calibration guidance', () => {
      const prompt = generateLLMScoringPrompt(sampleADR);
      expect(prompt).toContain('CALIBRATION GUIDANCE');
      expect(prompt).toContain('Be HARSH');
    });

    test('should include required output format', () => {
      const prompt = generateLLMScoringPrompt(sampleADR);
      expect(prompt).toContain('REQUIRED OUTPUT FORMAT');
      expect(prompt).toContain('TOTAL SCORE');
    });
  });

  describe('generateCritiquePrompt', () => {
    const mockResult = {
      totalScore: 65,
      context: { score: 18, issues: ['Missing constraints'] },
      decision: { score: 20, issues: [] },
      consequences: { score: 15, issues: ['Missing trade-offs'] },
      status: { score: 12, issues: ['Missing date'] }
    };

    test('should generate a prompt containing the ADR content', () => {
      const prompt = generateCritiquePrompt(sampleADR, mockResult);
      expect(prompt).toContain(sampleADR);
    });

    test('should include current validation results', () => {
      const prompt = generateCritiquePrompt(sampleADR, mockResult);
      expect(prompt).toContain('Total Score: 65/100');
      expect(prompt).toContain('Context: 18/25');
      expect(prompt).toContain('Decision: 20/25');
    });

    test('should include detected issues', () => {
      const prompt = generateCritiquePrompt(sampleADR, mockResult);
      expect(prompt).toContain('Missing constraints');
      expect(prompt).toContain('Missing trade-offs');
    });

    test('should handle missing issues gracefully', () => {
      const minimalResult = { totalScore: 50 };
      const prompt = generateCritiquePrompt(sampleADR, minimalResult);
      expect(prompt).toContain('Total Score: 50/100');
      expect(prompt).toContain('Context: 0/25');
    });
  });

  describe('generateRewritePrompt', () => {
    const mockResult = { totalScore: 45 };

    test('should generate a prompt containing the ADR content', () => {
      const prompt = generateRewritePrompt(sampleADR, mockResult);
      expect(prompt).toContain(sampleADR);
    });

    test('should include current score', () => {
      const prompt = generateRewritePrompt(sampleADR, mockResult);
      expect(prompt).toContain('CURRENT SCORE: 45/100');
    });

    test('should include rewrite requirements', () => {
      const prompt = generateRewritePrompt(sampleADR, mockResult);
      expect(prompt).toContain('REWRITE REQUIREMENTS');
    });
  });

  describe('cleanAIResponse', () => {
    test('should remove common prefixes', () => {
      const response = "Here's the evaluation:\nSome content";
      expect(cleanAIResponse(response)).toBe('Some content');
    });

    test('should extract content from markdown code blocks', () => {
      const response = '```markdown\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should handle code blocks without language specifier', () => {
      const response = '```\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should trim whitespace', () => {
      const response = '  Some content with spaces  ';
      expect(cleanAIResponse(response)).toBe('Some content with spaces');
    });

    test('should handle responses without prefixes or code blocks', () => {
      const response = 'Plain response text';
      expect(cleanAIResponse(response)).toBe('Plain response text');
    });
  });
});

