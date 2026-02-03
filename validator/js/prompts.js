/**
 * Prompt generation for LLM-based ADR scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} adrContent - The ADR content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(adrContent) {
  return `You are an expert Software Architect evaluating an Architecture Decision Record (ADR).

Score this ADR using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Context (25 points)
- **Context Section (10 pts)**: Clear problem/situation description with dedicated section
- **Constraints (8 pts)**: Requirements, limitations, and forces identified
- **Business Focus (7 pts)**: Context tied to business/stakeholder needs

### 2. Decision (25 points)
- **Decision Statement (10 pts)**: Clear, unambiguous statement of what was decided
- **Options Considered (8 pts)**: Alternatives documented with pros/cons comparison
- **Rationale (7 pts)**: Clear explanation of WHY this decision was made

### 3. Consequences (25 points)
- **Consequences Section (8 pts)**: Dedicated section documenting impacts
- **Positive Outcomes (8 pts)**: Benefits and advantages documented
- **Trade-offs (9 pts)**: Risks, costs, and downsides explicitly stated

### 4. Status (25 points)
- **Status Value (10 pts)**: Clear status (Proposed/Accepted/Deprecated/Superseded)
- **Date (7 pts)**: When the decision was made
- **Completeness (8 pts)**: All required sections present

## CALIBRATION GUIDANCE
- Be HARSH. Most ADRs score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for team adoption.
- ADRs should be concise - deduct points for verbosity.
- Deduct points for missing trade-offs (every decision has downsides).
- Deduct points for vague decisions ("we might use", "consider using").
- Reward explicit "We will..." decision statements.
- Reward balanced consequences (both positive AND negative).
- Deduct points for missing status or date.

## ADR TO EVALUATE

\`\`\`
${adrContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Context: [X]/25
[2-3 sentence justification]

### Decision: [X]/25
[2-3 sentence justification]

### Consequences: [X]/25
[2-3 sentence justification]

### Status: [X]/25
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} adrContent - The ADR content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(adrContent, currentResult) {
  const issuesList = [
    ...(currentResult.context?.issues || []),
    ...(currentResult.decision?.issues || []),
    ...(currentResult.consequences?.issues || []),
    ...(currentResult.status?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Software Architect providing detailed feedback on an ADR.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Context: ${currentResult.context?.score || 0}/25
- Decision: ${currentResult.decision?.score || 0}/25
- Consequences: ${currentResult.consequences?.score || 0}/25
- Status: ${currentResult.status?.score || 0}/25

Key issues detected:
${issuesList || '- None detected by automated scan'}

## ADR TO CRITIQUE

\`\`\`
${adrContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall ADR quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Revised ADR** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Make it ready for team adoption.`;
}

/**
 * Generate rewrite prompt
 * @param {string} adrContent - The ADR content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(adrContent, currentResult) {
  return `You are a senior Software Architect rewriting an ADR to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL ADR

\`\`\`
${adrContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished ADR that:
1. Has clear Context section explaining the situation and constraints
2. Has explicit Decision statement using "We will..." format
3. Documents Options Considered with pros/cons for each
4. Includes Rationale explaining WHY this decision was made
5. Lists Consequences - both positive AND negative
6. Has clear Status (Proposed/Accepted/Deprecated/Superseded)
7. Includes date when decision was made
8. Avoids vague language ("might", "could", "should consider")
9. Is concise but complete

Output ONLY the rewritten ADR in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}
