# Architecture Decision Record Assistant

An AI-assisted tool for drafting architecture decision records (ADRs) using the standard GitHub template format. Generate well-reasoned architectural decisions with context and consequences.

**🌐 Try it now: <https://bordenet.github.io/architecture-decision-record/>**

[![CI/CD](https://github.com/bordenet/architecture-decision-record/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/architecture-decision-record/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/architecture-decision-record/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/architecture-decision-record)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

---

## Features

- **100% Client-Side**: All processing happens in your browser. No server required.
- **Privacy-First**: Your ADRs never leave your device. No data collection.
- **3-Phase Workflow**: Structured approach to create comprehensive architectural decisions
- **AI-Assisted**: Generate initial drafts, reviews, and synthesis
- **Export/Import**: Save your work as markdown or JSON
- **Dark Mode**: Full dark mode support for comfortable late-night coding
- **Responsive Design**: Works on desktop, tablet, and mobile

---

## How It Works

### Template Structure

Based on the [architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record) standard:

**Title** : Clear, descriptive decision title

**Status** : Proposed, Accepted, Deprecated, Superseded

**Context** : What circumstances led to this decision?

**Decision** : What did you decide and why?

**Consequences** : What follow-up actions result from this decision?

**Rationale** : Why this decision over alternatives?

---

## The 3-Phase Workflow

The assistant guides you through a structured 3-phase process for creating comprehensive ADRs:

### Phase 1: Initial Draft (Mock Mode)
1. Fill in the ADR form with your decision context
2. AI generates a structured initial ADR draft
3. Review and refine the generated draft
4. Save your draft and proceed to Phase 2

**What happens**: The system takes your inputs and organizes them into a formal ADR structure, creating a foundation for review.

### Phase 2: Adversarial Review (Manual Mode)
1. Copy the Phase 1 ADR to an external AI (Claude, ChatGPT, Gemini)
2. Ask the AI to critique the decision from different angles
3. Paste the AI feedback back into the tool
4. Review how the original ADR holds up under scrutiny

**What happens**: The external AI provides challenging questions and alternative perspectives to strengthen your decision. The tool automatically detects if you're using the same AI model as Phase 1 and applies adversarial strategies to maintain tension.

### Phase 3: Final Synthesis (Mock Mode)
1. The system synthesizes Phase 1 draft and Phase 2 feedback
2. Produces a final, polished ADR incorporating all insights
3. Export as markdown for GitHub or JSON for storage
4. Archive the complete decision history

**What happens**: The final ADR reflects both your original thinking and critical review, resulting in a more robust architectural decision document.

---

## Key Features

- **Same-LLM Detection**: When Phase 1 and Phase 2 use the same AI model, the tool automatically applies adversarial strategies to maintain quality and challenge your assumptions
- **Multiple Projects**: Create and manage multiple ADRs in the same session
- **Full History**: Each project maintains complete history through all 3 phases
- **Privacy-First**: All processing happens in your browser—no data leaves your device

---

## Quick Start

### Automated Setup (Recommended)

**macOS:**
```bash
./scripts/setup-macos.sh
```

**Linux (Ubuntu/Debian):**
```bash
./scripts/setup-linux.sh
```

**Windows (WSL):**
```bash
./scripts/setup-windows-wsl.sh
```

### Manual Setup

```bash
npm install
./scripts/install-hooks.sh
npm test
```

---

## Development

### Running Locally

```bash
npm run serve
# Opens: http://localhost:8000
```

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Linting

```bash
# Check for issues
npm run lint

# Fix automatically
npm run lint:fix
```

---

## Deployment

### Automated Deployment

This project uses GitHub Actions for continuous deployment. Every push to `main` triggers:
1. Linting checks
2. Unit tests
3. Test coverage verification
4. Automatic deployment to GitHub Pages

**Live Site**: https://bordenet.github.io/architecture-decision-record/

### Manual Deployment (Local)

To deploy changes from your local machine:

```bash
./scripts/deploy-web.sh
```

The script will:
1. Run linting checks (`npm run lint`)
2. Run all unit tests (`npm test`)
3. Verify test coverage meets requirements
4. Commit changes with timestamp
5. Push to GitHub (triggers CI/CD)
6. Monitor deployment status

### Deployment Workflow

```
Your changes
    ↓
npm run lint (automated)
    ↓
npm test (automated)
    ↓
git commit + push (automated)
    ↓
GitHub Actions CI/CD
    ├─ Quality Gates
    │  ├─ Linting
    │  ├─ Tests
    │  └─ Coverage
    ↓
GitHub Pages Deploy
    ↓
https://bordenet.github.io/architecture-decision-record/ (live)
```

---

## Project Structure

```
architecture-decision-record/
├── index.html              # Main application
├── css/
│   └── styles.css          # Tailwind + custom styles
├── js/
│   ├── app.js              # Main application logic
│   ├── workflow.js         # Phase workflow management
│   ├── storage.js          # IndexedDB persistence
│   ├── ai-mock.js          # AI mock responses
│   ├── router.js           # Multi-project routing
│   ├── views.js            # View rendering
│   ├── projects.js         # Project CRUD operations
│   ├── project-view.js     # Individual project view
│   ├── ui.js               # UI utilities
│   ├── same-llm-adversarial.js  # LLM strategy handling
│   └── ai-mock-ui.js       # Mock mode UI
├── tests/                  # Jest test suite
│   ├── ai-mock.test.js
│   ├── storage.test.js
│   ├── workflow.test.js
│   └── same-llm-adversarial.test.js
├── prompts/                # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
├── templates/              # Document templates
│   └── adr-template.md
├── scripts/                # Automation scripts
│   ├── setup-macos.sh
│   ├── setup-linux.sh
│   ├── deploy-web.sh
│   └── lib/
│       ├── common.sh
│       └── compact.sh
└── .github/workflows/      # CI/CD workflows
    └── ci.yml
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Available options:
- `AI_MODE`: "mock" (default) or "live"
- `DEBUG`: "true" or "false"
- `LOG_LEVEL`: "info" (default), "debug", "warn", "error"

---

## Related Projects

- **[One-Pager Assistant](https://bordenet.github.io/one-pager/)** - Create concise one-page documents
- **[Product Requirements Assistant](https://bordenet.github.io/product-requirements-assistant/)** - Write professional PRDs
- **[Power Statement Assistant](https://bordenet.github.io/power-statement-assistant/)** - Create compelling power statements
- **[Architecture Decision Record Standard](https://github.com/joelparkerhenderson/architecture-decision-record)** - ADR documentation

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linting (`npm run lint:fix`)
6. Commit with descriptive messages
7. Push to GitHub
8. Open a Pull Request

### Code Quality

- **Test Coverage**: ≥85% required
- **Linting**: ESLint zero errors
- **Testing**: All tests must pass
- **Documentation**: Update docs with changes

---

## Quality Standards

This project maintains high quality standards:

- **Testing**: Comprehensive test suite with 85%+ coverage
- **Linting**: ESLint with strict rules
- **CI/CD**: Automated quality gates on every push
- **Documentation**: Clear architecture and contribution guides
- **Accessibility**: WCAG AA compliance
- **Performance**: Fast load times, optimized JavaScript

---

## Architecture

### Client-Side Only

All processing happens in the browser. No backend server required.

- **Storage**: IndexedDB for persistent local storage
- **State Management**: JavaScript modules with explicit state
- **UI Framework**: Vanilla JavaScript (no dependencies except testing libraries)

### 3-Phase Workflow

Each ADR goes through three distinct phases:

1. **Phase 1 (Mock)**: Initial structured generation
2. **Phase 2 (Manual)**: User-driven critique and improvement
3. **Phase 3 (Mock)**: Final synthesis combining all inputs

### Same-LLM Detection

When Phase 1 and Phase 2 use the same AI model, the system automatically applies adversarial strategies to maintain tension and quality.

---

## Troubleshooting

### Tests Failing

```bash
# Ensure dependencies are installed
npm install

# Clear Jest cache
npm test -- --clearCache

# Run with verbose output
npm test -- --verbose
```

### Dark Mode Not Working

Dark mode is enabled via Tailwind CSS. If toggle doesn't work:
1. Check browser DevTools for errors
2. Verify `darkMode: 'class'` in Tailwind config
3. Check `.github/workflows/ci.yml` for quality gate errors

### Deployment Issues

```bash
# Verify deployment script exists
ls -la scripts/deploy-web.sh

# Test deployment locally
./scripts/deploy-web.sh --help

# Check GitHub Pages settings
# Settings → Pages → Source should be: Deploy from a branch
# Branch: main, Folder: /
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Support

- **Issues**: [GitHub Issues](https://github.com/bordenet/architecture-decision-record/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bordenet/architecture-decision-record/discussions)
- **Documentation**: See docs/ folder

---

## Related Resources

- [Documenting Architecture Decisions](https://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions) - Michael Nygard
- [ADR Tools](https://github.com/npryce/adr-tools) - Command-line tools
- [MADR](https://adr.github.io/madr/) - Markdown ADR format

---

**Created with [Genesis](https://github.com/bordenet/genesis) project templates**
