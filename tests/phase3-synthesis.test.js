const { synthesizeADR, exportAsMarkdown, exportAsJSON } = require("../js/phase3-synthesis.js");

describe("Phase 3 Synthesis Module", () => {
  const testProject = {
    title: "Use Microservices Architecture",
    status: "Proposed",
    context: "Current monolithic architecture is difficult to scale",
    decision: "Switch to microservices architecture",
    consequences: "Team will need training\nDeployment complexity increases",
    rationale: "Microservices allow independent scaling and deployment",
    phase2Review: "Adversarial feedback..."
  };

  test("should synthesize ADR from project", () => {
    const adr = synthesizeADR(testProject);

    expect(adr).toContain("# ADR:");
    expect(adr).toContain("Use Microservices Architecture");
    expect(adr).toContain("Proposed");
    expect(adr).toContain("Current monolithic architecture");
    expect(adr).toContain("Status");
    expect(adr).toContain("Context and Problem Statement");
  });

  test("should include all required sections", () => {
    const adr = synthesizeADR(testProject);

    expect(adr).toContain("## Context and Problem Statement");
    expect(adr).toContain("## Decision");
    expect(adr).toContain("## Consequences");
    expect(adr).toContain("## Rationale");
    expect(adr).toContain("## Alternatives Considered");
    expect(adr).toContain("## Validation & Verification");
  });

  test("should handle missing fields", () => {
    const minimalProject = {
      title: "Test Decision",
      status: "Proposed"
    };

    const adr = synthesizeADR(minimalProject);

    expect(adr).toContain("Test Decision");
    expect(adr).toContain("Proposed");
    expect(adr).toContain("[Context not provided]");
  });

  test("should export functions be callable", () => {
    expect(typeof exportAsMarkdown).toBe("function");
    expect(typeof exportAsJSON).toBe("function");
  });
});
