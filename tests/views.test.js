const { renderPhase1Form, renderPhase2Form, renderPhase3Form } = require("../js/views.js");

describe("Views Module", () => {
  const testProject = {
    title: "Test Project",
    status: "Proposed",
    context: "Test context",
    decision: "Test decision",
    consequences: "Test consequences",
    rationale: "Test rationale"
  };

  test("should render phase 1 form", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain("Phase 1: Initial Draft");
    expect(result).toContain("Test context");
    expect(result).toContain("title-input");
  });

  test("should render phase 2 form", () => {
    const result = renderPhase2Form(testProject);
    expect(result).toContain("Phase 2: Review & Critique");
    expect(result).toContain("review-textarea");
  });

  test("should render phase 3 form", () => {
    const result = renderPhase3Form(testProject);
    expect(result).toContain("Phase 3: Final Synthesis");
    expect(result).toContain("final-adr-textarea");
  });
});
