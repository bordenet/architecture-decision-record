const { detectSameLLM, getAdversarialStrategy } = require("../js/same-llm-adversarial.js");

describe("Same-LLM Adversarial Module", () => {
  test("should detect same Claude model", () => {
    const result = detectSameLLM("Claude 3.5 Sonnet", "Claude Sonnet");
    expect(result).toBe(true);
  });

  test("should detect same Gemini model", () => {
    const result = detectSameLLM("Gemini Pro", "Gemini 2.0");
    expect(result).toBe(true);
  });

  test("should detect different models", () => {
    const result = detectSameLLM("Claude", "Gemini");
    expect(result).toBe(false);
  });

  test("should provide strategy for Claude", () => {
    const strategy = getAdversarialStrategy("Claude Opus");
    expect(strategy).toContain("Gemini");
  });

  test("should provide strategy for Gemini", () => {
    const strategy = getAdversarialStrategy("Gemini 2.0");
    expect(strategy).toContain("Claude");
  });

  test("should provide default strategy for unknown model", () => {
    const strategy = getAdversarialStrategy("UnknownAI");
    expect(strategy).toBeDefined();
  });
});
