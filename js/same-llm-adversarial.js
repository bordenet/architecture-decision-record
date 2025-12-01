/**
 * Same-LLM Adversarial Module
 * Handles strategy when Phase 1 and Phase 2 use the same LLM
 */

function detectSameLLM(phase1Model, phase2Model) {
  const model1 = phase1Model.toLowerCase().split(/\s+/)[0];
  const model2 = phase2Model.toLowerCase().split(/\s+/)[0];
  return model1 === model2;
}

function getAdversarialStrategy(currentModel) {
  // Simulate different LLM personalities when same LLM is used
  const strategies = {
    "claude": "Gemini personality simulation - Focus on counterarguments and alternative perspectives",
    "gemini": "Claude personality simulation - Focus on comprehensive analysis and edge cases",
    "chatgpt": "Alternative model perspective - Focus on unconventional approaches"
  };

  const key = Object.keys(strategies).find(k => currentModel.toLowerCase().includes(k));
  return strategies[key] || "Generate critical feedback from a different perspective";
}

function applyAdversarialPrompt(basePrompt, model) {
  const strategy = getAdversarialStrategy(model);
  return `${basePrompt}\n\n[ADVERSARIAL MODE: ${strategy}]`;
}

const SAME_LLM_CONFIG = {
  detectSameLLM,
  getAdversarialStrategy,
  applyAdversarialPrompt,
  enabled: true
};

export {
  detectSameLLM,
  getAdversarialStrategy,
  applyAdversarialPrompt,
  SAME_LLM_CONFIG
};
