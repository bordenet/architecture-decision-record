/**
 * Tests for document-specific-templates.js module
 *
 * Tests the ADR template definitions and retrieval functions.
 */

import { DOCUMENT_TEMPLATES, getTemplate, getAllTemplates } from '../js/document-specific-templates.js';

describe('DOCUMENT_TEMPLATES', () => {
  test('should have 5 templates defined', () => {
    expect(Object.keys(DOCUMENT_TEMPLATES)).toHaveLength(5);
  });

  test('should have blank template', () => {
    expect(DOCUMENT_TEMPLATES.blank).toBeDefined();
    expect(DOCUMENT_TEMPLATES.blank.id).toBe('blank');
    expect(DOCUMENT_TEMPLATES.blank.name).toBe('Blank');
    expect(DOCUMENT_TEMPLATES.blank.context).toBe('');
    expect(DOCUMENT_TEMPLATES.blank.status).toBe('Proposed');
  });

  test('should have techStack template', () => {
    expect(DOCUMENT_TEMPLATES.techStack).toBeDefined();
    expect(DOCUMENT_TEMPLATES.techStack.id).toBe('techStack');
    expect(DOCUMENT_TEMPLATES.techStack.name).toBe('Tech Stack Choice');
    expect(DOCUMENT_TEMPLATES.techStack.icon).toBe('🛠️');
  });

  test('should have deployment template', () => {
    expect(DOCUMENT_TEMPLATES.deployment).toBeDefined();
    expect(DOCUMENT_TEMPLATES.deployment.id).toBe('deployment');
    expect(DOCUMENT_TEMPLATES.deployment.name).toBe('Deployment Strategy');
    expect(DOCUMENT_TEMPLATES.deployment.icon).toBe('☁️');
  });

  test('should have apiDesign template', () => {
    expect(DOCUMENT_TEMPLATES.apiDesign).toBeDefined();
    expect(DOCUMENT_TEMPLATES.apiDesign.id).toBe('apiDesign');
    expect(DOCUMENT_TEMPLATES.apiDesign.name).toBe('API Design');
    expect(DOCUMENT_TEMPLATES.apiDesign.icon).toBe('🔌');
  });

  test('should have dataMigration template', () => {
    expect(DOCUMENT_TEMPLATES.dataMigration).toBeDefined();
    expect(DOCUMENT_TEMPLATES.dataMigration.id).toBe('dataMigration');
    expect(DOCUMENT_TEMPLATES.dataMigration.name).toBe('Data Migration');
    expect(DOCUMENT_TEMPLATES.dataMigration.icon).toBe('💾');
  });

  test('all templates should have required fields', () => {
    const requiredFields = ['id', 'name', 'icon', 'description', 'context', 'status'];

    Object.values(DOCUMENT_TEMPLATES).forEach(template => {
      requiredFields.forEach(field => {
        expect(template[field]).toBeDefined();
        expect(typeof template[field]).toBe('string');
      });
    });
  });
});

describe('getTemplate', () => {
  test('should return template by ID', () => {
    const template = getTemplate('blank');
    expect(template).toBe(DOCUMENT_TEMPLATES.blank);
  });

  test('should return techStack template', () => {
    const template = getTemplate('techStack');
    expect(template.name).toBe('Tech Stack Choice');
  });

  test('should return deployment template', () => {
    const template = getTemplate('deployment');
    expect(template.name).toBe('Deployment Strategy');
  });

  test('should return null for invalid ID', () => {
    expect(getTemplate('nonexistent')).toBeNull();
    expect(getTemplate('')).toBeNull();
    expect(getTemplate(null)).toBeNull();
  });

  test('should return null for undefined', () => {
    expect(getTemplate(undefined)).toBeNull();
  });
});

describe('getAllTemplates', () => {
  test('should return array of all templates', () => {
    const templates = getAllTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates).toHaveLength(5);
  });

  test('should include all template objects', () => {
    const templates = getAllTemplates();
    const ids = templates.map(t => t.id);
    expect(ids).toContain('blank');
    expect(ids).toContain('techStack');
    expect(ids).toContain('deployment');
    expect(ids).toContain('apiDesign');
    expect(ids).toContain('dataMigration');
  });

  test('each template should have name and icon', () => {
    const templates = getAllTemplates();
    templates.forEach(template => {
      expect(template.name).toBeDefined();
      expect(template.icon).toBeDefined();
    });
  });
});

