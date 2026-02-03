import { isMockMode, isLiveMode, generatePhase1Draft } from "../js/ai-mock.js";

describe("AI Mock Module", () => {
  test("should be in mock mode by default", () => {
    expect(isMockMode()).toBe(true);
  });

  test("should not be in live mode by default", () => {
    expect(isLiveMode()).toBe(false);
  });

  test("should generate phase 1 draft", async () => {
    const result = await generatePhase1Draft("Test Title", "Test context");

    expect(result).toHaveProperty("decision");
    expect(result).toHaveProperty("consequences");
    expect(result).toHaveProperty("rationale");
    expect(result.decision).toContain("Test context");
  });
});
