/**
 * Phase 3 Synthesis Module
 * Synthesizes decision with adversarial feedback into final ADR
 */

const ADR_TEMPLATE = `# ADR: {{TITLE}}

## Status
{{STATUS}}

## Context and Problem Statement

{{CONTEXT}}

## Decision

{{DECISION}}

## Consequences

### Positive Consequences
- {{CONSEQUENCE_1}}
- {{CONSEQUENCE_2}}

### Negative Consequences
- {{RISK_1}}
- {{RISK_2}}

## Rationale

{{RATIONALE}}

## Alternatives Considered

As discussed in the adversarial review phase, the following alternatives were considered:

{{ALTERNATIVES}}

## Validation & Verification

- [ ] Team alignment confirmed
- [ ] Technical feasibility validated
- [ ] Risk mitigation strategy approved
- [ ] Success metrics defined

## Related Decisions

- Related ADR 1: (link)
- Related ADR 2: (link)

## References

- Reference document 1
- Reference document 2

---
*Last Updated: {{DATE}}*
`;

function synthesizeADR(project) {
  let adr = ADR_TEMPLATE;

  // Replace placeholders with actual content
  adr = adr.replace('{{TITLE}}', project.title || 'Architecture Decision');
  adr = adr.replace('{{STATUS}}', project.status || 'Proposed');
  adr = adr.replace('{{CONTEXT}}', project.context || '[Context not provided]');
  adr = adr.replace('{{DECISION}}', project.decision || '[Decision not provided]');
  adr = adr.replace('{{CONSEQUENCE_1}}', project.consequences?.split('\n')[0] || 'TBD');
  adr = adr.replace('{{CONSEQUENCE_2}}', project.consequences?.split('\n')[1] || 'TBD');
  adr = adr.replace('{{RISK_1}}', 'Requires careful implementation');
  adr = adr.replace('{{RISK_2}}', 'May require team training');
  adr = adr.replace('{{RATIONALE}}', project.rationale || '[Rationale not provided]');
  adr = adr.replace(
    '{{ALTERNATIVES}}',
    project.phase2Review
      ? 'See adversarial review feedback for detailed alternative analysis'
      : 'No alternatives documented'
  );
  adr = adr.replace('{{DATE}}', new Date().toISOString().split('T')[0]);

  return adr;
}

function exportAsMarkdown(adr, filename = 'adr.md') {
  const blob = new Blob([adr], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAsJSON(project) {
  const data = {
    title: project.title,
    status: project.status,
    context: project.context,
    decision: project.decision,
    consequences: project.consequences,
    rationale: project.rationale,
    phase2Review: project.phase2Review,
    finalADR: project.finalADR,
    exportDate: new Date().toISOString()
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.title || 'adr'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export { synthesizeADR, exportAsMarkdown, exportAsJSON };
