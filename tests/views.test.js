import { renderPhase1Form, renderPhase2Form, renderPhase3Form } from "../js/views.js";

describe("Views Module", () => {
  const testProject = {
    id: "1",
    title: "Use Microservices",
    status: "Proposed",
    context: "System is monolithic and hard to scale",
    decision: "Split into microservices",
    consequences: "Increased complexity but better scalability",
    rationale: "Allows independent scaling",
    phase: 1,
    phase2Prompt: "",
    phase2Review: "",
    phase3Prompt: "",
    finalADR: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  test("should render phase 1 form with all ADR fields", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain("Phase 1: Create ADR");
    expect(result).toContain("title-input");
    expect(result).toContain("status-select");
    expect(result).toContain("context-textarea");
    expect(result).toContain("decision-textarea");
    expect(result).toContain("consequences-textarea");
    expect(result).toContain("rationale-textarea");
    expect(result).toContain("Next: Phase 2");
  });

  test("should render phase 2 form for Claude review", () => {
    const result = renderPhase2Form(testProject);
    expect(result).toContain("Phase 2: Review with Claude");
    expect(result).toContain("Copy Prompt to Clipboard");
    expect(result).toContain("phase2-response-textarea");
    expect(result).toContain("Next: Phase 3");
  });

  test("should render phase 3 form for synthesis", () => {
    const result = renderPhase3Form(testProject);
    expect(result).toContain("Phase 3: Final Synthesis");
    expect(result).toContain("Copy Prompt to Clipboard");
    expect(result).toContain("phase3-response-textarea");
    expect(result).toContain("Export as Markdown");
  });

  test("should populate form with project data", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain(testProject.title);
    expect(result).toContain(testProject.context);
    expect(result).toContain(testProject.decision);
  });

  test("should mark required fields in phase 1", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain("text-red-600");
  });
});
