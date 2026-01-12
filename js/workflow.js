/**
 * Workflow Module
 * Manages the 3-phase ADR creation workflow
 * @module workflow
 */

/**
 * Load prompt template from markdown file
 * @param {import('./types.js').PhaseNumber} phaseNumber - Phase number
 * @returns {Promise<string>} Template content
 */
async function loadPromptTemplate(phaseNumber) {
  try {
    const response = await fetch(`prompts/phase${phaseNumber}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt template for phase ${phaseNumber}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading prompt template:', error);
    return '';
  }
}

/**
 * Replace template variables in prompt
 * @param {string} template - Template string with {variable} placeholders
 * @param {Object.<string, string>} vars - Variable values
 * @returns {string} Template with variables replaced
 */
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value || '[Not provided]');
  }
  return result;
}

/**
 * @typedef {Object} PhaseMetadata
 * @property {string} title - Phase title
 * @property {string} description - Phase description
 * @property {string} ai - AI model name
 * @property {string} icon - Emoji icon
 * @property {string} color - Color theme
 */

/**
 * Get phase metadata for UI display
 * @param {import('./types.js').PhaseNumber} phase - Phase number
 * @returns {PhaseMetadata}
 */
export function getPhaseMetadata(phase) {
  const phases = {
    1: {
      title: 'Initial Draft',
      description: 'Generate the first draft of your ADR using Claude',
      ai: 'Claude',
      icon: '📝',
      color: 'blue'
    },
    2: {
      title: 'Alternative Perspective',
      description: 'Get a different perspective and improvements from Gemini',
      ai: 'Gemini',
      icon: '🔄',
      color: 'green'
    },
    3: {
      title: 'Final Synthesis',
      description: 'Combine the best elements into a polished final ADR',
      ai: 'Claude',
      icon: '✨',
      color: 'purple'
    }
  };

  return phases[phase] || phases[1];
}

/**
 * Generate prompt for a specific phase
 * @param {import('./types.js').Project} project - The project object
 * @param {import('./types.js').PhaseNumber} phaseNumber - The phase number (1, 2, or 3)
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePromptForPhase(project, phaseNumber) {
  const phase = phaseNumber || project.phase || 1;
  const template = await loadPromptTemplate(phase);

  // Helper to get phase response
  const getPhaseResponse = (phaseNum) => {
    if (project.phases && project.phases[phaseNum]) {
      return project.phases[phaseNum].response || '';
    }
    return '';
  };

  if (phase === 1) {
    // Phase 1: Initial Draft - use project fields
    const vars = {
      title: project.title || '',
      status: project.status || 'Proposed',
      context: project.context || ''
    };
    return replaceTemplateVars(template, vars);
  } else if (phase === 2) {
    // Phase 2: Gemini Review - include Phase 1 output
    const vars = {
      phase1Output: getPhaseResponse(1) || '[No Phase 1 output yet]'
    };
    return replaceTemplateVars(template, vars);
  } else if (phase === 3) {
    // Phase 3: Final Synthesis - include both Phase 1 and Phase 2 outputs
    const vars = {
      phase1Output: getPhaseResponse(1) || '[No Phase 1 output yet]',
      phase2Output: getPhaseResponse(2) || '[No Phase 2 output yet]'
    };
    return replaceTemplateVars(template, vars);
  }

  return template;
}

/**
 * Export final ADR document
 * @param {import('./types.js').Project} project - Project to export
 * @returns {void}
 */
export function exportFinalADR(project) {
  let content = '';

  if (project.phases && project.phases[3] && project.phases[3].response) {
    content = project.phases[3].response;
  } else if (project.phases && project.phases[1] && project.phases[1].response) {
    content = project.phases[1].response;
  } else {
    content = `# ${project.title || 'Untitled ADR'}\n\n**Status:** ${project.status || 'Proposed'}\n\n## Context\n\n${project.context || ''}`;
  }

  const filename = `${(project.title || 'adr').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-adr.md`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
