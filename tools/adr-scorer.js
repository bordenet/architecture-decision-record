#!/usr/bin/env node
/**
 * ADR Scorer
 *
 * Evaluates ADR quality using objective criteria:
 * - Completeness: All required sections present (Status, Context, Decision, Consequences)
 * - Clarity: Decision is specific and actionable, not vague
 * - Consequences Balance: Both positive AND negative consequences listed
 * - Technical Soundness: Decision is realistic and implementable
 * - Industry Alignment: Follows official ADR format from Michael Nygard
 */
class ADRScorer {
  constructor() {
    this.criteria = {
      completeness: {
        weight: 1.0,
        checks: [
          { name: "Has Status section", pattern: /^##\s+Status/im },
          { name: "Has Context section", pattern: /^##\s+Context/im },
          { name: "Has Decision section", pattern: /^##\s+Decision/im },
          { name: "Has Consequences section", pattern: /^##\s+Consequences/im },
          { name: "Status is one of: Proposed, Accepted, Superseded, Deprecated", pattern: /^##\s+Status\s*\n(Proposed|Accepted|Superseded|Deprecated)/im },
          { name: "Decision is non-empty (>100 chars)", scorer: this.checkDecisionLength.bind(this) },
          { name: "Consequences section has content (>100 chars)", scorer: this.checkConsequencesLength.bind(this) }
        ]
      },
      clarity: {
        weight: 1.0,
        checks: [
          { name: "No vague language: \"better\"", pattern: /\bbetter\b/im, inverse: true },
          { name: "No vague language: \"improve\"", pattern: /\bimprove(?!\s+from)/im, inverse: true },
          { name: "No vague language: \"optimize\"", pattern: /\boptimize(?!\s+for)/im, inverse: true },
          { name: "No vague language: \"easier\"", pattern: /\beasier\b(?!\s+\()/im, inverse: true },
          { name: "No vague language: \"efficient\"", pattern: /\befficient\b(?!\s+in\s+terms)/im, inverse: true },
          { name: "Decision uses clear action verbs", pattern: /\b(use|adopt|implement|replace|migrate|split|combine|eliminate|enforce|require|must|shall)\b/im },
          { name: "Context clearly states the problem", scorer: this.checkContextClarity.bind(this) }
        ]
      },
      consequencesBalance: {
        weight: 1.2,  // Higher weight - this is critical
        checks: [
          { name: "Lists positive consequences", scorer: this.checkPositiveConsequences.bind(this) },
          { name: "Lists negative consequences", scorer: this.checkNegativeConsequences.bind(this) },
          { name: "Has at least 2 positive consequences", scorer: this.checkMinimumPositive.bind(this) },
          { name: "Has at least 2 negative consequences", scorer: this.checkMinimumNegative.bind(this) },
          { name: "Uses clear consequence language", pattern: /\b(will|may|may not|makes|requires|reduces|increases|simpler|more complex|easier|harder)\b/im }
        ]
      },
      technicalSoundness: {
        weight: 1.0,
        checks: [
          { name: "Decision is specific (not generic)", scorer: this.checkDecisionSpecificity.bind(this) },
          { name: "Decision is implementable", scorer: this.checkDecisionImplementability.bind(this) },
          { name: "No implementation details (\"use X framework\")", pattern: /\b(use [A-Z][a-z]+|implement [A-Z]|build with|deploy to [A-Z])/im, inverse: true },
          { name: "Addresses root cause from context", scorer: this.checkAddressesContext.bind(this) },
          { name: "Consequences are realistic", pattern: /\b(likely|probably|unlikely|possible|may|can|will|must)\b/im }
        ]
      },
      industryAlignment: {
        weight: 0.9,
        checks: [
          { name: "Follows Michael Nygard ADR format", scorer: this.checkNygardFormat.bind(this) },
          { name: "Decision focuses on \"why\" not \"how\"", scorer: this.checkWhyNotHow.bind(this) },
          { name: "Context explains constraints/alternatives", scorer: this.checkContextAlternatives.bind(this) }
        ]
      }
    };
  }

  /**
   * Score an ADR document
   */
  score(adrContent) {
    const scores = {};
    let totalScore = 0;
    let totalWeight = 0;

    for (const [criterion, config] of Object.entries(this.criteria)) {
      const criterionScore = this.scoreCriterion(adrContent, config);
      scores[criterion] = criterionScore;
      totalScore += criterionScore * config.weight;
      totalWeight += config.weight;
    }

    scores.overall = totalScore / totalWeight;
    scores.details = this.getDetailedScores(adrContent);
    return scores;
  }

  /**
   * Score a single criterion
   */
  scoreCriterion(content, config) {
    let passed = 0;
    const total = config.checks.length;

    for (const check of config.checks) {
      if (check.scorer) {
        // Custom scorer function
        if (check.scorer(content)) passed++;
      } else if (check.pattern) {
        // Pattern-based check
        const matches = check.pattern.test(content);
        const shouldMatch = !check.inverse;
        if (matches === shouldMatch) passed++;
      }
    }

    // Convert to 1-5 scale
    return 1 + (passed / total) * 4;
  }

  /**
   * Custom scoring functions
   */
  checkDecisionLength(content) {
    const match = content.match(/^##\s+Decision\s*\n([\s\S]*?)(?:^##|$)/im);
    return match && match[1].trim().length > 100;
  }

  checkConsequencesLength(content) {
    const match = content.match(/^##\s+Consequences\s*\n([\s\S]*?)(?:^##|$)/im);
    return match && match[1].trim().length > 100;
  }

  checkContextClarity(content) {
    const contextMatch = content.match(/^##\s+Context\s*\n([\s\S]*?)(?:^##|$)/im);
    if (!contextMatch) return false;
    const context = contextMatch[1];
    // Check for key context indicators
    return /\b(problem|challenge|issue|constraint|require|need|must)\b/im.test(context) &&
           context.length > 150;
  }

  checkPositiveConsequences(content) {
    const positiveMatch = content.match(/^###\s+Positive\s+Consequences\s*\n([\s\S]*?)\n\n(?=###|##)/im);
    if (!positiveMatch) return false;
    const section = positiveMatch[1];
    return /\b(simpler|easier|faster|reduces|improves|enables|allows|benefits|advantages|strengths)\b/im.test(section);
  }

  checkNegativeConsequences(content) {
    const negativeMatch = content.match(/^###\s+Negative\s+Consequences\s*\n([\s\S]*?)(?:\n\n(?=###|##)|$)/im);
    if (!negativeMatch) return false;
    const section = negativeMatch[1];
    return /\b(more complex|harder|slower|increases|requires|drawbacks|disadvantages|limitations|difficult)\b/im.test(section);
  }

  checkMinimumPositive(content) {
    const positiveMatch = content.match(/^###\s+Positive\s+Consequences\s*\n([\s\S]*?)\n\n(?=###|##)/im);
    if (!positiveMatch) return false;
    const section = positiveMatch[1];
    const positiveMatches = (section.match(/\b(simpler|easier|faster|reduces|improves|enables|allows|benefits)\b/ig) || []);
    return positiveMatches.length >= 2;
  }

  checkMinimumNegative(content) {
    const negativeMatch = content.match(/^###\s+Negative\s+Consequences\s*\n([\s\S]*?)(?:\n\n(?=###|##)|$)/im);
    if (!negativeMatch) return false;
    const section = negativeMatch[1];
    const negativeMatches = (section.match(/\b(more complex|harder|slower|increases|requires|drawbacks|limitations|difficult)\b/ig) || []);
    return negativeMatches.length >= 2;
  }

  checkDecisionSpecificity(content) {
    const decisionMatch = content.match(/^##\s+Decision\s*\n([\s\S]*?)(?:^##|$)/im);
    if (!decisionMatch) return false;
    const decision = decisionMatch[1];
    // Check for specific action verbs and subject matter
    const hasSpecificity = /\b(use|adopt|implement|replace|migrate|split|combine)\s+[a-z][a-z0-9-]*\b/im.test(decision);
    return hasSpecificity && decision.length > 150;
  }

  checkDecisionImplementability(content) {
    const decisionMatch = content.match(/^##\s+Decision\s*\n([\s\S]*?)(?:^##|$)/im);
    if (!decisionMatch) return false;
    const decision = decisionMatch[1];
    // Check that it's not purely abstract
    return decision.length > 120 && 
           /\b(will|shall|must|should|shall)\b/im.test(decision);
  }

  checkAddressesContext(content) {
    const contextMatch = content.match(/^##\s+Context\s*\n([\s\S]*?)(?:^##|$)/im);
    const decisionMatch = content.match(/^##\s+Decision\s*\n([\s\S]*?)(?:^##|$)/im);
    
    if (!contextMatch || !decisionMatch) return false;
    
    const context = contextMatch[1].toLowerCase();
    const decision = decisionMatch[1].toLowerCase();
    
    // Check if decision references key concepts from context
    const contextWords = context.split(/\s+/).filter(w => w.length > 5).slice(0, 10);
    const matches = contextWords.filter(w => decision.includes(w)).length;
    
    return matches >= 2;
  }

  checkNygardFormat(content) {
    // Check for required Nygard ADR sections
    const hasTitle = /^#\s+/m.test(content);
    const hasStatus = /^##\s+Status/im.test(content);
    const hasContext = /^##\s+Context/im.test(content);
    const hasDecision = /^##\s+Decision/im.test(content);
    const hasConsequences = /^##\s+Consequences/im.test(content);
    
    return hasTitle && hasStatus && hasContext && hasDecision && hasConsequences;
  }

  checkWhyNotHow(content) {
    const decisionMatch = content.match(/^##\s+Decision\s*\n([\s\S]*?)(?:^##|$)/im);
    if (!decisionMatch) return false;
    const decision = decisionMatch[1];
    
    // Should focus on "why" (rationale) not "how" (implementation)
    // Check for absence of specific technology names or how-to language
    const hasHow = /\b(use [a-z]+js|implement with|build using|deploy on|configure|install|setup)\b/im.test(decision);
    const hasWhy = /\b(because|reason|rationale|allows|enables|supports|aligns|meets|satisfies)\b/im.test(decision);
    
    return !hasHow && hasWhy;
  }

  checkContextAlternatives(content) {
    const contextMatch = content.match(/^##\s+Context\s*\n([\s\S]*?)(?:^##|$)/im);
    if (!contextMatch) return false;
    const context = contextMatch[1];
    
    // Check if context mentions alternatives, constraints, or trade-offs
    return /\b(alternatively|instead|rather than|constraint|constraint|limitation|trade-off|option|options)\b/im.test(context);
  }

  /**
   * Get detailed scores for each check
   */
  getDetailedScores(content) {
    const details = {};

    for (const [criterion, config] of Object.entries(this.criteria)) {
      details[criterion] = [];

      for (const check of config.checks) {
        let passed = false;

        if (check.scorer) {
          passed = check.scorer(content);
        } else if (check.pattern) {
          const matches = check.pattern.test(content);
          passed = check.inverse ? !matches : matches;
        }

        details[criterion].push({
          name: check.name,
          passed: passed
        });
      }
    }

    return details;
  }

  /**
   * Generate a human-readable report
   */
  generateReport(scores) {
    let report = "# ADR Quality Score Report\n\n";
    report += `**Overall Score:** ${scores.overall.toFixed(2)}/5.0\n\n`;

    // Score interpretation
    if (scores.overall >= 4.5) {
      report += "✅ **Status: Production-Ready** - This ADR is well-crafted and ready for use.\n\n";
    } else if (scores.overall >= 3.5) {
      report += "⚠️ **Status: Good** - This ADR is solid but has areas for improvement.\n\n";
    } else if (scores.overall >= 2.5) {
      report += "⚠️ **Status: Needs Work** - This ADR requires revision before use.\n\n";
    } else {
      report += "❌ **Status: Major Issues** - This ADR needs significant revision.\n\n";
    }

    report += "## Scores by Criterion\n\n";
    for (const [criterion, score] of Object.entries(scores)) {
      if (criterion !== "overall" && criterion !== "details") {
        const percentage = ((score - 1) / 4 * 100).toFixed(0);
        report += `- **${this.formatCriterionName(criterion)}:** ${score.toFixed(2)}/5.0 (${percentage}%)\n`;
      }
    }

    report += "\n## Detailed Checks\n\n";
    for (const [criterion, checks] of Object.entries(scores.details)) {
      report += `### ${this.formatCriterionName(criterion)}\n\n`;
      for (const check of checks) {
        const emoji = check.passed ? "✅" : "❌";
        report += `${emoji} ${check.name}\n`;
      }
      report += "\n";
    }

    report += "## Recommendations\n\n";
    const failedChecks = [];
    for (const [criterion, checks] of Object.entries(scores.details)) {
      for (const check of checks) {
        if (!check.passed) {
          failedChecks.push(`${criterion}: ${check.name}`);
        }
      }
    }

    if (failedChecks.length === 0) {
      report += "✅ No issues found. This ADR meets all quality criteria.\n";
    } else {
      report += "Focus on these areas:\n\n";
      failedChecks.slice(0, 5).forEach(item => {
        report += `- ${item}\n`;
      });
      if (failedChecks.length > 5) {
        report += `- ... and ${failedChecks.length - 5} more issues\n`;
      }
    }

    return report;
  }

  formatCriterionName(name) {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

export default ADRScorer;

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const fs = await import("fs");
  const adrFile = process.argv[2];

  if (!adrFile || !fs.existsSync(adrFile)) {
    console.error("❌ Usage: node tools/adr-scorer.js <adr-file>");
    process.exit(1);
  }

  const content = fs.readFileSync(adrFile, "utf8");
  const scorer = new ADRScorer();
  const scores = scorer.score(content);
  const report = scorer.generateReport(scores);

  console.log(report);
  console.log(`\n📊 JSON Scores: ${JSON.stringify(scores, null, 2)}`);
}
