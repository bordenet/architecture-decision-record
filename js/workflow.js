/**
 * Workflow Module
 * Manages the 3-phase ADR creation workflow
 */

const PHASES = {
  DRAFT: 1,
  REVIEW: 2,
  SYNTHESIS: 3
};

const PHASE_NAMES = {
  1: 'Initial Draft',
  2: 'Review & Critique',
  3: 'Final Synthesis'
};

const PHASE_DESCRIPTIONS = {
  1: 'Fill in your architectural decision details',
  2: 'Get feedback from external AI review',
  3: 'Synthesize into final polished ADR'
};

class Workflow {
  constructor(project) {
    this.project = project;
    this.currentPhase = project.phase || 1;
  }

  getCurrentPhase() {
    return this.currentPhase;
  }

  getCurrentPhaseName() {
    return PHASE_NAMES[this.currentPhase];
  }

  canAdvanceToNextPhase() {
    return this.currentPhase < 3;
  }

  advancePhase() {
    if (this.canAdvanceToNextPhase()) {
      this.currentPhase += 1;
      return true;
    }
    return false;
  }

  goToPhase(phaseNumber) {
    if (phaseNumber >= 1 && phaseNumber <= 3) {
      this.currentPhase = phaseNumber;
      return true;
    }
    return false;
  }
}

async function loadPrompt(phase) {
  try {
    const response = await fetch(`./prompts/phase${phase}.md`);
    if (!response.ok) throw new Error('Prompt not found');
    return await response.text();
  } catch (error) {
    console.error(`Failed to load phase ${phase} prompt:`, error);
    return `# Phase ${phase} Prompt\n\nPrompt loading failed.`;
  }
}

export { Workflow, PHASES, PHASE_NAMES, PHASE_DESCRIPTIONS, loadPrompt };
