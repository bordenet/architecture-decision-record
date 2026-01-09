/**
 * Views Module
 * Handles view rendering for 3-phase ADR workflow
 *
 * Workflow Structure:
 * - Form Entry (pre-phase): Enter ADR details (title, context, etc.)
 * - Phase 1: Claude generates initial ADR draft
 * - Phase 2: Gemini reviews and critiques
 * - Phase 3: Claude synthesizes final version
 */

/**
 * Render phase tabs header - shared across all phase forms
 * @param {Object} project - Project object
 * @param {number} activePhase - Currently active phase (1, 2, or 3)
 * @returns {string} HTML for phase tabs
 */
function renderPhaseTabs(project, activePhase) {
  const phases = [
    { num: 1, icon: "📝", title: "Initial Draft", ai: "Claude" },
    { num: 2, icon: "🔄", title: "Review", ai: "Gemini" },
    { num: 3, icon: "✨", title: "Synthesize", ai: "Claude" }
  ];

  // Determine completion status for each phase
  const isPhase1Complete = !!project.phase1Response;
  const isPhase2Complete = !!project.phase2Review;
  const isPhase3Complete = !!project.finalADR;
  const completionStatus = [isPhase1Complete, isPhase2Complete, isPhase3Complete];

  return `
    <div class="mb-6 flex items-center justify-between">
      <button id="back-to-list-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
        Back to Projects
      </button>
      ${isPhase3Complete ? `
        <button id="export-adr-top-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          ✓ Export Final ADR
        </button>
      ` : ""}
    </div>

    <!-- Phase Progress Indicator (display-only) -->
    <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex space-x-1">
        ${phases.map(p => {
    const isActive = activePhase === p.num;
    const isCompleted = completionStatus[p.num - 1];

    return `
          <div
            class="px-6 py-3 font-medium ${
  isActive
    ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
    : "text-gray-600 dark:text-gray-400"
}"
          >
            <span class="mr-2">${p.icon}</span>
            Phase ${p.num}
            ${isCompleted ? "<span class=\"ml-2 text-green-500\">✓</span>" : ""}
          </div>
        `;
  }).join("")}
      </div>
    </div>
  `;
}

/**
 * Render the ADR form entry view (before phases)
 * This is where users enter ADR details before starting the 3-phase AI workflow
 */
function renderFormEntry(project) {
  return `
    <div class="form-entry space-y-6">
      <div class="mb-6 flex items-center justify-between">
        <button id="back-to-list-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Projects
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📋 ADR Details
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Enter your architectural decision details. These will be used to generate the ADR.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <!-- Title -->
          <div>
            <label for="title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span class="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="title-input"
              placeholder="e.g., Use microservices architecture for scalability"
              value="${project.title || ""}"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <!-- Status -->
          <div>
            <label for="status-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status <span class="text-red-600">*</span>
            </label>
            <select
              id="status-select"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Proposed" ${project.status === "Proposed" ? "selected" : ""}>Proposed</option>
              <option value="Accepted" ${project.status === "Accepted" ? "selected" : ""}>Accepted</option>
              <option value="Deprecated" ${project.status === "Deprecated" ? "selected" : ""}>Deprecated</option>
              <option value="Superseded" ${project.status === "Superseded" ? "selected" : ""}>Superseded</option>
            </select>
          </div>

          <!-- Context -->
          <div>
            <label for="context-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Context <span class="text-red-600">*</span>
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">What circumstances led to this decision?</p>
            <textarea
              id="context-textarea"
              rows="5"
              placeholder="Include background, constraints, current system state, and why the decision was necessary..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >${project.context || ""}</textarea>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <div class="flex gap-3">
            <button id="save-form-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
              Save
            </button>
            <button id="start-workflow-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Start AI Workflow →
            </button>
          </div>
          <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Phase 1 - Claude generates initial ADR draft
 */
function renderPhase1Form(project) {
  const hasPrompt = !!project.phase1Prompt;
  const hasResponse = !!(project.phase1Response && project.phase1Response.trim());

  return `
    <div class="phase-1-form space-y-6">
      ${renderPhaseTabs(project, 1)}

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            📝 Initial Draft
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Generate the first draft of your ADR using Claude
          </p>
          <div class="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm">
            <span class="mr-2">🤖</span>
            Use with Claude
          </div>
        </div>

        <!-- Step A: Copy Prompt -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step A: Copy Prompt to AI
          </h4>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex gap-3 flex-wrap">
              <button id="generate-phase1-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                📋 Copy Prompt to Clipboard
              </button>
              <a
                id="open-ai-phase1-btn"
                href="https://claude.ai"
                target="ai-assistant-tab"
                rel="noopener noreferrer"
                class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed pointer-events-none"}"
                ${hasPrompt ? "" : "aria-disabled=\"true\""}
              >
                🔗 Open Claude
              </a>
            </div>
            <button id="view-phase1-prompt-btn" class="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium ${hasPrompt ? "" : "opacity-50 cursor-not-allowed"}">
              👁 View Prompt
            </button>
          </div>
        </div>

        <!-- Step B: Paste Response -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step B: Paste Claude's Response
          </h4>
          <textarea
            id="phase1-response-textarea"
            rows="12"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste Claude's response here..."
          >${project.phase1Response || ""}</textarea>
          <div class="mt-3 flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ${hasResponse ? "✓ Phase completed" : "Paste response to complete this phase"}
            </span>
            <button id="save-phase1-btn" class="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
              Save Response
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <button id="edit-details-btn" class="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
            ← Edit Details
          </button>
          <div class="flex gap-3">
            <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete
            </button>
            ${hasResponse ? `
              <button id="next-phase2-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Next Phase →
              </button>
            ` : ""}
          </div>
        </div>
      </div>

      <!-- Prompt Modal -->
      <div id="phase1-prompt-modal" class="modal-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 1 Prompt</h3>
              <button id="close-phase1-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                ✕
              </button>
            </div>
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase1Prompt || "No prompt generated yet"}</pre>
            <div class="mt-4 flex justify-end">
              <button id="copy-phase1-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Phase 2 - Gemini reviews and critiques the ADR
 */
function renderPhase2Form(project) {
  const hasPrompt = !!project.phase2Prompt;
  const hasResponse = !!(project.phase2Review && project.phase2Review.trim());

  return `
    <div class="phase-2-form space-y-6">
      ${renderPhaseTabs(project, 2)}

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🔄 Alternative Perspective
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Get a different perspective and improvements from Gemini
          </p>
          <div class="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
            <span class="mr-2">🤖</span>
            Use with Gemini
          </div>
        </div>

        <!-- Step A: Copy Prompt -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step A: Copy Prompt to AI
          </h4>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex gap-3 flex-wrap">
              <button id="generate-phase2-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                📋 Copy Prompt to Clipboard
              </button>
              <a
                id="open-ai-phase2-btn"
                href="https://gemini.google.com"
                target="ai-assistant-tab"
                rel="noopener noreferrer"
                class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed pointer-events-none"}"
                ${hasPrompt ? "" : "aria-disabled=\"true\""}
              >
                🔗 Open Gemini
              </a>
            </div>
            <button id="view-phase2-prompt-btn" class="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium ${hasPrompt ? "" : "opacity-50 cursor-not-allowed"}">
              👁 View Prompt
            </button>
          </div>
        </div>

        <!-- Step B: Paste Response -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step B: Paste Gemini's Response
          </h4>
          <textarea
            id="phase2-response-textarea"
            rows="12"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste Gemini's response here..."
          >${project.phase2Review || ""}</textarea>
          <div class="mt-3 flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ${hasResponse ? "✓ Phase completed" : "Paste response to complete this phase"}
            </span>
            <button id="save-phase2-btn" class="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
              Save Response
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <button id="prev-phase1-btn" class="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
            ← Previous Phase
          </button>
          <div class="flex gap-3">
            <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete
            </button>
            ${hasResponse ? `
              <button id="next-phase3-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Next Phase →
              </button>
            ` : ""}
          </div>
        </div>
      </div>

      <!-- Prompt Modal -->
      <div id="phase2-prompt-modal" class="modal-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 2 Prompt</h3>
              <button id="close-phase2-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                ✕
              </button>
            </div>
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase2Prompt || "No prompt generated yet"}</pre>
            <div class="mt-4 flex justify-end">
              <button id="copy-phase2-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Phase 3 - Claude synthesizes final version from Phase 1 + Phase 2
 */
function renderPhase3Form(project) {
  const hasPrompt = !!project.phase3Prompt;
  const hasResponse = !!(project.finalADR && project.finalADR.trim());

  return `
    <div class="phase-3-form space-y-6">
      ${renderPhaseTabs(project, 3)}

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="mb-6">
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ✨ Synthesize
          </h3>
          <p class="text-gray-600 dark:text-gray-400 mb-2">
            Generate the final ADR with Claude
          </p>
          <div class="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-full text-sm">
            <span class="mr-2">🤖</span>
            Use with Claude
          </div>
        </div>

        <!-- Step A: Copy Prompt -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step A: Copy Prompt to AI
          </h4>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex gap-3 flex-wrap">
              <button id="generate-phase3-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                📋 Copy Prompt to Clipboard
              </button>
              <a
                id="open-ai-phase3-btn"
                href="https://claude.ai"
                target="ai-assistant-tab"
                rel="noopener noreferrer"
                class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${hasPrompt ? "hover:bg-green-700" : "opacity-50 cursor-not-allowed pointer-events-none"}"
                ${hasPrompt ? "" : "aria-disabled=\"true\""}
              >
                🔗 Open Claude
              </a>
            </div>
            <button id="view-phase3-prompt-btn" class="px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors font-medium ${hasPrompt ? "" : "opacity-50 cursor-not-allowed"}">
              👁 View Prompt
            </button>
          </div>
        </div>

        <!-- Step B: Paste Response -->
        <div class="mb-6">
          <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Step B: Paste Claude's Response
          </h4>
          <textarea
            id="phase3-response-textarea"
            rows="16"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste Claude's response here..."
          >${project.finalADR || ""}</textarea>
          <div class="mt-3 flex justify-between items-center">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              ${hasResponse ? "✓ Phase completed" : "Paste response to complete your ADR"}
            </span>
            <button id="save-phase3-btn" class="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
              Save Response
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <button id="prev-phase2-btn" class="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
            ← Previous Phase
          </button>
          <div class="flex gap-3">
            <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete
            </button>
            ${hasResponse ? `
              <button id="export-adr-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                ✓ Export as Markdown
              </button>
            ` : ""}
          </div>
        </div>
      </div>

      <!-- Prompt Modal -->
      <div id="phase3-prompt-modal" class="modal-overlay hidden fixed inset-0 bg-black bg-opacity-50 z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Phase 3 Prompt</h3>
              <button id="close-phase3-modal-btn" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                ✕
              </button>
            </div>
            <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">${project.phase3Prompt || "No prompt generated yet"}</pre>
            <div class="mt-4 flex justify-end">
              <button id="copy-phase3-prompt-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export { renderFormEntry, renderPhase1Form, renderPhase2Form, renderPhase3Form };
