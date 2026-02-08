# Architecture Decision Record (ADR) Assistant

Write Architecture Decision Records with AI. Three phases: draft, review, refine.

[![Star this repo](https://img.shields.io/github/stars/bordenet/architecture-decision-record?style=social)](https://github.com/bordenet/architecture-decision-record)

**Try it**: [Assistant](https://bordenet.github.io/architecture-decision-record/) · [Validator](https://bordenet.github.io/architecture-decision-record/validator/)

> **What is an ADR?** An Architecture Decision Record captures a significant architectural decision along with its context and consequences. ADRs document *why* a decision was made, not just *what* was decided. See [adr.github.io](https://adr.github.io/) for the full specification.

[![CI](https://github.com/bordenet/architecture-decision-record/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/architecture-decision-record/actions)
[![codecov](https://codecov.io/gh/bordenet/architecture-decision-record/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/architecture-decision-record)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/architecture-decision-record/)
2. Enter decision context, problem statement, and constraints
3. Copy prompt → paste into Claude → paste response back
4. Repeat for review (Gemini) and synthesis (Claude)
5. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You provide decision context. Claude drafts an ADR with options and consequences.

**Phase 2** — Gemini reviews the draft: What alternatives are missing? What consequences are vague? What assumptions are unstated?

**Phase 3** — Claude takes the original draft plus Gemini's critique and produces a final ADR with clear tradeoffs.

---

## Scoring Methodology

The validator scores ADRs on a 100-point scale across four dimensions aligned with the [ADR specification](https://adr.github.io/). This scoring system enforces the principle that ADRs must document *why* a decision was made, not just *what* was decided.

### Scoring Taxonomy

| Category | Weight | Rationale |
|----------|--------|-----------|
| **Context** | 25 pts | Validates problem framing and constraint identification |
| **Decision** | 25 pts | Ensures clear decision statement with alternatives considered |
| **Consequences** | 25 pts | Enforces balanced positive/negative impact analysis |
| **Status** | 25 pts | Validates lifecycle metadata and completeness |

### Why These Weights?

**Context (25 pts)** establishes the foundation for decision validity. Without clear context, readers cannot evaluate whether the decision was appropriate. The validator checks:
- **Context section** (10 pts): Dedicated section with problem/situation description
- **Constraints** (8 pts): Requirements, limitations, and forces identified
- **Business focus** (7 pts): Context tied to business/stakeholder needs, not just technical concerns

**Decision (25 pts)** is the core of the ADR. A decision without rationale is an edict, not a record. The validator measures:
- **Decision statement** (10 pts): Clear, unambiguous statement of what was decided
- **Options considered** (8 pts): Alternatives documented with pros/cons comparison
- **Rationale** (7 pts): Explicit explanation of *why* this option was chosen

**Consequences (25 pts)** receives equal weight because ADRs that only list benefits are marketing documents, not decision records. The validator enforces:
- **Consequences section** (5 pts): Dedicated section documenting impacts
- **Balance** (10 pts): Requires 3+ positive AND 3+ negative consequences
- **Team factors** (5 pts): Training needs, skill gaps, hiring impact addressed
- **Subsequent ADRs** (3 pts): Triggered decisions identified (e.g., "triggers ADR-42")
- **Review timing** (2 pts): After-action review specified (e.g., "Review in 30 days")

**Status (25 pts)** ensures the ADR is actionable and traceable:
- **Status value** (10 pts): Clear status (Proposed/Accepted/Deprecated/Superseded)
- **Date** (7 pts): When the decision was made
- **Completeness** (8 pts): All required sections present

### Adversarial Robustness

The scoring system addresses common ADR failure modes:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Listing only positive consequences | Balance check requires 3+ negative consequences |
| Vague "we considered alternatives" | Options must include pros/cons comparison |
| Omitting team impact | Team factors (training, skills, hiring) are explicitly scored |
| No review commitment | Review timing is a scored element |
| Vague decisions ("strategic approach") | VAGUE_DECISION_PATTERNS detects banned phrases (-5 pts) |
| Using "complexity"/"overhead" | Vague consequence terms trigger penalty (-3 pts) |
| Missing action verbs | Requires use/adopt/implement/migrate/split/combine/establish/enforce |
| Generic "triggers a decision" | Subsequent ADR pattern requires specific topic |
| Non-standard review timing | Expanded pattern catches "45 days", "quarterly", etc. |

### Calibration Notes

The **balance check** (10 pts) is the most distinctive feature of this validator. Research on decision-making shows that decisions made without considering downsides are more likely to fail. By requiring explicit negative consequences, the validator forces authors to confront tradeoffs rather than advocate for a predetermined conclusion.

The **subsequent ADRs** pattern (3 pts) addresses decision coupling. Architectural decisions rarely exist in isolation—choosing a database triggers decisions about caching, replication, and backup. Documenting these dependencies creates a traceable decision graph.

---

## Usage

1. Open the app
2. Click "New Project", fill in your inputs
3. Copy each phase's prompt to the appropriate AI, paste responses back
4. Export when done

**Mock mode**: On localhost, toggle "AI Mock Mode" (bottom-right) to skip the copy/paste loop. Useful for testing.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/architecture-decision-record.git
cd architecture-decision-record
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

### Local Development

```bash
npm run serve   # Start local server at http://localhost:8000
```

## Project Structure

```
architecture-decision-record/
├── js/                    # JavaScript modules
│   ├── app.js            # Main application entry
│   ├── workflow.js       # Phase orchestration
│   ├── storage.js        # IndexedDB operations
│   └── ...
├── tests/                 # Jest test files
├── prompts/              # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── index.html            # Main HTML file
```

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
