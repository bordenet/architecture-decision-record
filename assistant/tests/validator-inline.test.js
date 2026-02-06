/**
 * Tests for validator-inline.js
 * Architecture Decision Record inline validation
 */
import { validateDocument, getScoreColor, getScoreLabel } from '../js/validator-inline.js';

describe('Inline ADR Validator', () => {
  describe('validateDocument', () => {
    test('should return zero scores for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.context.score).toBe(0);
      expect(result.decision.score).toBe(0);
      expect(result.consequences.score).toBe(0);
      expect(result.status.score).toBe(0);
    });

    test('should return zero scores for short content', () => {
      const result = validateDocument('Too short');
      expect(result.totalScore).toBe(0);
    });

    test('should return zero scores for null', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    test('should score a well-structured ADR', () => {
      const goodADR = `
# ADR-001: Use PostgreSQL for Primary Database

## Status
Accepted

## Context
Our application requires a relational database with strong ACID compliance.
We need to support complex queries and have constraints around cost.
The constraint is we must be compatible with existing infrastructure.

## Decision
We will use PostgreSQL as our primary database because it meets all requirements.
The choice was made after evaluating MySQL, MongoDB, and PostgreSQL.

## Consequences

### Positive
- Strong ACID compliance for data integrity
- Rich query capabilities with JSON support
- Large community and extensive documentation

### Negative
- Requires more operational expertise than managed alternatives
- Higher upfront configuration complexity
      `.repeat(2);
      const result = validateDocument(goodADR);
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.context.score).toBeGreaterThan(0);
      expect(result.decision.score).toBeGreaterThan(0);
      expect(result.consequences.score).toBeGreaterThan(0);
      expect(result.status.score).toBeGreaterThan(0);
    });

    test('should return issues for incomplete ADR', () => {
      const incompleteADR = 'This is a decision about something.'.repeat(10);
      const result = validateDocument(incompleteADR);
      const totalIssues = [
        ...result.context.issues,
        ...result.decision.issues,
        ...result.consequences.issues,
        ...result.status.issues
      ];
      expect(totalIssues.length).toBeGreaterThan(0);
    });

    test('should recognize status markers', () => {
      const proposedADR = `
# ADR: Proposed Change
## Status
Proposed
## Context
We need to make a decision.
## Decision
We will do something.
      `.repeat(3);
      const result = validateDocument(proposedADR);
      expect(result.status.score).toBeGreaterThan(0);
    });

    test('should give partial decision score for limited decision language', () => {
      // This content has exactly 1 decision language match ("chose") to trigger partial score path
      const partialADR = `
# ADR: Partial Choice

## Status
Proposed

## Context
This is the background context for our problem statement.
We have a constraint that limits our available options and paths.
The team needed to evaluate multiple approaches carefully.
There are several factors driving the current situation forward.
We must consider both short-term and long-term implications.

## Choice
The team chose option A after extensive discussion.

## Consequences
This approach brings several advantages to the project.
There may be some challenges with implementation timing.
Overall the path forward looks promising for success.
The benefits outweigh the potential drawbacks here.
`;
      const result = validateDocument(partialADR);
      // Should have some decision score but not full marks (10 for section + 4 for partial = 14)
      expect(result.decision.score).toBe(14);
      // Should have an issue about stating decision more clearly
      expect(result.decision.issues.some(i => i.includes('State the decision'))).toBe(true);
    });

    test('should flag missing decision language entirely', () => {
      // No decision language words (decide/decision/choose/chose/select/selected/adopt/use/implement/will)
      const noDecisionLang = `
# ADR: Missing Language

## Status
Proposed

## Context
This is the background context for our problem statement.
We have a constraint that limits our available options and paths.
The team needed to evaluate multiple approaches carefully.
There are several factors driving the current situation forward.
We must consider both short-term and long-term implications.

## Determination
The team went with option A after extensive discussion.

## Consequences
This approach brings several advantages to the project.
There may be some challenges with implementation timing.
Overall the path forward looks promising for success.
The benefits outweigh the potential drawbacks here.
`;
      const result = validateDocument(noDecisionLang);
      // Should have only 0 points for decision language (section not matched either)
      expect(result.decision.score).toBe(0);
      // Should have an issue about stating decision explicitly
      expect(result.decision.issues.some(i => i.includes('State the decision explicitly'))).toBe(true);
    });

    test('should give partial context score for limited context language', () => {
      // Exactly 1-2 context language matches to trigger partial score (line 53)
      const partialContext = `
# ADR: Partial Context

## Status
Proposed

## Context
This situation requires attention.
The project team discussed various approaches.
A determination was made after long meetings.
The path forward was not immediately clear.

## Decision
We will proceed with the standard approach after careful consideration.

## Consequences
This is a benefit of the chosen approach.
There are advantages to this path forward.
`;
      const result = validateDocument(partialContext);
      // Should have partial context score and issue about explaining context
      expect(result.context.issues.some(i =>
        i.includes('Explain the problem context') || i.includes('Document constraints')
      )).toBe(true);
    });

    test('should give partial consequences score for limited positive/negative', () => {
      // Exactly 1 positive and 1 negative match to trigger partial score (lines 96-97, 103)
      const partialConsequences = `
# ADR: Partial Consequences

## Status
Proposed

## Context
This is the background and context for our situation.
We have a constraint and requirement to address.
The problem requires a solution quickly.

## Decision
We will implement the new system as designed.

## Consequences
There is one benefit from this approach.
There is one drawback to consider as well.
`;
      const result = validateDocument(partialConsequences);
      // Check for partial score issues
      expect(result.consequences.issues.some(i =>
        i.includes('Document more benefits') || i.includes('Document more trade-offs')
      )).toBe(true);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for high scores', () => {
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(70)).toBe('green');
    });

    test('should return yellow for medium scores', () => {
      expect(getScoreColor(55)).toBe('yellow');
    });

    test('should return orange for low-medium scores', () => {
      expect(getScoreColor(35)).toBe('orange');
    });

    test('should return red for low scores', () => {
      expect(getScoreColor(25)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for high scores', () => {
      expect(getScoreLabel(85)).toBe('Excellent');
    });

    test('should return Ready for good scores', () => {
      expect(getScoreLabel(75)).toBe('Ready');
    });

    test('should return Needs Work for medium scores', () => {
      expect(getScoreLabel(55)).toBe('Needs Work');
    });

    test('should return Draft for low scores', () => {
      expect(getScoreLabel(35)).toBe('Draft');
    });

    test('should return Incomplete for very low scores', () => {
      expect(getScoreLabel(25)).toBe('Incomplete');
    });
  });
});

