(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // js/ui.js
  var require_ui = __commonJS({
    "js/ui.js"(exports, module) {
      function initializeTheme() {
        const isDark = localStorage.getItem("darkMode") === "true";
        if (isDark) {
          document.documentElement.classList.add("dark");
        }
      }
      function showToast(message, type = "info") {
        console.log(`Toast [${type}]: ${message}`);
      }
      function toggleTheme() {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("darkMode", isDark);
      }
      function setupThemeToggle() {
        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
          themeToggle.addEventListener("click", toggleTheme);
        }
      }
      module.exports = { initializeTheme, showToast, toggleTheme, setupThemeToggle };
    }
  });

  // js/storage.js
  var require_storage = __commonJS({
    "js/storage.js"(exports, module) {
      var DB_NAME = "adr-assistant";
      var DB_VERSION = 1;
      var STORE_NAME = "projects";
      var Storage = class {
        constructor() {
          this.db = null;
        }
        /**
         * Initialize the database
         */
        async init() {
          return new Promise((resolve, reject) => {
            try {
              const request = indexedDB.open(DB_NAME, DB_VERSION);
              request.onerror = () => {
                console.error("IndexedDB open error:", request.error);
                reject(request.error);
              };
              request.onsuccess = () => {
                this.db = request.result;
                console.log("IndexedDB initialized successfully");
                resolve();
              };
              request.onupgradeneeded = (event) => {
                console.log("IndexedDB upgrade needed");
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                  const projectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                  projectStore.createIndex("updatedAt", "updatedAt", { unique: false });
                  projectStore.createIndex("title", "title", { unique: false });
                }
                if (!db.objectStoreNames.contains("prompts")) {
                  db.createObjectStore("prompts", { keyPath: "phase" });
                }
                if (!db.objectStoreNames.contains("settings")) {
                  db.createObjectStore("settings", { keyPath: "key" });
                }
              };
            } catch (error) {
              console.error("IndexedDB init error:", error);
              reject(error);
            }
          });
        }
        /**
         * Save a project
         */
        async saveProject(project) {
          if (!this.db) await this.init();
          return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put({
              ...project,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });
        }
        /**
         * Get all projects
         */
        async getAllProjects() {
          if (!this.db) await this.init();
          return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });
        }
        /**
         * Get project by ID
         */
        async getProject(id) {
          if (!this.db) await this.init();
          return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });
        }
        /**
         * Delete project
         */
        async deleteProject(id) {
          if (!this.db) await this.init();
          return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
          });
        }
        /**
         * Get storage size
         */
        async getStorageSize() {
          if (!navigator.storage || !navigator.storage.estimate) {
            return { usage: 0, quota: 0 };
          }
          return navigator.storage.estimate();
        }
      };
      var storage = new Storage();
      module.exports = { storage };
    }
  });

  // js/ai-mock.js
  var require_ai_mock = __commonJS({
    "js/ai-mock.js"(exports, module) {
      var AI_MODE = process.env.AI_MODE || "mock";
      async function generatePhase1Draft(title, context) {
        return {
          decision: `Based on the context provided, we recommend the following architectural approach:

${context}`,
          consequences: "This decision will require team coordination and thorough documentation.",
          rationale: "This approach balances the identified concerns while maintaining system scalability and maintainability."
        };
      }
      async function generatePhase3Synthesis(phase1, phase2Feedback) {
        return {
          decision: `${phase1.decision}

Incorporating feedback: ${phase2Feedback}`,
          consequences: `${phase1.consequences}

Additional considerations from review have been incorporated.`,
          rationale: "This final version synthesizes the initial approach with expert feedback for optimal outcomes."
        };
      }
      function isMockMode() {
        return AI_MODE === "mock";
      }
      function isLiveMode() {
        return AI_MODE === "live";
      }
      module.exports = {
        AI_MODE,
        generatePhase1Draft,
        generatePhase3Synthesis,
        isMockMode,
        isLiveMode
      };
    }
  });

  // js/same-llm-adversarial.js
  var require_same_llm_adversarial = __commonJS({
    "js/same-llm-adversarial.js"(exports, module) {
      function detectSameLLM(phase1Model, phase2Model) {
        const model1 = phase1Model.toLowerCase().split(/\s+/)[0];
        const model2 = phase2Model.toLowerCase().split(/\s+/)[0];
        return model1 === model2;
      }
      function getAdversarialStrategy(currentModel) {
        const strategies = {
          "claude": "Gemini personality simulation - Focus on counterarguments and alternative perspectives",
          "gemini": "Claude personality simulation - Focus on comprehensive analysis and edge cases",
          "chatgpt": "Alternative model perspective - Focus on unconventional approaches"
        };
        const key = Object.keys(strategies).find((k) => currentModel.toLowerCase().includes(k));
        return strategies[key] || "Generate critical feedback from a different perspective";
      }
      function applyAdversarialPrompt(basePrompt, model) {
        const strategy = getAdversarialStrategy(model);
        return `${basePrompt}

[ADVERSARIAL MODE: ${strategy}]`;
      }
      var SAME_LLM_CONFIG = {
        detectSameLLM,
        getAdversarialStrategy,
        applyAdversarialPrompt,
        enabled: true
      };
      module.exports = {
        detectSameLLM,
        getAdversarialStrategy,
        applyAdversarialPrompt,
        SAME_LLM_CONFIG
      };
    }
  });

  // js/phase2-review.js
  var require_phase2_review = __commonJS({
    "js/phase2-review.js"(exports, module) {
      var { getAdversarialStrategy } = require_same_llm_adversarial();
      async function generatePhase2Review(title, context, decision, currentModel = "Claude") {
        const strategy = getAdversarialStrategy(currentModel);
        const critiques = [
          "Critical analysis: What are the hidden assumptions in this decision?",
          "Risk assessment: What could go wrong with this approach?",
          "Alternative evaluation: Have all alternatives been properly explored?",
          "Scalability concerns: How will this decision impact future growth?",
          "Team impact: What are the implications for team structure and processes?",
          "Cost-benefit analysis: Is the value truly proportional to the effort required?"
        ];
        const review = `
[ADVERSARIAL CRITIQUE - ${strategy}]

Decision Being Reviewed: "${title}"

Context: ${context}

Proposed Decision: ${decision}

CRITICAL FEEDBACK:

${critiques.map((c, i) => `${i + 1}. ${c}`).join("\n")}

KEY CONCERNS:

1. Incomplete Information: The decision may not account for [TBD] constraints.

2. Implementation Risk: Executing this decision will require [TBD] resources and expertise.

3. Alternative Approaches: Consider exploring these alternatives:
   - Option A: Different architecture approach
   - Option B: Phased implementation strategy
   - Option C: Hybrid solution combining benefits

4. Success Criteria: Success metrics should include:
   - Performance targets
   - Team adoption metrics
   - Risk mitigation milestones

RECOMMENDATION:

Before proceeding, address the following:
- [ ] Document all assumptions and constraints
- [ ] Create a detailed implementation plan
- [ ] Identify rollback/mitigation strategies
- [ ] Get stakeholder sign-off on trade-offs

This adversarial review intentionally highlights potential weaknesses to ensure robust decision-making.
  `.trim();
        return review;
      }
      module.exports = { generatePhase2Review };
    }
  });

  // js/phase3-synthesis.js
  var require_phase3_synthesis = __commonJS({
    "js/phase3-synthesis.js"(exports, module) {
      var ADR_TEMPLATE = `# ADR: {{TITLE}}

## Status
{{STATUS}}

## Context and Problem Statement

{{CONTEXT}}

## Decision

{{DECISION}}

## Consequences

### Positive Consequences
- {{CONSEQUENCE_1}}
- {{CONSEQUENCE_2}}

### Negative Consequences
- {{RISK_1}}
- {{RISK_2}}

## Rationale

{{RATIONALE}}

## Alternatives Considered

As discussed in the adversarial review phase, the following alternatives were considered:

{{ALTERNATIVES}}

## Validation & Verification

- [ ] Team alignment confirmed
- [ ] Technical feasibility validated
- [ ] Risk mitigation strategy approved
- [ ] Success metrics defined

## Related Decisions

- Related ADR 1: (link)
- Related ADR 2: (link)

## References

- Reference document 1
- Reference document 2

---
*Last Updated: {{DATE}}*
`;
      function synthesizeADR(project) {
        let adr = ADR_TEMPLATE;
        adr = adr.replace("{{TITLE}}", project.title || "Architecture Decision");
        adr = adr.replace("{{STATUS}}", project.status || "Proposed");
        adr = adr.replace("{{CONTEXT}}", project.context || "[Context not provided]");
        adr = adr.replace("{{DECISION}}", project.decision || "[Decision not provided]");
        adr = adr.replace("{{CONSEQUENCE_1}}", project.consequences?.split("\n")[0] || "TBD");
        adr = adr.replace("{{CONSEQUENCE_2}}", project.consequences?.split("\n")[1] || "TBD");
        adr = adr.replace("{{RISK_1}}", "Requires careful implementation");
        adr = adr.replace("{{RISK_2}}", "May require team training");
        adr = adr.replace("{{RATIONALE}}", project.rationale || "[Rationale not provided]");
        adr = adr.replace(
          "{{ALTERNATIVES}}",
          project.phase2Review ? "See adversarial review feedback for detailed alternative analysis" : "No alternatives documented"
        );
        adr = adr.replace("{{DATE}}", (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
        return adr;
      }
      function exportAsMarkdown(adr, filename = "adr.md") {
        const blob = new Blob([adr], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
      function exportAsJSON(project) {
        const data = {
          title: project.title,
          status: project.status,
          context: project.context,
          decision: project.decision,
          consequences: project.consequences,
          rationale: project.rationale,
          phase2Review: project.phase2Review,
          finalADR: project.finalADR,
          exportDate: (/* @__PURE__ */ new Date()).toISOString()
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.title || "adr"}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      module.exports = { synthesizeADR, exportAsMarkdown, exportAsJSON };
    }
  });

  // js/views.js
  var require_views = __commonJS({
    "js/views.js"(exports, module) {
      function renderPhase1Form(project) {
        return `
    <div class="phase-1-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 1: Initial Draft</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in your architectural decision details
          </p>
        </div>
        <button id="back-to-list-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          \u2190 Back
        </button>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <!-- Title -->
        <div>
          <label for="title-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ADR Title
          </label>
          <input 
            type="text" 
            id="title-input" 
            placeholder="e.g., Use microservices architecture"
            value="${project.title || ""}"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>

        <!-- Status -->
        <div>
          <label for="status-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
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
            Context & Problem Statement
          </label>
          <textarea 
            id="context-textarea"
            rows="6"
            placeholder="Describe the issue or problem this decision addresses..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.context || ""}</textarea>
        </div>

        <!-- Decision -->
        <div>
          <label for="decision-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Decision (Optional - AI can help generate this)
          </label>
          <textarea 
            id="decision-textarea"
            rows="6"
            placeholder="Describe the decision made or leave blank for AI to generate..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.decision || ""}</textarea>
        </div>

        <!-- Consequences -->
        <div>
          <label for="consequences-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consequences (Optional - AI can help generate this)
          </label>
          <textarea 
            id="consequences-textarea"
            rows="4"
            placeholder="What are the consequences of this decision?..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.consequences || ""}</textarea>
        </div>

        <!-- Rationale -->
        <div>
          <label for="rationale-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rationale (Optional - AI can help generate this)
          </label>
          <textarea 
            id="rationale-textarea"
            rows="4"
            placeholder="Why is this the best decision?..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          >${project.rationale || ""}</textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-x-3">
          <button id="save-phase1-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save
          </button>
          <button id="generate-ai-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            \u2728 Generate with AI
          </button>
          <button id="next-phase-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            \u2192 Phase 2
          </button>
        </div>
        <button id="delete-project-btn" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          Delete
        </button>
      </div>
    </div>
  `;
      }
      function renderPhase2Form(project) {
        return `
    <div class="phase-2-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 2: Review & Critique</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Get adversarial feedback from external AI review
          </p>
        </div>
        <button id="back-to-phase1-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          \u2190 Back
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Original Decision -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Decision</h3>
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <p class="text-gray-900 dark:text-white font-medium">${project.title || "Untitled"}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Context</label>
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${project.context || "No context"}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Decision</label>
              <p class="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${project.decision || "No decision"}</p>
            </div>
          </div>
        </div>

        <!-- Adversarial Review -->
        <div class="lg:col-span-1">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Adversarial Critique</h3>
          <div>
            <label for="review-textarea" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Critical Feedback
            </label>
            <textarea 
              id="review-textarea"
              rows="12"
              placeholder="Generate adversarial feedback..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            >${project.phase2Review || ""}</textarea>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-x-3">
          <button id="save-phase2-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save & Continue
          </button>
          <button id="generate-review-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            \u2728 Generate Critique
          </button>
        </div>
        <button id="skip-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Skip to Phase 3
        </button>
      </div>
    </div>
  `;
      }
      function renderPhase3Form(project) {
        return `
    <div class="phase-3-form space-y-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Phase 3: Final Synthesis</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Synthesize your decision with expert feedback
          </p>
        </div>
        <button id="back-to-phase2-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          \u2190 Back
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column: Original and Feedback -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Original Decision -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Your Original Decision</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">${project.decision || "No decision"}</p>
          </div>

          <!-- Adversarial Feedback -->
          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <h3 class="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">Adversarial Feedback</h3>
            <p class="text-sm text-yellow-800 dark:text-yellow-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
              ${project.phase2Review || "No feedback yet"}
            </p>
          </div>
        </div>

        <!-- Right Column: Final ADR -->
        <div class="lg:col-span-1">
          <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Final ADR Document</h3>
          <textarea 
            id="final-adr-textarea"
            rows="20"
            placeholder="Final synthesized ADR will appear here..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          >${project.finalADR || ""}</textarea>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div class="space-x-3">
          <button id="synthesize-btn" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            \u2728 Synthesize & Generate
          </button>
          <button id="export-adr-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            \u{1F4E5} Export ADR
          </button>
        </div>
        <button id="save-phase3-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save
        </button>
      </div>
    </div>
  `;
      }
      module.exports = { renderPhase1Form, renderPhase2Form, renderPhase3Form };
    }
  });

  // js/app.js
  var require_app = __commonJS({
    "js/app.js"(exports, module) {
      var { initializeTheme, showToast, setupThemeToggle } = require_ui();
      var { storage } = require_storage();
      var { generatePhase1Draft } = require_ai_mock();
      var { generatePhase2Review } = require_phase2_review();
      var { synthesizeADR, exportAsMarkdown } = require_phase3_synthesis();
      var { renderPhase1Form, renderPhase2Form, renderPhase3Form } = require_views();
      var App = class {
        constructor() {
          this.currentProject = null;
          this.projects = [];
          this.isEditingProject = false;
        }
        async init() {
          try {
            console.log("App initialization started");
            initializeTheme();
            setupThemeToggle();
            console.log("Theme initialized");
            await this.loadProjects();
            console.log("Projects loaded:", this.projects.length);
            this.setupEventListeners();
            console.log("Event listeners set up");
            await this.renderProjectList();
            console.log("Project list rendered");
            showToast("Application loaded successfully", "success");
          } catch (error) {
            console.error("App initialization error:", error);
            showToast("Failed to initialize application", "error");
          }
        }
        async loadProjects() {
          try {
            this.projects = await storage.getAllProjects();
          } catch (error) {
            console.error("Failed to load projects:", error);
            showToast("Failed to load projects", "error");
          }
        }
        setupEventListeners() {
          const exportBtn = document.getElementById("export-all-btn");
          if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportAll());
          }
          const importBtn = document.getElementById("import-btn");
          if (importBtn) {
            importBtn.addEventListener("click", () => {
              document.getElementById("import-file-input").click();
            });
          }
          const fileInput = document.getElementById("import-file-input");
          if (fileInput) {
            fileInput.addEventListener("change", (e) => this.importFile(e));
          }
          const relatedBtn = document.getElementById("related-projects-btn");
          const relatedMenu = document.getElementById("related-projects-menu");
          if (relatedBtn && relatedMenu) {
            relatedBtn.addEventListener("click", () => {
              relatedMenu.classList.toggle("hidden");
            });
            document.addEventListener("click", (e) => {
              if (!relatedBtn.contains(e.target) && !relatedMenu.contains(e.target)) {
                relatedMenu.classList.add("hidden");
              }
            });
          }
          const closeBtn = document.getElementById("close-privacy-notice");
          const notice = document.getElementById("privacy-notice");
          if (closeBtn && notice) {
            closeBtn.addEventListener("click", () => {
              notice.classList.add("hidden");
              localStorage.setItem("hiddenPrivacyNotice", "true");
            });
            if (localStorage.getItem("hiddenPrivacyNotice")) {
              notice.classList.add("hidden");
            }
          }
        }
        async renderProjectList() {
          const container = document.getElementById("app-container");
          if (this.projects.length === 0) {
            container.innerHTML = `
        <div class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400 mb-6">No projects yet</p>
          <button id="create-first-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Create Your First Project
          </button>
        </div>
      `;
            const createBtn = document.getElementById("create-first-btn");
            if (createBtn) {
              createBtn.addEventListener("click", () => this.createNewProject());
            }
          } else {
            container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${this.projects.map((p) => `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
                 onclick="app.openProject('${p.id}')">
              <h3 class="font-bold text-lg text-gray-900 dark:text-white truncate">${p.title || "Untitled"}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">${p.context || "No context"}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
                Updated: ${new Date(p.updatedAt).toLocaleDateString()}
              </p>
            </div>
          `).join("")}
        </div>
        <button id="new-project-btn" class="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
          + New Project
        </button>
      `;
            const newBtn = document.getElementById("new-project-btn");
            if (newBtn) {
              newBtn.addEventListener("click", () => this.createNewProject());
            }
          }
          const estimate = await storage.getStorageSize();
          const used = (estimate.usage / (1024 * 1024)).toFixed(2);
          const total = (estimate.quota / (1024 * 1024)).toFixed(2);
          const storageInfo = document.getElementById("storage-info");
          if (storageInfo) {
            storageInfo.textContent = `${this.projects.length} projects \u2022 ${used}MB used of ${total}MB`;
          }
        }
        async createNewProject() {
          const project = {
            id: Date.now().toString(),
            title: "",
            status: "Proposed",
            context: "",
            decision: "",
            consequences: "",
            rationale: "",
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
            phase: 1
          };
          await storage.saveProject(project);
          await this.loadProjects();
          await this.renderProjectList();
          this.openProject(project.id);
        }
        async openProject(id) {
          this.currentProject = await storage.getProject(id);
          if (this.currentProject) {
            this.isEditingProject = true;
            await this.renderPhase1Form();
          }
        }
        async renderPhase1Form() {
          const container = document.getElementById("app-container");
          container.innerHTML = renderPhase1Form(this.currentProject);
          this.setupPhase1Handlers();
        }
        setupPhase1Handlers() {
          const backBtn = document.getElementById("back-to-list-btn");
          if (backBtn) {
            backBtn.addEventListener("click", () => {
              this.isEditingProject = false;
              this.renderProjectList();
            });
          }
          const saveBtn = document.getElementById("save-phase1-btn");
          if (saveBtn) {
            saveBtn.addEventListener("click", () => this.savePhase1Data());
          }
          const generateBtn = document.getElementById("generate-ai-btn");
          if (generateBtn) {
            generateBtn.addEventListener("click", () => this.generatePhase1AI());
          }
          const deleteBtn = document.getElementById("delete-project-btn");
          if (deleteBtn) {
            deleteBtn.addEventListener("click", () => this.deleteCurrentProject());
          }
          const nextPhaseBtn = document.getElementById("next-phase-btn");
          if (nextPhaseBtn) {
            nextPhaseBtn.addEventListener("click", () => this.advanceToPhase2());
          }
        }
        async advanceToPhase2() {
          const title = document.getElementById("title-input").value.trim();
          const context = document.getElementById("context-textarea").value.trim();
          if (!title || !context) {
            showToast("Please fill in Title and Context first", "error");
            return;
          }
          await this.savePhase1Data();
          this.currentProject.phase = 2;
          await storage.saveProject(this.currentProject);
          this.renderPhase2Form();
        }
        async savePhase1Data() {
          const title = document.getElementById("title-input").value.trim();
          const context = document.getElementById("context-textarea").value.trim();
          const decision = document.getElementById("decision-textarea").value.trim();
          const consequences = document.getElementById("consequences-textarea").value.trim();
          const rationale = document.getElementById("rationale-textarea").value.trim();
          const status = document.getElementById("status-select").value;
          if (!title || !context) {
            showToast("Title and Context are required", "error");
            return;
          }
          const updatedProject = {
            ...this.currentProject,
            title,
            context,
            decision,
            consequences,
            rationale,
            status,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          try {
            await storage.saveProject(updatedProject);
            this.currentProject = updatedProject;
            showToast("Project saved successfully", "success");
          } catch (error) {
            console.error("Save failed:", error);
            showToast("Failed to save project", "error");
          }
        }
        async generatePhase1AI() {
          const title = document.getElementById("title-input").value.trim();
          const context = document.getElementById("context-textarea").value.trim();
          if (!title || !context) {
            showToast("Please fill in Title and Context first", "error");
            return;
          }
          try {
            showToast("Generating with AI...", "info");
            const aiResult = await generatePhase1Draft(title, context);
            document.getElementById("decision-textarea").value = aiResult.decision;
            document.getElementById("consequences-textarea").value = aiResult.consequences;
            document.getElementById("rationale-textarea").value = aiResult.rationale;
            showToast("AI draft generated successfully", "success");
          } catch (error) {
            console.error("AI generation failed:", error);
            showToast("Failed to generate AI draft", "error");
          }
        }
        async renderPhase2Form() {
          const container = document.getElementById("app-container");
          container.innerHTML = renderPhase2Form(this.currentProject);
          this.setupPhase2Handlers();
        }
        setupPhase2Handlers() {
          const backBtn = document.getElementById("back-to-phase1-btn");
          if (backBtn) {
            backBtn.addEventListener("click", () => {
              this.currentProject.phase = 1;
              this.renderPhase1Form();
            });
          }
          const saveBtn = document.getElementById("save-phase2-btn");
          if (saveBtn) {
            saveBtn.addEventListener("click", () => this.savePhase2Data());
          }
          const generateBtn = document.getElementById("generate-review-btn");
          if (generateBtn) {
            generateBtn.addEventListener("click", () => this.generatePhase2Review());
          }
          const skipBtn = document.getElementById("skip-phase2-btn");
          if (skipBtn) {
            skipBtn.addEventListener("click", () => {
              this.currentProject.phase = 3;
              this.savePhase2Data();
            });
          }
        }
        async generatePhase2Review() {
          try {
            showToast("Generating adversarial critique...", "info");
            const review = await generatePhase2Review(
              this.currentProject.title,
              this.currentProject.context,
              this.currentProject.decision
            );
            document.getElementById("review-textarea").value = review;
            showToast("Critique generated successfully", "success");
          } catch (error) {
            console.error("Review generation failed:", error);
            showToast("Failed to generate critique", "error");
          }
        }
        async savePhase2Data() {
          const review = document.getElementById("review-textarea").value.trim();
          const updatedProject = {
            ...this.currentProject,
            phase2Review: review,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          try {
            await storage.saveProject(updatedProject);
            this.currentProject = updatedProject;
            showToast("Phase 2 saved", "success");
            if (this.currentProject.phase === 3) {
              this.renderPhase3Form();
            }
          } catch (error) {
            console.error("Save failed:", error);
            showToast("Failed to save", "error");
          }
        }
        async renderPhase3Form() {
          const container = document.getElementById("app-container");
          container.innerHTML = renderPhase3Form(this.currentProject);
          this.setupPhase3Handlers();
        }
        setupPhase3Handlers() {
          const backBtn = document.getElementById("back-to-phase2-btn");
          if (backBtn) {
            backBtn.addEventListener("click", () => {
              this.currentProject.phase = 2;
              this.renderPhase2Form();
            });
          }
          const synthesizeBtn = document.getElementById("synthesize-btn");
          if (synthesizeBtn) {
            synthesizeBtn.addEventListener("click", () => this.synthesizeADR());
          }
          const exportBtn = document.getElementById("export-adr-btn");
          if (exportBtn) {
            exportBtn.addEventListener("click", () => this.exportADR());
          }
          const saveBtn = document.getElementById("save-phase3-btn");
          if (saveBtn) {
            saveBtn.addEventListener("click", () => this.savePhase3Data());
          }
        }
        async synthesizeADR() {
          try {
            showToast("Synthesizing final ADR...", "info");
            const finalADR = synthesizeADR(this.currentProject);
            document.getElementById("final-adr-textarea").value = finalADR;
            this.currentProject.finalADR = finalADR;
            showToast("ADR synthesized successfully", "success");
          } catch (error) {
            console.error("Synthesis failed:", error);
            showToast("Failed to synthesize ADR", "error");
          }
        }
        async exportADR() {
          const adrContent = document.getElementById("final-adr-textarea").value.trim();
          if (!adrContent) {
            showToast("Please synthesize the ADR first", "error");
            return;
          }
          try {
            const filename = `ADR-${this.currentProject.title.replace(/\s+/g, "-")}.md`;
            exportAsMarkdown(adrContent, filename);
            showToast("ADR exported as Markdown", "success");
          } catch (error) {
            console.error("Export failed:", error);
            showToast("Failed to export ADR", "error");
          }
        }
        async savePhase3Data() {
          const finalADR = document.getElementById("final-adr-textarea").value.trim();
          const updatedProject = {
            ...this.currentProject,
            finalADR,
            phase: 3,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          try {
            await storage.saveProject(updatedProject);
            this.currentProject = updatedProject;
            showToast("Final ADR saved successfully", "success");
          } catch (error) {
            console.error("Save failed:", error);
            showToast("Failed to save ADR", "error");
          }
        }
        async deleteCurrentProject() {
          if (!window.confirm("Are you sure you want to delete this project?")) {
            return;
          }
          try {
            await storage.deleteProject(this.currentProject.id);
            showToast("Project deleted", "success");
            await this.loadProjects();
            await this.renderProjectList();
          } catch (error) {
            console.error("Delete failed:", error);
            showToast("Failed to delete project", "error");
          }
        }
        async exportAll() {
          const data = {
            version: "1.0.0",
            exportDate: (/* @__PURE__ */ new Date()).toISOString(),
            projects: this.projects
          };
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `adr-projects-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
          showToast(`Exported ${this.projects.length} projects`, "success");
        }
        async importFile(event) {
          const file = event.target.files[0];
          if (!file) return;
          try {
            const content = await file.text();
            const data = JSON.parse(content);
            if (Array.isArray(data.projects)) {
              for (const project of data.projects) {
                await storage.saveProject(project);
              }
              await this.loadProjects();
              await this.renderProjectList();
              showToast(`Imported ${data.projects.length} projects`, "success");
            }
          } catch (error) {
            console.error("Import failed:", error);
            showToast("Failed to import projects", "error");
          }
          event.target.value = "";
        }
      };
      var app = new App();
      app.init();
      window.app = app;
      module.exports = { App, app };
    }
  });
  require_app();
})();
