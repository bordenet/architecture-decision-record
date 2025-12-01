import { renderPhase1Form, renderPhase2Form, renderPhase3Form } from "../js/views.js";

describe("Views Module", () => {
  const testProject = {
    title: "Test Project",
    status: "Proposed",
    context: "Test context",
    phase1Response: "Test Phase 1 ADR response",
    phase2Review: "Test Phase 2 review",
    finalADR: "Test final ADR"
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
    expect(result).toContain("phase2-response-textarea");
  });

  test("should render phase 3 form", () => {
    const result = renderPhase3Form(testProject);
    expect(result).toContain("Phase 3: Final Synthesis");
    expect(result).toContain("phase3-response-textarea");
  });
});
