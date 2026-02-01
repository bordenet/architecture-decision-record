import { getPhaseMetadata, generatePromptForPhase, exportFinalADR, getFinalMarkdown, getExportFilename, WORKFLOW_CONFIG } from "../js/workflow.js";

// Mock fetch for loading prompt templates
global.fetch = jest.fn((url) => {
  const templates = {
    "prompts/phase1.md": "Phase 1 prompt template with {{TITLE}} and {{STATUS}} and {{CONTEXT}}",
    "prompts/phase2.md": "Phase 2 prompt template reviewing: {{PHASE1_OUTPUT}}",
    "prompts/phase3.md": "Phase 3 prompt template synthesizing: {{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}}"
  };

  return Promise.resolve({
    ok: true,
    text: () => Promise.resolve(templates[url] || "Default template")
  });
});

describe("Workflow Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("Module Exports", () => {
    test("should export getPhaseMetadata function", () => {
      expect(getPhaseMetadata).toBeInstanceOf(Function);
    });

    test("should export generatePromptForPhase function", () => {
      expect(generatePromptForPhase).toBeInstanceOf(Function);
    });

    test("should export exportFinalADR function", () => {
      expect(exportFinalADR).toBeInstanceOf(Function);
    });

    test("should export getFinalMarkdown function", () => {
      expect(getFinalMarkdown).toBeInstanceOf(Function);
    });

    test("should export getExportFilename function", () => {
      expect(getExportFilename).toBeInstanceOf(Function);
    });

    test("should export WORKFLOW_CONFIG", () => {
      expect(WORKFLOW_CONFIG).toBeDefined();
    });
  });

  describe("getPhaseMetadata", () => {
    test("should return correct metadata for phase 1", () => {
      const metadata = getPhaseMetadata(1);
      expect(metadata.title).toBe("Initial Draft");
      expect(metadata.ai).toBe("Claude");
      expect(metadata.icon).toBe("📝");
      expect(metadata.color).toBe("blue");
      expect(metadata.description).toBeTruthy();
    });

    test("should return correct metadata for phase 2", () => {
      const metadata = getPhaseMetadata(2);
      expect(metadata.title).toBe("Alternative Perspective");
      expect(metadata.ai).toBe("Gemini");
      expect(metadata.icon).toBe("🔄");
      expect(metadata.color).toBe("green");
      expect(metadata.description).toBeTruthy();
    });

    test("should return correct metadata for phase 3", () => {
      const metadata = getPhaseMetadata(3);
      expect(metadata.title).toBe("Final Synthesis");
      expect(metadata.ai).toBe("Claude");
      expect(metadata.icon).toBe("✨");
      expect(metadata.color).toBe("purple");
      expect(metadata.description).toBeTruthy();
    });

    test("should return phase 1 metadata for invalid phase number", () => {
      const metadata = getPhaseMetadata(999);
      expect(metadata.title).toBe("Initial Draft");
      expect(metadata.ai).toBe("Claude");
    });

    test("should return phase 1 metadata for undefined", () => {
      const metadata = getPhaseMetadata(undefined);
      expect(metadata.title).toBe("Initial Draft");
    });
  });

  describe("generatePromptForPhase", () => {
    test("should generate phase 1 prompt with project data", async () => {
      const project = {
        title: "My ADR Title",
        status: "Proposed",
        context: "This is the context for the decision",
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} }
      };

      const prompt = await generatePromptForPhase(project, 1);

      expect(prompt).toBeTruthy();
      expect(typeof prompt).toBe("string");
    });

    test("should generate phase 2 prompt using phase 1 response", async () => {
      const project = {
        title: "Test ADR",
        phase: 2,
        phases: {
          1: { prompt: "", response: "Phase 1 output content" },
          2: { prompt: "", response: "" },
          3: { prompt: "", response: "" }
        }
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toBeTruthy();
      expect(prompt).toContain("Phase 1 output content");
    });

    test("should generate phase 3 prompt using phase 1 and 2 responses", async () => {
      const project = {
        title: "Test ADR",
        phase: 3,
        phases: {
          1: { prompt: "", response: "Phase 1 content" },
          2: { prompt: "", response: "Phase 2 content" },
          3: { prompt: "", response: "" }
        }
      };

      const prompt = await generatePromptForPhase(project, 3);

      expect(prompt).toBeTruthy();
      expect(prompt).toContain("Phase 1 content");
      expect(prompt).toContain("Phase 2 content");
    });

    test("should handle missing phase 1 response gracefully", async () => {
      const project = {
        title: "Test ADR",
        phase: 2,
        phases: {
          1: { prompt: "", response: "" },
          2: { prompt: "", response: "" }
        }
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toContain("[No Phase 1 output yet]");
    });

    test("should handle missing phase responses in phase 3", async () => {
      const project = {
        title: "Test ADR",
        phase: 3,
        phases: {
          1: { prompt: "", response: "" },
          2: { prompt: "", response: "" },
          3: { prompt: "", response: "" }
        }
      };

      const prompt = await generatePromptForPhase(project, 3);

      expect(prompt).toContain("[No Phase 1 output yet]");
      expect(prompt).toContain("[No Phase 2 output yet]");
    });

    test("should fallback to project.phase when phaseNumber not provided", async () => {
      const project = {
        title: "Test ADR",
        phase: 1,
        phases: { 1: {}, 2: {}, 3: {} }
      };

      const prompt = await generatePromptForPhase(project);

      expect(prompt).toBeTruthy();
    });

    test("should handle array-style phases (legacy format)", async () => {
      const project = {
        title: "Legacy ADR",
        phase: 2,
        phases: [
          { response: "Phase 1 from array" },
          { response: "" },
          { response: "" }
        ]
      };

      const prompt = await generatePromptForPhase(project, 2);

      expect(prompt).toBeTruthy();
      expect(prompt).toContain("Phase 1 from array");
    });

    test("should return empty string for invalid phase", async () => {
      const project = {
        title: "Test",
        phase: 99,
        phases: {}
      };

      const prompt = await generatePromptForPhase(project, 99);

      expect(prompt).toBe("");
    });
  });

  describe("exportFinalADR", () => {
    let mockCreateElement;
    let createdAnchor;
    let originalCreateObjectURL;
    let originalRevokeObjectURL;

    beforeEach(() => {
      createdAnchor = { click: jest.fn(), href: "", download: "" };
      mockCreateElement = jest.spyOn(document, "createElement").mockReturnValue(createdAnchor);
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
      URL.createObjectURL = jest.fn().mockReturnValue("blob:test");
      URL.revokeObjectURL = jest.fn();
    });

    afterEach(() => {
      mockCreateElement.mockRestore();
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    test("should export phase 3 response when available", () => {
      const project = {
        title: "Test ADR",
        phases: {
          1: { response: "Phase 1 content" },
          2: { response: "Phase 2 content" },
          3: { response: "Final ADR content" }
        }
      };

      exportFinalADR(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(createdAnchor.click).toHaveBeenCalled();
    });

    test("should fallback to phase 1 response when phase 3 is empty", () => {
      const project = {
        title: "Test ADR",
        phases: {
          1: { response: "Phase 1 only" },
          2: { response: "" },
          3: { response: "" }
        }
      };

      exportFinalADR(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(createdAnchor.click).toHaveBeenCalled();
    });

    test("should generate fallback content when no responses exist", () => {
      const project = {
        title: "Fallback ADR",
        status: "Proposed",
        context: "Some context",
        phases: {}
      };

      exportFinalADR(project);

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    test("should sanitize filename", () => {
      const project = {
        title: "ADR With Special Ch@rs!",
        phases: { 3: { response: "Content" } }
      };

      exportFinalADR(project);

      expect(createdAnchor.download).toContain("adr-with-special-ch-rs-");
      expect(createdAnchor.download).toContain("-adr.md");
    });

    test("should use 'adr' as default filename for missing title", () => {
      const project = {
        phases: { 3: { response: "Content" } }
      };

      exportFinalADR(project);

      expect(createdAnchor.download).toBe("adr-adr.md");
    });
  });

  describe("getFinalMarkdown", () => {
    test("should return phase 3 response with attribution when available", () => {
      const project = {
        phases: {
          1: { response: "Phase 1" },
          3: { response: "Final content" }
        }
      };

      const markdown = getFinalMarkdown(project);

      expect(markdown).toContain("Final content");
      expect(markdown).toContain("Architecture Decision Record Assistant");
    });

    test("should fallback to phase 1 response when phase 3 is empty", () => {
      const project = {
        phases: {
          1: { response: "Phase 1 content" },
          3: { response: "" }
        }
      };

      const markdown = getFinalMarkdown(project);

      expect(markdown).toContain("Phase 1 content");
      expect(markdown).toContain("Architecture Decision Record Assistant");
    });

    test("should return null when no phases have responses", () => {
      const project = {
        phases: {
          1: { response: "" },
          3: { response: "" }
        }
      };

      const markdown = getFinalMarkdown(project);

      expect(markdown).toBeNull();
    });

    test("should return null when phases object is empty", () => {
      const project = { phases: {} };

      const markdown = getFinalMarkdown(project);

      expect(markdown).toBeNull();
    });
  });

  describe("getExportFilename", () => {
    test("should generate filename from title", () => {
      const project = { title: "My Decision" };

      const filename = getExportFilename(project);

      expect(filename).toBe("my-decision-adr.md");
    });

    test("should sanitize special characters", () => {
      const project = { title: "Decision: With Special Ch@rs!" };

      const filename = getExportFilename(project);

      expect(filename).toBe("decision--with-special-ch-rs--adr.md");
    });

    test("should use 'adr' as default for missing title", () => {
      const project = {};

      const filename = getExportFilename(project);

      expect(filename).toBe("adr-adr.md");
    });

    test("should handle empty title by using default", () => {
      const project = { title: "" };

      const filename = getExportFilename(project);

      // Empty string is falsy, so falls back to "adr" default
      expect(filename).toBe("adr-adr.md");
    });
  });
});
