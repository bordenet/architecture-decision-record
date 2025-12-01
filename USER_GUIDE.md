# User Guide: Architecture Decision Record Assistant

## Getting Started

### 1. Access the Application
Visit: **https://bordenet.github.io/architecture-decision-record/**

No installation required. Everything runs in your browser.

### 2. Create Your First ADR

Click **"+ Create Your First Project"** (or **"+ New Project"** if you have existing projects).

You'll see the Phase 1 form.

---

## Phase 1: Initial Draft

The first phase guides you through capturing the core decision details.

### Fields to Fill

**ADR Title** (Required)
- Descriptive title for your decision
- Example: "Use microservices architecture for scalability"

**Status** (Required)
- **Proposed**: Initial decision, not yet approved
- **Accepted**: Team has agreed to this decision
- **Deprecated**: Decision is no longer valid
- **Superseded**: Replaced by newer decision

**Context & Problem Statement** (Required)
- Explain the issue or problem being addressed
- What circumstances led to this decision?
- Example: "Current monolithic architecture is difficult to scale, deployments are slow, and teams are blocked by shared dependencies"

**Decision** (Optional - AI can generate)
- Your proposed solution
- What are you deciding to do?
- Can be left blank for AI to generate

**Consequences** (Optional - AI can generate)
- What will change as a result?
- Positive and negative impacts
- Team, process, and technical implications

**Rationale** (Optional - AI can generate)
- Why is this the right decision?
- What makes it better than alternatives?

### AI Generation

Click **"✨ Generate with AI"** to have the system automatically fill in the optional fields based on your title and context.

The AI will:
1. Analyze your problem statement
2. Generate a structured decision
3. Suggest consequences
4. Provide rationale

### Advancing to Phase 2

Click **"→ Phase 2"** to move forward. This will:
1. Save your Phase 1 data
2. Move to the review phase
3. Show your decision alongside a critique form

---

## Phase 2: Review & Critique

Phase 2 provides critical feedback on your decision using adversarial techniques.

### Understanding the Layout

**Left Side: Your Decision**
- Shows your title, context, and decision from Phase 1
- Read-only reference of what you proposed

**Right Side: AI Critique**
- Critical feedback and suggestions
- Alternative approaches
- Risk analysis
- Success criteria

### Generating Critique

Click **"✨ Generate Critique"** to have the AI create adversarial feedback.

The system analyzes your decision and provides:
- Hidden assumptions
- Risk assessment
- Alternative approaches
- Scalability concerns
- Team impact analysis
- Cost-benefit analysis

### Using the Feedback

The critique isn't meant to reject your decision—it's meant to strengthen it.

Consider:
1. Are the concerns valid?
2. Which alternatives are worth exploring?
3. What's missing from your plan?
4. How can you mitigate the risks identified?

### Advancing to Phase 3

Click **"→ Phase 3"** (or **"Save & Continue"**) to synthesize your decision with the feedback.

---

## Phase 3: Final Synthesis

Phase 3 combines your original decision with the adversarial feedback into a final ADR document.

### Understanding the Layout

**Left Side: Decision + Feedback**
- Your original decision
- The adversarial critique
- Reference material

**Right Side: Final ADR**
- Complete, formatted ADR document
- Ready for export or sharing
- Incorporates feedback into structure

### Synthesizing Your ADR

Click **"✨ Synthesize & Generate"** to create the final document.

This generates a professional ADR in markdown format with sections:
- Title and Status
- Context and Problem Statement
- Decision
- Consequences (positive and negative)
- Rationale
- Alternatives Considered
- Validation & Verification
- Related Decisions
- References

### Exporting Your ADR

**Export as Markdown:**
Click **"📥 Export ADR"** to download your decision as a `.md` file.

Use in:
- GitHub repository documentation
- Architecture team wikis
- Project decision logs
- Email/chat sharing

**Format:**
```markdown
# ADR: [Your Title]

## Status
[Proposed/Accepted/Deprecated/Superseded]

## Context and Problem Statement
[Your problem statement]

## Decision
[Your decision]

## Consequences
### Positive Consequences
- [Benefits]

### Negative Consequences
- [Trade-offs]

## Rationale
[Why this decision]

## Alternatives Considered
[Alternatives analyzed]

## Validation & Verification
- [ ] Team alignment confirmed
- [ ] Technical feasibility validated
- [ ] Risk mitigation strategy approved
- [ ] Success metrics defined

## Related Decisions
[Links to related ADRs]

## References
[Documentation links]
```

---

## Managing Projects

### Project List

The home view shows all your ADRs:
- Title
- Context preview
- Last updated date
- Click to open and edit

### Actions

**Create New Project**
- Click **"+ New Project"** button

**Edit Existing Project**
- Click any project card to open it
- Edit any phase
- Changes auto-save

**Delete Project**
- Open project → Phase 1 form
- Click **"Delete"** button
- Confirm deletion

### Export/Import All Projects

**Export All Projects**
- Click settings icon or export button
- Downloads all projects as JSON
- Backup your work

**Import Projects**
- Click import button
- Select JSON file
- Projects are merged (not replaced)

---

## Features

### Dark Mode

Toggle dark mode with the theme button in the header.

Preferences are saved automatically.

### Responsive Design

Works on:
- Desktop (optimized)
- Tablet (iPad-sized screens)
- Mobile (phones)

Touch-friendly interface on all devices.

### Privacy

**100% Client-Side**
- No server communication
- No data collection
- Your ADRs never leave your browser

**Local Storage**
- IndexedDB browser storage
- Automatic backups
- Export anytime

### Keyboard Navigation

Full keyboard support:
- `Tab` to navigate between fields
- `Enter` to submit forms
- `Esc` to close dialogs

---

## Tips & Tricks

### Writing Better Contexts

Strong context = better AI generation.

❌ **Weak:** "Architecture is bad"

✅ **Strong:** "Current monolithic architecture causes deployment bottlenecks. Teams are blocked waiting for builds. Database schema changes require coordinating across 5 services. We need independent deployment capabilities."

### Generating Good Critique

The AI critique quality depends on decision clarity.

❌ **Weak:** "Use microservices"

✅ **Strong:** "Split e-commerce platform into independent services: Product Catalog (read-heavy), Shopping Cart (write-heavy), Order Processing (critical path), User Accounts (auth). Use event-driven communication via message queue."

### Iteration Workflow

1. **Phase 1**: Capture your initial thinking
2. **Phase 2**: Get critical feedback
3. **Phase 3**: Synthesize into final document
4. **Review**: Share with team, get real feedback
5. **Iterate**: Return to Phase 1, make adjustments

---

## Troubleshooting

### Can't Find My Project

- Scroll through project list
- Projects are sorted by update date (newest first)
- Try different search if implemented

### Form Not Saving

- Check browser console for errors (F12)
- Try refreshing page (Ctrl+R)
- Verify IndexedDB is enabled

### Export Not Working

- Check pop-up blocker settings
- Try exporting from different phase
- Ensure file download permissions enabled

### Dark Mode Not Working

- Refresh page
- Clear browser cache
- Check system dark mode setting (some browsers sync)

### Data Lost

Use browser DevTools to check IndexedDB:
1. Open DevTools (F12)
2. Go to Application → IndexedDB
3. Look for "adr-assistant" database
4. Verify projects are stored

---

## Advanced Usage

### Multiple ADRs per Decision

Create one ADR per architectural decision.

Related decisions can reference each other:
- Database choice
- API architecture
- Deployment strategy
- Technology stack choices

### Team Workflow

1. **Individual**: Create draft ADR (Phase 1)
2. **Team**: Share for feedback
3. **Individual**: Incorporate feedback (Phase 2)
4. **Team**: Review final ADR (Phase 3)
5. **Team**: Accept or iterate

### Integration with Git

Export ADR markdown → commit to Git

Workflow:
```bash
# Export from tool
# Download: ADR-Use-Microservices.md

# Add to repository
git add docs/adr/ADR-001-use-microservices.md
git commit -m "ADR-001: Use microservices architecture"
git push origin main
```

---

## Getting Help

**Questions?**
- Check this guide
- Read the [README](README.md)
- Open an issue on GitHub

**Found a bug?**
- Describe steps to reproduce
- Share browser and OS version
- Include error from DevTools console

**Have suggestions?**
- GitHub Discussions
- GitHub Issues labeled "enhancement"

---

## Related Resources

- [ADR standard documentation](https://github.com/joelparkerhenderson/architecture-decision-record)
- [Documenting Architecture Decisions](https://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard
- [MADR format](https://adr.github.io/madr/) - Alternative ADR format

---

**Last updated:** 2024-12-01
