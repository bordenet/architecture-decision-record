# ADR Template

This is the standard Architecture Decision Record template used by this application.

## Basic Structure

Every ADR should include these sections:

### Title
A clear, concise title describing the decision

### Status
- **Proposed**: Decision under consideration
- **Accepted**: Decision approved and adopted
- **Deprecated**: Previously accepted but no longer used
- **Superseded**: Replaced by another decision (reference the new ADR)

### Context
What circumstances led to this decision? Include:
- Background on the problem
- Constraints and requirements
- Current system state
- Why this decision was necessary

### Decision
What decision have you made? Should be:
- Specific and actionable
- Clear about what is being decided
- Implementation-focused
- Realistic given constraints

### Consequences
What follows from this decision? Include:
- **Positive**: Benefits and improvements
- **Negative**: Costs, trade-offs, and risks
- **Impact**: Effects on the system and team

### Rationale (Optional)
Why this decision over alternatives?
- Comparison with rejected options
- Technical justification
- Business alignment
- Risk mitigation strategy

---

## Example ADR

See the [Architecture Decision Record standard](https://github.com/joelparkerhenderson/architecture-decision-record) for comprehensive examples and guidance.

## Tips for Writing ADRs

1. **Be Specific**: Vague decisions don't help future developers
2. **Document Trade-offs**: Every decision has costs
3. **Include Context**: Future readers won't have your current knowledge
4. **Consider Alternatives**: Explain why you chose this path
5. **Make it Immutable**: Don't modify old ADRs, create new ones if status changes
6. **Review Together**: Have the team review before accepting

## Lifecycle

1. **Create**: Write the initial ADR as "Proposed"
2. **Review**: Team reviews and provides feedback
3. **Accept**: Once consensus is reached, mark as "Accepted"
4. **Implement**: Apply the decision in the codebase
5. **Monitor**: Revisit at 1 month to validate assumptions
6. **Retire**: When superseded, create new ADR with reference to old one
