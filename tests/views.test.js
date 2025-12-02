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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  test("should render phase 1 form with all fields", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain("Architecture Decision Record");
    expect(result).toContain("title-input");
    expect(result).toContain("status-select");
    expect(result).toContain("context-textarea");
    expect(result).toContain("decision-textarea");
    expect(result).toContain("consequences-textarea");
    expect(result).toContain("rationale-textarea");
    expect(result).toContain("Export as Markdown");
  });

  test("should populate form with project data", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain(testProject.title);
    expect(result).toContain(testProject.context);
    expect(result).toContain(testProject.decision);
    expect(result).toContain(testProject.consequences);
  });

  test("should mark required fields", () => {
    const result = renderPhase1Form(testProject);
    expect(result).toContain("text-red-600");
  });

  test("should render phase 2 form", () => {
    const result = renderPhase2Form(testProject);
    expect(result).toContain("Not Used");
  });

  test("should render phase 3 form", () => {
    const result = renderPhase3Form(testProject);
    expect(result).toContain("Not Used");
  });
});
