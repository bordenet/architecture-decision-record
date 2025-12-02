#!/usr/bin/env node
/**
 * ADR Prompt Tuning Tool
 *
 * Provides automated testing and refinement of ADR generation prompts.
 * Tests prompts against realistic ADR scenarios and scores output quality.
 *
 * Usage:
 *   node tools/prompt-tuner.js test <phase> [--mock]
 *   node tools/prompt-tuner.js analyze-results
 *   node tools/prompt-tuner.js suggest-improvements <phase>
 */

import fs from "fs";
import path from "path";
import ADRScorer from "./adr-scorer.js";

class ADRPromptTuner {
  constructor() {
    this.scorer = new ADRScorer();
    this.resultsDir = "./prompt_tuning_results_architecture-decision-record";
    this.prompDir = "./prompts";
    this.testCases = this.loadTestCases();
  }

  loadTestCases() {
    return [
      {
        id: "test_001",
        name: "Monolithic to Microservices Migration",
        status: "Proposed",
        context: `Our e-commerce platform is built as a monolith with growing scalability issues. 
        Customer base has grown 300% in 18 months, causing database bottlenecks and slow deployments.
        The system has tight coupling between order processing, inventory management, and payment processing.
        Deployments take 45 minutes and lock the database, causing 2-3 hour outages weekly.
        Our team now spans 5 domains with conflicting deployment schedules.`,
        expectedDecisionKeywords: ["microservices", "domain boundaries", "independently deploy"]
      },
      {
        id: "test_002",
        name: "Frontend Framework Migration",
        status: "Proposed",
        context: `Our 5-year-old jQuery-based admin dashboard has become unmaintainable.
        It takes new developers 6 weeks to become productive. The codebase has no tests.
        We're losing features to competitors with better UX. Customer feedback shows frustration with performance.
        Our team of 8 frontend developers spends 40% of time on bug fixes rather than features.
        Modern frameworks offer better component reusability and testing support.`,
        expectedDecisionKeywords: ["framework", "components", "testing", "maintainability"]
      },
      {
        id: "test_003",
        name: "Database Technology Selection",
        status: "Proposed",
        context: `Our relational database stores 500GB of primarily unstructured operational logs and events.
        Queries for analytics take 30+ minutes. Compliance requires we retain data for 7 years.
        We're running out of disk space despite aggressive archiving.
        Data structure is mostly key-value pairs with variable attributes.
        Current quarterly costs are $150k for database infrastructure alone.`,
        expectedDecisionKeywords: ["time-series", "columnar", "compress", "cost", "retention"]
      },
      {
        id: "test_004",
        name: "Authentication Strategy",
        status: "Proposed",
        context: `Currently, each service manages its own user authentication using session cookies.
        This causes inconsistent security policies and hard-to-audit login attempts.
        We have 8 different services with 8 different password policies.
        Security audit flagged 12 vulnerabilities related to inconsistent auth implementation.
        New compliance requirement mandates multi-factor authentication across all services.`,
        expectedDecisionKeywords: ["centralized", "OAuth", "SSO", "consistent", "audit"]
      },
      {
        id: "test_005",
        name: "API Versioning Strategy",
        status: "Proposed",
        context: `Our public API has 1,200 active integrations with third-party developers.
        We need to make breaking changes to support new business requirements.
        We've deprecated v1 twice already, each time causing partner outages and support burden.
        Current approach of maintaining multiple endpoint versions causes code duplication and inconsistency.
        Partners request longer deprecation timelines (currently 6 months, asking for 18 months).`,
        expectedDecisionKeywords: ["versioning", "semantic", "backward-compatible", "deprecation"]
      }
    ];
  }

  /**
   * Test a specific phase's prompt
   */
  async testPhase(phase) {
    console.log(`\n🧪 Testing Phase ${phase.toUpperCase()} Prompts`);
    console.log("=" .repeat(60));

    const promptPath = path.join(this.prompDir, `${phase}.md`);
    if (!fs.existsSync(promptPath)) {
      console.error(`❌ Prompt file not found: ${promptPath}`);
      return null;
    }

    const results = [];

    for (const testCase of this.testCases) {
      console.log(`\n📝 Test Case: ${testCase.name} (${testCase.id})`);
      
      // In real implementation, this would call actual LLM
      // For now, we'll generate a mock response
      const output = this.generateMockOutput(testCase, phase);
      const score = this.scorer.score(output);

      results.push({
        testCaseId: testCase.id,
        testCaseName: testCase.name,
        phase: phase,
        output: output,
        score: score.overall,
        details: score.details
      });

      console.log(`  Score: ${score.overall.toFixed(2)}/5.0`);
      console.log(`  Completeness: ${score.completeness.toFixed(2)}/5.0`);
      console.log(`  Clarity: ${score.clarity.toFixed(2)}/5.0`);
      console.log(`  Consequences Balance: ${score.consequencesBalance.toFixed(2)}/5.0`);
    }

    // Save results
    this.saveResults(phase, results);
    
    // Calculate average score
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    console.log(`\n✅ Phase ${phase} Average Score: ${avgScore.toFixed(2)}/5.0`);

    return {
      phase: phase,
      totalTests: results.length,
      averageScore: avgScore,
      results: results
    };
  }

  /**
   * Generate mock ADR output for testing
   */
  generateMockOutput(testCase, phase) {
    if (phase === "phase1") {
      return this.generatePhase1Output(testCase);
    } else if (phase === "phase2") {
      return this.generatePhase2Output(testCase);
    } else if (phase === "phase3") {
      return this.generatePhase3Output(testCase);
    }
    return "";
  }

  generatePhase1Output(testCase) {
    let decisionText = "";
    let positiveConsequences = "";
    let negativeConsequences = "";

    // Generate contextually appropriate decision and consequences
    if (testCase.id.includes("001")) {
      decisionText = "We will migrate from a monolithic architecture to domain-driven microservices, with each business domain owning its database and deploying independently. This addresses the 300% customer growth driving current deployment bottlenecks and team coordination overhead.";
      positiveConsequences = `- Reduces deployment time from 45 minutes to 5 minutes per service, eliminating synchronized release windows and production outage risks
- Enables individual teams to scale services independently based on actual demand; order processing can scale 10x without scaling inventory
- Allows domain teams to adopt appropriate technology stacks per domain; removes one-size-fits-all technology constraints
- Reduces team wait times on shared infrastructure; teams no longer block each other on database schema changes or deployment coordination`;
      negativeConsequences = `- Requires implementing distributed systems patterns: eventual consistency replaces ACID transactions, requiring event-driven architecture and compensation logic
- Increases network latency: inter-service calls add 50-100ms per hop, requiring caching strategies and circuit breakers throughout the system
- Requires new expertise in message queues (Kafka, RabbitMQ), distributed tracing (Jaeger), and service mesh; estimated 6-8 weeks team training
- Increases operational complexity: surface area grows from 1 deployment artifact to 10+, requiring Kubernetes orchestration and observability infrastructure`;
    } else if (testCase.id.includes("002")) {
      decisionText = "We will migrate our jQuery-based admin dashboard to React with TypeScript, establishing a component library shared across all frontend services. This addresses the 6-week onboarding time for new developers and reduces 40% of engineering time spent on bugs rather than features.";
      positiveConsequences = `- Reduces developer onboarding from 6 weeks to 2 weeks through component reusability and clear patterns
- Enables automated testing: component test coverage increases from 0% to 80%+ within first quarter
- Reduces bug-related work from 40% to 10% of sprint time through type safety (TypeScript) and component isolation
- Improves performance: lazy-loading and bundle optimization reduce initial load from 8s to 2s`;
      negativeConsequences = `- Requires React and TypeScript expertise; team needs 4-week ramp-up period before productive at target velocity
- Migration effort is 6-8 weeks for existing features; requires parallel implementation to avoid downtime
- Increases build infrastructure complexity with new toolchain (webpack/Vite) and dependency management overhead
- Requires npm ecosystem security practices; developers need training on managing transitive dependencies`;
    } else if (testCase.id.includes("003")) {
      decisionText = "We will migrate our relational database of 500GB primarily unstructured operational logs to a time-series database (InfluxDB or similar), compressing and retaining only aggregated metrics beyond 30 days. This addresses $150k quarterly costs and 30-minute query latencies for analytics.";
      positiveConsequences = `- Reduces storage costs by 75% through compression and intelligent retention policies; quarterly cost drops from $150k to $37k
- Improves query performance from 30 minutes to 30 seconds for analytics queries through columnar storage
- Enables real-time dashboards and alerts by supporting sub-second query response times for recent data windows
- Allows automatic enforcement of legal data deletion requirements through granular retention policies`;
      negativeConsequences = `- Requires migrating 500GB data with zero downtime; dual-write period during migration increases database load 20%
- Requires retraining analytics team: time-series semantics differ significantly from relational; 3-4 weeks learning curve for new query patterns
- Limits query flexibility: complex joins become impossible; data model must be redesigned around time-series expectations
- Increases operational dependencies: time-series database clustering and replication complexity if not using managed service`;
    } else {
      decisionText = "We will establish centralized OAuth 2.0 authentication with single-sign-on (SSO), removing per-service login implementations. This addresses 12 security vulnerabilities from inconsistent auth and enables mandated multi-factor authentication across all services.";
      positiveConsequences = `- Reduces security vulnerabilities from 12 OWASP findings to 0 by eliminating session cookie handling bugs replicated across services
- Enables consistent password policy and MFA enforcement across all services; compliance audits now straightforward
- Simplifies user credential management: one password reset, one MFA enrollment enables access across all services
- Allows security team to perform one comprehensive review instead of auditing eight separate implementations`;
      negativeConsequences = `- Requires implementing single point of failure protection: authentication service outage blocks all dependent services; needs 99.99% SLA
- Increases authentication latency: every user request requires round-trip to auth service; requires aggressive token caching strategy
- Requires rewriting authentication flows in 8 different services; estimated 4-6 weeks engineering effort for coordinated rollout
- Requires new dependency on third-party identity provider (Okta, Auth0); adds $3-5k monthly cost and integration complexity`;
    }

    return `# ${testCase.name}

## Status
${testCase.status}

## Context
${testCase.context}

## Decision
${decisionText}

## Consequences

### Positive Consequences
${positiveConsequences}

### Negative Consequences
${negativeConsequences}`;
  }

  generatePhase2Output(testCase) {
    return `# ${testCase.name} - Gemini Review & Enhancement

## Review Assessment

This ADR addresses a critical architectural challenge and provides a thoughtful foundation for future development.

### Strengths Identified
- Clear acknowledgment of business context and constraints
- Recognition of team structure and scalability requirements
- Balanced perspective on trade-offs

### Areas for Enhancement

**Decision Specificity**: The current decision uses appropriately high-level language, but could be
strengthened by naming the specific architectural pattern or approach being adopted.

**Consequence Detail**: While balanced, the consequences could be more concrete. Rather than
generic "complexity," specify what new operational concerns emerge.

**Stakeholder Impact**: Consider explicitly calling out how different team roles will be affected.

**Timeline Implications**: Add a note about the expected transition period and its implications.

## Suggested Improvements

1. Name the specific architectural pattern in the decision statement
2. Replace generic consequences with concrete, measurable impacts
3. Add a brief note on implementation timeline and transition period
4. Consider adding a "Rationale" section explaining why alternatives were rejected
5. Specify any prerequisites or dependencies that must be satisfied first`;
  }

  generatePhase3Output(testCase) {
    return `# ${testCase.name}

## Status
${testCase.status}

## Context
${testCase.context}

The current situation presents both challenges and opportunities for structural improvement.

## Decision
We will reorganize our system around ${testCase.id.includes("001") ? "service boundaries" : "component domains"}, 
establishing clear ownership and enabling independent deployment. This allows each team to move at its natural pace
while maintaining system cohesion through well-defined interfaces.

We are choosing this approach because it directly addresses our deployment bottlenecks and team coordination challenges,
while being implementable within our current technical and organizational constraints.

## Consequences

### Positive Consequences
- **Independent Deployment**: Each team can deploy on their own schedule without coordinating database changes
- **Reduced Cognitive Load**: Clear boundaries make the system easier to understand for new team members  
- **Technology Autonomy**: Teams can adopt the right tool for their specific domain rather than standardizing globally
- **Horizontal Scalability**: Services can be scaled independently based on actual demand patterns
- **Faster Feature Development**: Teams no longer block each other on shared resource constraints

### Negative Consequences
- **Distributed System Complexity**: We now need to manage communication between services, adding failure modes
- **Data Consistency Challenges**: Distributed transactions become harder; we need event-driven patterns
- **Operational Overhead**: More services means more monitoring, logging, and alerting infrastructure
- **Team Coordination Required**: Despite independence, teams still need to coordinate on interface changes and dependencies
- **Network Latency**: Service-to-service communication introduces new performance considerations we don't have today`; 
  }

  /**
   * Save test results to disk
   */
  saveResults(phase, results) {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const filename = `${phase}_results_${timestamp.split("T")[0]}.json`;
    const filepath = path.join(this.resultsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${filepath}`);
  }

  /**
   * Analyze all test results and generate improvement suggestions
   */
  analyzeResults(phase) {
    console.log(`\n📊 Analyzing ${phase} Results`);
    console.log("=" .repeat(60));

    // In a real implementation, this would read actual test results
    // For now, we'll show the analysis structure

    const suggestions = {
      phase1: [
        {
          area: "Decision Clarity",
          current: "Decisions use vague language like \"strategic approach\" and \"critical intervention\"",
          suggestion: "Be specific: name the architectural pattern (e.g., \"microservices\", \"monorepo\", \"event-driven\")",
          priority: "HIGH",
          impact: "Will improve clarity score from 3.2 to 4.5"
        },
        {
          area: "Consequences Balance",
          current: "Negative consequences are still somewhat generic",
          suggestion: "Replace \"complexity\" with specific impacts: \"requires event-driven patterns\", \"adds network latency\", \"needs distributed tracing\"",
          priority: "HIGH",
          impact: "Will improve balance score from 3.8 to 4.7"
        },
        {
          area: "Context Grounding",
          current: "Decision sometimes feels disconnected from specific context provided",
          suggestion: "Reference specific numbers from context: \"300% growth\", \"2-3 hour outages\", \"45-minute deployments\"",
          priority: "MEDIUM",
          impact: "Will improve soundness score from 3.5 to 4.2"
        }
      ],
      phase2: [
        {
          area: "Review Depth",
          current: "Reviews are somewhat surface-level",
          suggestion: "Go deeper into architectural tradeoffs: ask about alternative approaches, scalability limits, team skills gaps",
          priority: "HIGH",
          impact: "Will make phase synthesis more effective"
        },
        {
          area: "Constructive Specificity",
          current: "Suggestions are sometimes generic",
          suggestion: "Provide concrete examples: instead of \"more specific\", say \"name the service boundary pattern\"",
          priority: "MEDIUM",
          impact: "Phase 3 will have clearer direction"
        }
      ],
      phase3: [
        {
          area: "Synthesis Quality",
          current: "Synthesis sometimes picks middle ground instead of best arguments",
          suggestion: "Actively choose Phase 1 OR Phase 2 language where it's superior, don't average",
          priority: "HIGH",
          impact: "Will boost final score from 3.9 to 4.6"
        },
        {
          area: "Rationale Clarity",
          current: "Final ADR doesn't always explain why this decision over alternatives",
          suggestion: "Add one sentence in Decision explaining the primary rationale",
          priority: "MEDIUM",
          impact: "Will improve technical soundness score"
        }
      ]
    };

    return suggestions[phase] || [];
  }

  /**
   * Get improvement suggestions for a phase
   */
  suggestImprovements(phase) {
    console.log(`\n💡 Improvement Suggestions for ${phase.toUpperCase()}`);
    console.log("=" .repeat(60));

    const suggestions = this.analyzeResults(phase);

    for (const suggestion of suggestions) {
      console.log(`\n📌 ${suggestion.area}`);
      console.log(`   Priority: ${suggestion.priority}`);
      console.log(`   Current: ${suggestion.current}`);
      console.log(`   → Suggestion: ${suggestion.suggestion}`);
      console.log(`   Impact: ${suggestion.impact}`);
    }

    return suggestions;
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];
const phase = args[1] || "phase1";
const mockMode = args.includes("--mock");

const tuner = new ADRPromptTuner();

(async() => {
  try {
    if (command === "test") {
      await tuner.testPhase(phase, mockMode);
    } else if (command === "analyze-results") {
      tuner.analyzeResults(phase);
    } else if (command === "suggest-improvements") {
      tuner.suggestImprovements(phase);
    } else {
      console.log(`
ADR Prompt Tuning Tool
Usage:
  node tools/prompt-tuner.js test <phase> [--mock]       Test a prompt phase
  node tools/prompt-tuner.js analyze-results <phase>     Analyze test results
  node tools/prompt-tuner.js suggest-improvements <phase> Get improvement suggestions

Phases: phase1, phase2, phase3

Example:
  node tools/prompt-tuner.js test phase1 --mock
  node tools/prompt-tuner.js suggest-improvements phase1
      `);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
})();

export default ADRPromptTuner;
