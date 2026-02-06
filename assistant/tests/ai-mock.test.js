import { isMockMode, isLiveMode, generatePhase1Draft, generatePhase3Synthesis, AI_MODE } from "../js/ai-mock.js";

describe("AI Mock Module", () => {
  test("should be in mock mode by default", () => {
    expect(isMockMode()).toBe(true);
  });

  test("should not be in live mode by default", () => {
    expect(isLiveMode()).toBe(false);
  });

  test("AI_MODE should be exported", () => {
    expect(AI_MODE).toBe('mock');
  });

  test("should generate phase 1 draft", async () => {
    const result = await generatePhase1Draft("Test Title", "Test context");

    expect(result).toHaveProperty("decision");
    expect(result).toHaveProperty("consequences");
    expect(result).toHaveProperty("rationale");
    expect(result.decision).toContain("Test context");
  });

  test("should generate phase 3 synthesis", async () => {
    const phase1 = {
      decision: "Initial decision",
      consequences: "Initial consequences",
      rationale: "Initial rationale"
    };
    const phase2Feedback = "Expert feedback incorporated";

    const result = await generatePhase3Synthesis(phase1, phase2Feedback);

    expect(result).toHaveProperty("decision");
    expect(result).toHaveProperty("consequences");
    expect(result).toHaveProperty("rationale");
    expect(result.decision).toContain(phase1.decision);
    expect(result.decision).toContain(phase2Feedback);
    expect(result.consequences).toContain(phase1.consequences);
  });
});
