const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let db = null;
let auth = null;
let isFirebaseLive = false;

// Simulated DB for instant out-of-the-box readiness when credentials aren't provided yet
class SimulatedCollection {
  constructor(name, initialData = []) {
    this.name = name;
    this.data = new Map(initialData.map(item => [item.id, item]));
  }

  async get() {
    const docs = Array.from(this.data.values()).map(doc => ({
      id: doc.id,
      exists: true,
      data: () => ({ ...doc })
    }));
    return {
      empty: docs.length === 0,
      size: docs.length,
      docs,
      forEach: (callback) => docs.forEach(callback)
    };
  }

  doc(id) {
    const self = this;
    return {
      async get() {
        const item = self.data.get(id);
        return {
          id,
          exists: !!item,
          data: () => (item ? { ...item } : null)
        };
      },
      async set(data, options = {}) {
        const existing = self.data.get(id) || {};
        const updated = options.merge ? { ...existing, ...data, id } : { ...data, id };
        self.data.set(id, updated);
        return { id };
      },
      async update(data) {
        const existing = self.data.get(id);
        if (!existing) throw new Error(`Document ${id} not found in ${self.name}`);
        const updated = { ...existing, ...data, id };
        self.data.set(id, updated);
        return { id };
      },
      async delete() {
        self.data.delete(id);
        return true;
      }
    };
  }

  async add(data) {
    const id = data.id || `${this.name.slice(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const docData = { ...data, id };
    this.data.set(id, docData);
    return { id, get: async () => ({ id, exists: true, data: () => docData }) };
  }

  where(field, op, value) {
    const self = this;
    const filterDocs = () => {
      const items = Array.from(self.data.values()).filter(item => {
        if (op === '==') return item[field] === value;
        if (op === '!=') return item[field] !== value;
        if (op === '>') return item[field] > value;
        if (op === '>=') return item[field] >= value;
        if (op === '<') return item[field] < value;
        if (op === '<=') return item[field] <= value;
        if (op === 'array-contains') return Array.isArray(item[field]) && item[field].includes(value);
        if (op === 'in') return Array.isArray(value) && value.includes(item[field]);
        return true;
      });
      return items;
    };

    return {
      async get() {
        const items = filterDocs();
        const docs = items.map(doc => ({ id: doc.id, exists: true, data: () => ({ ...doc }) }));
        return { empty: docs.length === 0, size: docs.length, docs, forEach: (cb) => docs.forEach(cb) };
      },
      orderBy(orderField, direction = 'asc') {
        return {
          async get() {
            let items = filterDocs();
            items.sort((a, b) => {
              if (a[orderField] < b[orderField]) return direction === 'asc' ? -1 : 1;
              if (a[orderField] > b[orderField]) return direction === 'asc' ? 1 : -1;
              return 0;
            });
            const docs = items.map(doc => ({ id: doc.id, exists: true, data: () => ({ ...doc }) }));
            return { empty: docs.length === 0, size: docs.length, docs, forEach: (cb) => docs.forEach(cb) };
          }
        };
      }
    };
  }

  orderBy(field, direction = 'asc') {
    const self = this;
    return {
      async get() {
        const items = Array.from(self.data.values());
        items.sort((a, b) => {
          if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
          if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
          return 0;
        });
        const docs = items.map(doc => ({ id: doc.id, exists: true, data: () => ({ ...doc }) }));
        return { empty: docs.length === 0, size: docs.length, docs, forEach: (cb) => docs.forEach(cb) };
      }
    };
  }
}

class SimulatedFirestore {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) {
      this.collections.set(name, new SimulatedCollection(name));
    }
    return this.collections.get(name);
  }
}

const simulatedDb = new SimulatedFirestore();

function initializeFirebase() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../../serviceAccountKey.json');

  if (process.env.USE_SIMULATED_DB === 'true') {
    console.log('ℹ️ Operating in SIMULATED FIREBASE DB mode for quick testing & development.');
    return { db: simulatedDb, auth: null, isFirebaseLive: false };
  }

  try {
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      auth = admin.auth();
      isFirebaseLive = true;
      console.log('✅ Firebase Admin SDK successfully connected to Firestore live database!');
      return { db, auth, isFirebaseLive };
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      db = admin.firestore();
      auth = admin.auth();
      isFirebaseLive = true;
      console.log('✅ Firebase Admin SDK connected using environment variables!');
      return { db, auth, isFirebaseLive };
    } else {
      console.warn('⚠️ No Firebase service account file or ENV variables found. Defaulting to SIMULATED DB mode.');
      return { db: simulatedDb, auth: null, isFirebaseLive: false };
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.warn('⚠️ Falling back to SIMULATED DB mode.');
    return { db: simulatedDb, auth: null, isFirebaseLive: false };
  }
}

const fbInstance = initializeFirebase();

module.exports = {
  db: fbInstance.db,
  auth: fbInstance.auth,
  isFirebaseLive: fbInstance.isFirebaseLive,
  simulatedDb,
  admin
};
