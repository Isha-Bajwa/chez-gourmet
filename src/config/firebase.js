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

const DEFAULT_MENU_ITEMS = [
  { item_id: 'item_1', id: 'item_1', item_name: 'Classic Chicken Burger', category: 'Burgers', price: 450, available_quantity: 25, preparation_time: 8, status: 'Available', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', description: 'Crispy fried chicken patty, lettuce, cheese, and spicy mayo.' },
  { item_id: 'item_2', id: 'item_2', item_name: 'Double Beef Cheeseburger', category: 'Burgers', price: 650, available_quantity: 15, preparation_time: 10, status: 'Available', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80', description: 'Double beef patties with melted cheddar and caramelized onions.' },
  { item_id: 'item_3', id: 'item_3', item_name: 'Smash Veggie Burger', category: 'Burgers', price: 400, available_quantity: 18, preparation_time: 7, status: 'Available', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', description: 'Plant-based patty with avocado slice, tomato, and garlic herb aioli.' },
  { item_id: 'item_4', id: 'item_4', item_name: 'Spicy Zinger Supreme', category: 'Burgers', price: 520, available_quantity: 4, preparation_time: 9, status: 'Limited', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=80', description: 'Extra crispy spicy chicken filet with jalapeños and pepperjack cheese.' },
  { item_id: 'item_5', id: 'item_5', item_name: 'Triple Club Sandwich', category: 'Burgers', price: 380, available_quantity: 20, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80', description: 'Layered toasted bread with smoked turkey, egg, tomato, and mayo.' },
  { item_id: 'item_6', id: 'item_6', item_name: 'Pepperoni Passion Pizza', category: 'Pizzas & Pastas', price: 750, available_quantity: 10, preparation_time: 12, status: 'Available', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', description: 'Crispy thin crust topped with mozzarella and spicy beef pepperoni.' },
  { item_id: 'item_7', id: 'item_7', item_name: 'Margherita Supreme Pizza', category: 'Pizzas & Pastas', price: 620, available_quantity: 12, preparation_time: 11, status: 'Available', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80', description: 'Classic Italian tomato marinara, fresh basil leaves, and mozzarella cheese.' },
  { item_id: 'item_8', id: 'item_8', item_name: 'Creamy Chicken Alfredo Penne', category: 'Pizzas & Pastas', price: 580, available_quantity: 8, preparation_time: 10, status: 'Available', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&w=500&q=80', description: 'Penne pasta tossed in rich parmesan garlic cream sauce with grilled chicken.' },
  { item_id: 'item_9', id: 'item_9', item_name: 'Spicy Arrabbiata Pasta', category: 'Pizzas & Pastas', price: 490, available_quantity: 0, preparation_time: 9, status: 'Sold Out', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80', description: 'Penne in fiery chili garlic tomato sauce with black olives.' },
  { item_id: 'item_10', id: 'item_10', item_name: 'Zesty Chicken Wrap', category: 'Wraps & Bowls', price: 380, available_quantity: 14, preparation_time: 7, status: 'Available', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80', description: 'Grilled chicken tenders wrapped in tortilla with lettuce, salsa, and mayo.' },
  { item_id: 'item_11', id: 'item_11', item_name: 'Mexican Fiesta Rice Bowl', category: 'Wraps & Bowls', price: 590, available_quantity: 16, preparation_time: 8, status: 'Available', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80', description: 'Seasoned rice, black beans, sweetcorn, grilled chicken, sour cream, and guacamole.' },
  { item_id: 'item_12', id: 'item_12', item_name: 'Falafel Tahini Power Bowl', category: 'Wraps & Bowls', price: 480, available_quantity: 12, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80', description: 'Crispy falafel balls, hummus, cucumber salad, quinoa, and lemon tahini dressing.' },
  { item_id: 'item_13', id: 'item_13', item_name: 'Crispy French Fries', category: 'Snacks & Sides', price: 200, available_quantity: 50, preparation_time: 5, status: 'Available', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80', description: 'Golden salted French fries served with ketchup dip.' },
  { item_id: 'item_14', id: 'item_14', item_name: 'Cheesy Loaded Fries', category: 'Snacks & Sides', price: 340, available_quantity: 22, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=500&q=80', description: 'French fries topped with warm cheddar sauce, bacon bits, and jalapeños.' },
  { item_id: 'item_15', id: 'item_15', item_name: 'Mozzarella Sticks (6pcs)', category: 'Snacks & Sides', price: 320, available_quantity: 15, preparation_time: 5, status: 'Available', image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=500&q=80', description: 'Deep fried gooey cheese sticks with marinara dip.' },
  { item_id: 'item_16', id: 'item_16', item_name: 'Crispy Chicken Nuggets (8pcs)', category: 'Snacks & Sides', price: 360, available_quantity: 30, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500&q=80', description: 'Tender bite-sized chicken nuggets with honey mustard sauce.' },
  { item_id: 'item_17', id: 'item_17', item_name: 'Chilled Cold Drink (Can)', category: 'Beverages', price: 100, available_quantity: 100, preparation_time: 1, status: 'Available', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80', description: '330ml chilled carbonated soda can.' },
  { item_id: 'item_18', id: 'item_18', item_name: 'Iced Caramel Macchiato', category: 'Beverages', price: 280, available_quantity: 40, preparation_time: 3, status: 'Available', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80', description: 'Espresso poured over chilled milk, ice, and caramel drizzle.' },
  { item_id: 'item_19', id: 'item_19', item_name: 'Fresh Mango Smoothie', category: 'Beverages', price: 250, available_quantity: 25, preparation_time: 4, status: 'Available', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80', description: 'Blended real mango pulp with chilled yogurt and honey.' },
  { item_id: 'item_20', id: 'item_20', item_name: 'Chocolate Fudge Shake', category: 'Beverages', price: 290, available_quantity: 20, preparation_time: 4, status: 'Available', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80', description: 'Thick chocolate ice cream milkshake topped with whipped cream.' },
  { item_id: 'item_21', id: 'item_21', item_name: 'Warm Fudge Brownie', category: 'Desserts', price: 220, available_quantity: 15, preparation_time: 2, status: 'Available', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80', description: 'Rich chocolate brownie served warm with chocolate sauce.' },
  { item_id: 'item_22', id: 'item_22', item_name: 'New York Cheesecake Slice', category: 'Desserts', price: 350, available_quantity: 8, preparation_time: 1, status: 'Available', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80', description: 'Classic dense cream cheesecake slice on graham cracker crust.' }
];

const DEFAULT_USERS = [
  { user_id: 'usr_admin_1', id: 'usr_admin_1', name: 'Master Administrator', email: 'admin@chezgourmet.com', role: 'administrator', account_status: 'active', created_at: new Date().toISOString() },
  { user_id: 'usr_mgr_1', id: 'usr_mgr_1', name: 'Sarah Jenkins (General Manager)', email: 'manager@chezgourmet.com', role: 'canteen manager', account_status: 'active', created_at: new Date().toISOString() },
  { user_id: 'usr_staff_1', id: 'usr_staff_1', name: 'Chef Gordon Ramsay', email: 'staff@chezgourmet.com', role: 'kitchen staff', account_status: 'active', created_at: new Date().toISOString() },
  { user_id: 'usr_cust_1', id: 'usr_cust_1', name: 'Emily Clark', email: 'customer@chezgourmet.com', role: 'customer', account_status: 'active', created_at: new Date().toISOString() }
];

class SimulatedFirestore {
  constructor() {
    this.collections = new Map();
    this.collections.set('menu_items', new SimulatedCollection('menu_items', DEFAULT_MENU_ITEMS));
    this.collections.set('users', new SimulatedCollection('users', DEFAULT_USERS));
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
  DEFAULT_MENU_ITEMS,
  DEFAULT_USERS,
  admin
};
