import { getPhaseMetadata, generatePromptForPhase, exportFinalADR } from "../js/workflow.js";

describe("Workflow Module", () => {
  test("should export getPhaseMetadata function", () => {
    expect(getPhaseMetadata).toBeInstanceOf(Function);
  });

  test("should export generatePromptForPhase function", () => {
    expect(generatePromptForPhase).toBeInstanceOf(Function);
  });

  test("should export exportFinalADR function", () => {
    expect(exportFinalADR).toBeInstanceOf(Function);
  });

  test("getPhaseMetadata should return metadata for phase 1", () => {
    const metadata = getPhaseMetadata(1);
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe("Initial Draft");
    expect(metadata.ai).toBe("Claude");
  });

  test("getPhaseMetadata should return metadata for phase 2", () => {
    const metadata = getPhaseMetadata(2);
    expect(metadata.title).toBe("Alternative Perspective");
    expect(metadata.ai).toBe("Gemini");
  });

  test("getPhaseMetadata should return metadata for phase 3", () => {
    const metadata = getPhaseMetadata(3);
    expect(metadata.title).toBe("Final Synthesis");
    expect(metadata.ai).toBe("Claude");
  });
});
