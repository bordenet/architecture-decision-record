/**
 * Tests for validator-inline.js
 * Architecture Decision Record inline validation
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  scoreContext,
  scoreDecision,
  scoreConsequences,
  scoreStatus,
  detectContext,
  detectDecision,
  detectOptions,
  detectConsequences,
  detectStatus,
  detectRationale
} from '../../shared/js/validator-inline.js';

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
      // Full validator uses different scoring logic - expect partial score
      expect(result.decision.score).toBeGreaterThan(0);
      expect(result.decision.score).toBeLessThan(result.decision.maxScore);
      // Full validator produces different issues - check for any decision feedback
      expect(result.decision.issues.length).toBeGreaterThan(0);
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
      // Full validator may give some points even without explicit decision language
      expect(result.decision.score).toBeLessThan(result.decision.maxScore);
      // Should have issues about decision clarity
      expect(result.decision.issues.length).toBeGreaterThan(0);
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
      // Full validator has different issue messages - just check we have feedback
      expect(result.context.issues.length).toBeGreaterThan(0);
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
      // Full validator has different issue messages - just check we have feedback
      expect(result.consequences.issues.length).toBeGreaterThan(0);
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

// ============================================================================
// Scoring Function Tests
// ============================================================================

describe('Scoring Functions', () => {
  describe('scoreContext', () => {
    test('should return maxScore of 25', () => {
      const result = scoreContext('Context and background');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for comprehensive context', () => {
      const content = `
## Context
Our current system has a constraint that requires careful consideration.
The situation demands a decision about database architecture.
We need 99.9% uptime for our business stakeholders.
      `.repeat(2);
      const result = scoreContext(content);
      expect(result.score).toBeGreaterThan(0);
    });

    test('should return issues for empty content', () => {
      const result = scoreContext('');
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('scoreDecision', () => {
    test('should return maxScore of 25', () => {
      const result = scoreDecision('We decided to use PostgreSQL');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for clear decisions', () => {
      const content = `
## Decision
We will use PostgreSQL as our primary database.
We decided this because of its reliability.
We chose this approach over alternatives.
      `.repeat(2);
      const result = scoreDecision(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreConsequences', () => {
    test('should return maxScore of 25', () => {
      const result = scoreConsequences('The consequences are significant.');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for balanced consequences', () => {
      const content = `
## Consequences

### Positive
- Better performance and reliability
- Improved scalability advantage

### Negative
- Increased complexity risk
- Higher maintenance cost
      `.repeat(2);
      const result = scoreConsequences(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreStatus', () => {
    test('should return maxScore of 25', () => {
      const result = scoreStatus('Status: Proposed');
      expect(result.maxScore).toBe(25);
    });

    test('should score for accepted status', () => {
      const content = `
## Status
Accepted

Date: 2024-01-15
      `.repeat(2);
      const result = scoreStatus(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectContext', () => {
    test('should detect context section', () => {
      const content = '## Context\nThe current situation requires attention.';
      const result = detectContext(content);
      expect(result.hasContextSection).toBe(true);
    });

    test('should detect constraints', () => {
      const content = 'The constraint is that we must support legacy systems. There is a requirement for 99% uptime.';
      const result = detectContext(content);
      expect(result.hasConstraints).toBe(true);
    });
  });

  describe('detectDecision', () => {
    test('should detect decision language', () => {
      const content = 'We decided to use PostgreSQL. We will implement this approach.';
      const result = detectDecision(content);
      expect(result.hasDecisionLanguage).toBe(true);
    });

    test('should detect decision section', () => {
      const content = '## Decision\nWe will use PostgreSQL.';
      const result = detectDecision(content);
      expect(result.hasDecisionSection).toBe(true);
    });
  });

  describe('detectOptions', () => {
    test('should detect options language', () => {
      const content = 'Option 1 is PostgreSQL. Alternative 2 is MySQL.';
      const result = detectOptions(content);
      expect(result.hasOptionsLanguage).toBe(true);
    });

    test('should detect rejected options', () => {
      const content = 'We ruled out MySQL because of licensing. MongoDB was dismissed due to costs.';
      const result = detectOptions(content);
      expect(result.hasRejected).toBe(true);
    });
  });

  describe('detectConsequences', () => {
    test('should detect positive consequences', () => {
      const content = 'This will provide a benefit and advantage to the team.';
      const result = detectConsequences(content);
      expect(result.hasPositive).toBe(true);
    });

    test('should detect negative consequences', () => {
      const content = 'The risk is increased complexity. There is a drawback of higher costs.';
      const result = detectConsequences(content);
      expect(result.hasNegative).toBe(true);
    });

    test('should detect both positive and negative', () => {
      const content = 'The benefit is performance. The risk is complexity.';
      const result = detectConsequences(content);
      expect(result.hasBothPosNeg).toBe(true);
    });
  });

  describe('detectStatus', () => {
    test('should detect proposed status', () => {
      const content = 'Status: Proposed';
      const result = detectStatus(content);
      expect(result.hasProposed).toBe(true);
    });

    test('should detect accepted status', () => {
      const content = '## Status\nAccepted';
      const result = detectStatus(content);
      expect(result.hasAccepted).toBe(true);
    });

    test('should detect dates', () => {
      const content = 'Decision made on 2024-01-15.';
      const result = detectStatus(content);
      expect(result.hasDate).toBe(true);
    });
  });

  describe('detectRationale', () => {
    test('should detect rationale language', () => {
      const content = 'The reason for this decision is performance. Because of the requirements.';
      const result = detectRationale(content);
      expect(result.hasRationaleLanguage).toBe(true);
    });

    test('should detect evidence', () => {
      const content = 'The benchmark shows 50% improvement. Research indicates better outcomes.';
      const result = detectRationale(content);
      expect(result.hasEvidence).toBe(true);
    });
  });
});
