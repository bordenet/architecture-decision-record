/**
 * Document-Specific Templates for Architecture Decision Record (ADR)
 * Pre-filled content for common ADR use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} ADRTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} context - Pre-filled context
 * @property {string} status - Pre-filled status (Proposed/Accepted/Deprecated/Superseded)
 */

/** @type {Record<string, ADRTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    context: '',
    status: 'Proposed'
  },
  techStack: {
    id: 'techStack',
    name: 'Tech Stack Choice',
    icon: '🛠️',
    description: 'Framework/library selection',
    context: `Current stack limitations:
- [Describe current bottlenecks or constraints]

Requirements driving this decision:
- [Performance needs]
- [Developer experience]
- [Ecosystem compatibility]

Evaluation criteria:
- Learning curve
- Community support
- Long-term maintenance`,
    status: 'Proposed'
  },
  deployment: {
    id: 'deployment',
    name: 'Deployment Strategy',
    icon: '☁️',
    description: 'Infrastructure changes',
    context: `Current deployment challenges:
- [Scaling bottlenecks]
- [Reliability issues]
- [Cost concerns]

Infrastructure requirements:
- [Availability target: 99.X%]
- [Geographic distribution]
- [Compliance requirements]

Alternatives evaluated:
- [Option A]: Pros/Cons
- [Option B]: Pros/Cons`,
    status: 'Proposed'
  },
  apiDesign: {
    id: 'apiDesign',
    name: 'API Design',
    icon: '🔌',
    description: 'Endpoint/auth patterns',
    context: `API requirements:
- [Client types: web, mobile, third-party]
- [Expected load/scale]
- [Authentication needs]

Current pain points:
- [Existing API limitations]
- [Developer feedback]

Design principles:
- RESTful conventions
- Versioning strategy
- Error handling patterns`,
    status: 'Proposed'
  },
  dataMigration: {
    id: 'dataMigration',
    name: 'Data Migration',
    icon: '💾',
    description: 'Schema or DB changes',
    context: `Current database challenges:
- [Query performance issues]
- [Scale limitations]
- [Cost factors]

Migration requirements:
- [Zero/minimal downtime]
- [Data integrity guarantees]
- [Rollback strategy]

Risk assessment:
- Data volume: [X] GB/TB
- Migration window: [timeframe]
- Dependencies: [list systems]`,
    status: 'Proposed'
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {ADRTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {ADRTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}

