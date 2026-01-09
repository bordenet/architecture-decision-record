import { renderFormEntry, renderPhase1Form, renderPhase2Form, renderPhase3Form } from "../js/views.js";

describe("Views Module", () => {
  const testProject = {
    id: "1",
    title: "Use Microservices",
    status: "Proposed",
    context: "System is monolithic and hard to scale",
    phase: 0,
    phase1Prompt: "",
    phase1Response: "",
    phase2Prompt: "",
    phase2Review: "",
    phase3Prompt: "",
    finalADR: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  test("should render form entry with title and context fields", () => {
    const result = renderFormEntry(testProject);
    expect(result).toContain("📋 ADR Details");
    expect(result).toContain("title-input");
    expect(result).toContain("status-select");
    expect(result).toContain("context-textarea");
    expect(result).toContain("Start AI Workflow →");
  });

  test("should render phase 1 form for Claude initial draft", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain("📝 Initial Draft");
    expect(result).toContain("Copy Prompt to Clipboard");
    expect(result).toContain("phase1-response-textarea");
    expect(result).toContain("← Edit Details");
  });

  test("should render phase 2 form for Gemini review", () => {
    const result = renderPhase2Form(testProject);
    expect(result).toContain("🔄 Alternative Perspective");
    expect(result).toContain("Copy Prompt to Clipboard");
    expect(result).toContain("phase2-response-textarea");
    expect(result).toContain("← Previous Phase");
  });

  test("should render phase 3 form for synthesis", () => {
    const projectWithResponse = { ...testProject, finalADR: "Final ADR content" };
    const result = renderPhase3Form(projectWithResponse);
    expect(result).toContain("✨ Synthesize");
    expect(result).toContain("Copy Prompt to Clipboard");
    expect(result).toContain("phase3-response-textarea");
    expect(result).toContain("Export as Markdown");
  });

  test("should populate form entry with project data", () => {
    const result = renderFormEntry(testProject);
    expect(result).toContain(testProject.title);
    expect(result).toContain(testProject.context);
  });

  test("should mark required fields in form entry", () => {
    const result = renderFormEntry(testProject);
    expect(result).toContain("text-red-600");
  });
});
