/**
 * AI Mock UI Module
 * Provides UI for mock AI interactions
 * @module ai-mock-ui
 */

/**
 * Show mock AI response in console
 * @param {string} response - AI response
 * @returns {void}
 */
function showMockAIResponse(response) {
  console.log('Mock AI Response:', response);
}

/**
 * Render AI panel HTML
 * @returns {string} HTML content
 */
function renderAIPanel() {
  return `
    <div class="ai-panel">
      <h3>AI Assistant</h3>
      <p>Mock mode enabled</p>
    </div>
  `;
}

export { showMockAIResponse, renderAIPanel };
