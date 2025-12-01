import { synthesizeADR, exportAsMarkdown, exportAsJSON } from "../js/phase3-synthesis.js";
import { jest } from "@jest/globals";

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

  test("should export ADR as markdown", () => {
    // Mock DOM methods
    const mockCreateElement = jest.spyOn(document, "createElement");
    
    global.Blob = jest.fn((content, options) => ({
      type: options.type,
      size: content[0].length
    }));
    
    global.URL = {
      ...global.URL,
      createObjectURL: jest.fn(() => "blob:mock-url"),
      revokeObjectURL: jest.fn()
    };
    
    mockCreateElement.mockReturnValue({
      href: "",
      download: "",
      click: jest.fn()
    });
    
    const adr = "# Test ADR\nContent here";
    exportAsMarkdown(adr, "test.md");
    
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    
    mockCreateElement.mockRestore();
  });

  test("should export project as JSON", () => {
    // Mock DOM methods
    const mockCreateElement = jest.spyOn(document, "createElement");
    
    global.Blob = jest.fn((content, options) => ({
      type: options.type,
      size: content[0].length
    }));
    
    global.URL = {
      ...global.URL,
      createObjectURL: jest.fn(() => "blob:mock-url"),
      revokeObjectURL: jest.fn()
    };
    
    const mockAnchor = {
      href: "",
      download: "",
      click: jest.fn()
    };
    
    mockCreateElement.mockReturnValue(mockAnchor);
    
    exportAsJSON(testProject);
    
    expect(mockCreateElement).toHaveBeenCalledWith("a");
    expect(mockAnchor.download).toContain("Use Microservices Architecture");
    
    mockCreateElement.mockRestore();
  });

  test("should handle phase2Review in synthesis", () => {
    const projectWithReview = {
      title: "Test",
      phase2Review: "Team provided feedback"
    };
    
    const adr = synthesizeADR(projectWithReview);
    expect(adr).toContain("See adversarial review feedback");
  });

  test("should handle missing phase2Review", () => {
    const projectWithoutReview = {
      title: "Test"
    };
    
    const adr = synthesizeADR(projectWithoutReview);
    expect(adr).toContain("No alternatives documented");
  });
});
