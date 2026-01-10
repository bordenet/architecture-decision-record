/**
 * AI Mock Module
 * Provides mock AI responses for testing and demo
 */

// Safely access process.env in both browser and Node.js environments
const getAIMode = () => {
  // In Node.js (Jest/Node): process.env is available
  if (typeof process !== 'undefined' && process.env && process.env.AI_MODE) {
    return process.env.AI_MODE;
  }
  // In browser: process is undefined, default to "mock"
  return 'mock';
};

const AI_MODE = getAIMode();

async function generatePhase1Draft(title, context) {
  return {
    decision: `Based on the context provided, we recommend the following architectural approach:\n\n${context}`,
    consequences: 'This decision will require team coordination and thorough documentation.',
    rationale: 'This approach balances the identified concerns while maintaining system scalability and maintainability.'
  };
}

async function generatePhase3Synthesis(phase1, phase2Feedback) {
  return {
    decision: `${phase1.decision}\n\nIncorporating feedback: ${phase2Feedback}`,
    consequences: `${phase1.consequences}\n\nAdditional considerations from review have been incorporated.`,
    rationale: 'This final version synthesizes the initial approach with expert feedback for optimal outcomes.'
  };
}

function isMockMode() {
  return AI_MODE === 'mock';
}

function isLiveMode() {
  return AI_MODE === 'live';
}

export {
  AI_MODE,
  generatePhase1Draft,
  generatePhase3Synthesis,
  isMockMode,
  isLiveMode
};
