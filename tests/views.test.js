const { renderPhase1, renderPhase2, renderPhase3 } = require("../js/views.js");

describe("Views Module", () => {
  const testProject = {
    context: "Test context",
    decision: "Test decision",
    rationale: "Test rationale"
  };

  test("should render phase 1", () => {
    const result = renderPhase1(testProject);
    expect(result).toContain("Phase 1: Initial Draft");
    expect(result).toContain("Test context");
  });

  test("should render phase 2", () => {
    const result = renderPhase2(testProject);
    expect(result).toContain("Phase 2: Review & Critique");
    expect(result).toContain("Test decision");
  });

  test("should render phase 3", () => {
    const result = renderPhase3(testProject);
    expect(result).toContain("Phase 3: Final Synthesis");
    expect(result).toContain("Test rationale");
  });
});
