/**
 * IndexedDB Storage Module
 * Handles all client-side data persistence
 * @module storage
 */

/** @type {string} */
const DB_NAME = 'adr-assistant';

/** @type {number} */
const DB_VERSION = 1;

/** @type {string} */
const STORE_NAME = 'projects';

/**
 * Storage class for IndexedDB operations
 */
class Storage {
  constructor() {
    /** @type {IDBDatabase | null} */
    this.db = null;
  }

  /**
   * Initialize the database
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {

          console.error('IndexedDB open error:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          this.db = request.result;

          console.log('IndexedDB initialized successfully');
          resolve();
        };

        request.onupgradeneeded = (event) => {

          console.log('IndexedDB upgrade needed');
          const db = event.target.result;

          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const projectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
            projectStore.createIndex('title', 'title', { unique: false });
          }

          if (!db.objectStoreNames.contains('prompts')) {
            db.createObjectStore('prompts', { keyPath: 'phase' });
          }

          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        };
      } catch (error) {

        console.error('IndexedDB init error:', error);
        reject(error);
      }
    });
  }

  /**
   * Save a project
   * @param {import('./types.js').Project} project - Project to save
   * @returns {Promise<IDBValidKey>}
   */
  async saveProject(project) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        ...project,
        updatedAt: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get all projects
   * @returns {Promise<import('./types.js').Project[]>}
   */
  async getAllProjects() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @returns {Promise<import('./types.js').Project | undefined>}
   */
  async getProject(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Delete project
   * @param {string} id - Project ID
   * @returns {Promise<void>}
   */
  async deleteProject(id) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get storage size estimate
   * @returns {Promise<import('./types.js').StorageEstimate>}
   */
  async getStorageSize() {
    if (!navigator.storage || !navigator.storage.estimate) {
      return { usage: 0, quota: 0 };
    }
    return navigator.storage.estimate();
  }

  /**
   * Alias for getStorageSize for API consistency
   * @returns {Promise<import('./types.js').StorageEstimate>}
   */
  async getStorageEstimate() {
    return this.getStorageSize();
  }

  /**
   * Export all projects as JSON backup
   * @returns {Promise<{version: number, exportDate: string, projectCount: number, projects: Array}>}
   */
  async exportAll() {
    const projects = await this.getAllProjects();
    return {
      version: DB_VERSION,
      exportDate: new Date().toISOString(),
      projectCount: projects.length,
      projects: projects
    };
  }

  /**
   * Import projects from JSON backup
   * @param {Object} data - Import data with projects array
   * @returns {Promise<number>} Number of projects imported
   */
  async importAll(data) {
    if (!data.projects || !Array.isArray(data.projects)) {
      throw new Error('Invalid import data');
    }

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const project of data.projects) {
      await new Promise((resolve, reject) => {
        const request = store.put(project);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }

    return data.projects.length;
  }
}

const storage = new Storage();

export { storage };
