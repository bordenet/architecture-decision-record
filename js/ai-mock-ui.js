/**
 * AI Mock UI Module
 * Provides UI for mock AI interactions
 */

function showMockAIResponse(response) {
  // eslint-disable-next-line no-console
  console.log("Mock AI Response:", response);
}

function renderAIPanel() {
  return `
    <div class="ai-panel">
      <h3>AI Assistant</h3>
      <p>Mock mode enabled</p>
    </div>
  `;
}

module.exports = { showMockAIResponse, renderAIPanel };
