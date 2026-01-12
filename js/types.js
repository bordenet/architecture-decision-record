/**
 * Type Definitions for Architecture Decision Record Assistant
 *
 * This file contains JSDoc type definitions used across the application.
 * Import types using: @type {import('./types.js').TypeName}
 */

// ============================================================================
// Project Types
// ============================================================================

/**
 * @typedef {1 | 2 | 3} PhaseNumber
 */

/**
 * @typedef {Object} PhaseData
 * @property {string} prompt - The prompt used for this phase
 * @property {string} response - The AI response for this phase
 * @property {boolean} completed - Whether this phase is complete
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - ADR title
 * @property {string} context - Context and background for the decision
 * @property {string} status - Status of the ADR (Proposed, Accepted, Deprecated, Superseded)
 * @property {PhaseNumber} phase - Current phase number (1-3)
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {Object.<string, PhaseData>} phases - Phase data by phase number
 */

/**
 * @typedef {Object} ProjectFormData
 * @property {string} title - ADR title
 * @property {string} context - Context and background for the decision
 * @property {string} [status] - Status of the ADR
 */

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * @typedef {Object} PhaseConfig
 * @property {number} number - Phase number (1, 2, or 3)
 * @property {string} name - Display name for the phase
 * @property {string} aiModel - AI model to use
 * @property {string} aiUrl - URL to the AI interface
 * @property {string} promptFile - Path to the prompt template file
 * @property {string} description - Description of what this phase does
 * @property {string} icon - Emoji icon for the phase
 * @property {string} color - Color theme for the phase
 */

/**
 * @typedef {Object} WorkflowConfig
 * @property {number} phaseCount - Total number of phases
 * @property {PhaseConfig[]} phases - Array of phase configurations
 */

// ============================================================================
// Storage Types
// ============================================================================

/**
 * @typedef {Object} StorageEstimate
 * @property {number} [quota] - Total quota in bytes
 * @property {number} [usage] - Current usage in bytes
 */

/**
 * @typedef {Object} Setting
 * @property {string} key - Setting key
 * @property {*} value - Setting value
 */

// ============================================================================
// UI Types
// ============================================================================

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastType
 */

/**
 * @typedef {Object} RouteInfo
 * @property {string} name - Route name ('home', 'new-project', 'project')
 * @property {string} [id] - Project ID for project routes
 */

// ============================================================================
// Export Types
// ============================================================================

/**
 * @typedef {Object} ProjectBackup
 * @property {string} version - Backup format version
 * @property {string} exportedAt - ISO timestamp of export
 * @property {number} projectCount - Number of projects in backup
 * @property {Project[]} projects - Array of projects
 */

// ============================================================================
// Adversarial System Types
// ============================================================================

/**
 * @typedef {Object} PhaseConfig
 * @property {string} provider - LLM provider name
 * @property {string} model - Model name
 * @property {string} [endpoint] - API endpoint URL
 * @property {string} [url] - Alternative URL
 */

/**
 * @typedef {Object} LLMConfiguration
 * @property {PhaseConfig} phase1 - Phase 1 configuration
 * @property {PhaseConfig} phase2 - Phase 2 configuration
 * @property {boolean} isSameLLM - Whether both phases use the same LLM
 * @property {boolean} requiresAugmentation - Whether adversarial augmentation is needed
 * @property {string} detectionMethod - How same-LLM was detected
 * @property {string} deploymentType - Type of LLM deployment
 */

/**
 * @typedef {Object} AdversarialQualityMetrics
 * @property {number} differenceScore - Semantic difference score (0-1)
 * @property {number} adversarialLanguageCount - Count of adversarial phrases
 * @property {number} challengeCount - Count of direct challenges
 * @property {boolean} isEffectivelyAdversarial - Whether output is sufficiently adversarial
 */

// Export empty object to make this a module
export {};
