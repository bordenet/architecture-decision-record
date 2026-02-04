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

- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
