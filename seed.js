const bcrypt = require('bcryptjs');
const { db } = require('./src/config/firebase');
const { generateOrderQRCode, generateTokenNumber } = require('./src/services/tokenService');

async function seedLargeDatabase() {
  console.log('🚀 Seeding LARGE Database for Chez Gourmet into Firebase Firestore...');

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // ==========================================
  // 1. SEED 30 USERS (Customers, Staff, Managers, Admins)
  // ==========================================
  const users = [
    // Administrators
    { user_id: 'usr_admin_1', id: 'usr_admin_1', name: 'Master Administrator', email: 'admin@chezgourmet.com', role: 'administrator', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_admin_2', id: 'usr_admin_2', name: 'IT Admin Alex', email: 'admin2@chezgourmet.com', role: 'administrator', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },

    // Canteen Managers
    { user_id: 'usr_mgr_1', id: 'usr_mgr_1', name: 'Sarah Jenkins (General Manager)', email: 'manager@chezgourmet.com', role: 'canteen manager', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_mgr_2', id: 'usr_mgr_2', name: 'Robert Vance (Floor Manager)', email: 'robert@chezgourmet.com', role: 'canteen manager', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },

    // Kitchen Staff
    { user_id: 'usr_staff_1', id: 'usr_staff_1', name: 'Chef Gordon Ramsay', email: 'staff@chezgourmet.com', role: 'kitchen staff', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_staff_2', id: 'usr_staff_2', name: 'Sous Chef Maria', email: 'maria@chezgourmet.com', role: 'kitchen staff', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_staff_3', id: 'usr_staff_3', name: 'Grill Master David', email: 'david@chezgourmet.com', role: 'kitchen staff', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_staff_4', id: 'usr_staff_4', name: 'Prep Chef Ken', email: 'ken@chezgourmet.com', role: 'kitchen staff', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },

    // Customers (Students & Staff)
    { user_id: 'usr_cust_1', id: 'usr_cust_1', name: 'Emily Clark', email: 'customer@chezgourmet.com', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_2', id: 'usr_cust_2', name: 'Michael Brown', email: 'michael@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_3', id: 'usr_cust_3', name: 'Sophia Martinez', email: 'sophia@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_4', id: 'usr_cust_4', name: 'James Wilson', email: 'james@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_5', id: 'usr_cust_5', name: 'Olivia Taylor', email: 'olivia@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_6', id: 'usr_cust_6', name: 'Daniel Anderson', email: 'daniel@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_7', id: 'usr_cust_7', name: 'Ava Thomas', email: 'ava@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_8', id: 'usr_cust_8', name: 'Lucas White', email: 'lucas@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_9', id: 'usr_cust_9', name: 'Isabella Harris', email: 'isabella@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_10', id: 'usr_cust_10', name: 'Ethan Martin', email: 'ethan@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_11', id: 'usr_cust_11', name: 'Mia Thompson', email: 'mia@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_12', id: 'usr_cust_12', name: 'Alexander Garcia', email: 'alexander@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_13', id: 'usr_cust_13', name: 'Charlotte Robinson', email: 'charlotte@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_14', id: 'usr_cust_14', name: 'Benjamin Lewis', email: 'benjamin@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() },
    { user_id: 'usr_cust_15', id: 'usr_cust_15', name: 'Amelia Walker', email: 'amelia@university.edu', role: 'customer', password_hash: defaultPasswordHash, account_status: 'active', created_at: new Date().toISOString() }
  ];

  for (const u of users) {
    await db.collection('users').doc(u.id).set(u);
  }
  console.log(`✅ Seeded ${users.length} user accounts with hashed passwords ('password123').`);

  // ==========================================
  // 2. SEED 25 LARGE MENU ITEMS
  // ==========================================
  const menuItems = [
    // Burgers & Sandwiches
    { item_id: 'item_1', id: 'item_1', item_name: 'Classic Chicken Burger', category: 'Burgers', price: 450, available_quantity: 25, preparation_time: 8, status: 'Available', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', description: 'Crispy fried chicken patty, lettuce, cheese, and spicy mayo.' },
    { item_id: 'item_2', id: 'item_2', item_name: 'Double Beef Cheeseburger', category: 'Burgers', price: 650, available_quantity: 15, preparation_time: 10, status: 'Available', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80', description: 'Double beef patties with melted cheddar and caramelized onions.' },
    { item_id: 'item_3', id: 'item_3', item_name: 'Smash Veggie Burger', category: 'Burgers', price: 400, available_quantity: 18, preparation_time: 7, status: 'Available', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80', description: 'Plant-based patty with avocado slice, tomato, and garlic herb aioli.' },
    { item_id: 'item_4', id: 'item_4', item_name: 'Spicy Zinger Supreme', category: 'Burgers', price: 520, available_quantity: 4, preparation_time: 9, status: 'Limited', image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=500&q=80', description: 'Extra crispy spicy chicken filet with jalapeños and pepperjack cheese.' },
    { item_id: 'item_5', id: 'item_5', item_name: 'Triple Club Sandwich', category: 'Burgers', price: 380, available_quantity: 20, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80', description: 'Layered toasted bread with smoked turkey, egg, tomato, and mayo.' },

    // Pizzas & Pastas
    { item_id: 'item_6', id: 'item_6', item_name: 'Pepperoni Passion Pizza', category: 'Pizzas & Pastas', price: 750, available_quantity: 10, preparation_time: 12, status: 'Available', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80', description: 'Crispy thin crust topped with mozzarella and spicy beef pepperoni.' },
    { item_id: 'item_7', id: 'item_7', item_name: 'Margherita Supreme Pizza', category: 'Pizzas & Pastas', price: 620, available_quantity: 12, preparation_time: 11, status: 'Available', image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=500&q=80', description: 'Classic Italian tomato marinara, fresh basil leaves, and mozzarella cheese.' },
    { item_id: 'item_8', id: 'item_8', item_name: 'Creamy Chicken Alfredo Penne', category: 'Pizzas & Pastas', price: 580, available_quantity: 8, preparation_time: 10, status: 'Available', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?auto=format&fit=crop&w=500&q=80', description: 'Penne pasta tossed in rich parmesan garlic cream sauce with grilled chicken.' },
    { item_id: 'item_9', id: 'item_9', item_name: 'Spicy Arrabbiata Pasta', category: 'Pizzas & Pastas', price: 490, available_quantity: 0, preparation_time: 9, status: 'Sold Out', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=500&q=80', description: 'Penne in fiery chili garlic tomato sauce with black olives.' },

    // Wraps & Bowls
    { item_id: 'item_10', id: 'item_10', item_name: 'Zesty Chicken Wrap', category: 'Wraps & Bowls', price: 380, available_quantity: 14, preparation_time: 7, status: 'Available', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=80', description: 'Grilled chicken tenders wrapped in tortilla with lettuce, salsa, and mayo.' },
    { item_id: 'item_11', id: 'item_11', item_name: 'Mexican Fiesta Rice Bowl', category: 'Wraps & Bowls', price: 590, available_quantity: 16, preparation_time: 8, status: 'Available', image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=500&q=80', description: 'Seasoned rice, black beans, sweetcorn, grilled chicken, sour cream, and guacamole.' },
    { item_id: 'item_12', id: 'item_12', item_name: 'Falafel Tahini Power Bowl', category: 'Wraps & Bowls', price: 480, available_quantity: 12, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80', description: 'Crispy falafel balls, hummus, cucumber salad, quinoa, and lemon tahini dressing.' },

    // Snacks & Sides
    { item_id: 'item_13', id: 'item_13', item_name: 'Crispy French Fries', category: 'Snacks & Sides', price: 200, available_quantity: 50, preparation_time: 5, status: 'Available', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=500&q=80', description: 'Golden salted French fries served with ketchup dip.' },
    { item_id: 'item_14', id: 'item_14', item_name: 'Cheesy Loaded Fries', category: 'Snacks & Sides', price: 340, available_quantity: 22, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=500&q=80', description: 'French fries topped with warm cheddar sauce, bacon bits, and jalapeños.' },
    { item_id: 'item_15', id: 'item_15', item_name: 'Mozzarella Sticks (6pcs)', category: 'Snacks & Sides', price: 320, available_quantity: 15, preparation_time: 5, status: 'Available', image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?auto=format&fit=crop&w=500&q=80', description: 'Deep fried gooey cheese sticks with marinara dip.' },
    { item_id: 'item_16', id: 'item_16', item_name: 'Crispy Chicken Nuggets (8pcs)', category: 'Snacks & Sides', price: 360, available_quantity: 30, preparation_time: 6, status: 'Available', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=500&q=80', description: 'Tender bite-sized chicken nuggets with honey mustard sauce.' },

    // Beverages & Drinks
    { item_id: 'item_17', id: 'item_17', item_name: 'Chilled Cold Drink (Can)', category: 'Beverages', price: 100, available_quantity: 100, preparation_time: 1, status: 'Available', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80', description: '330ml chilled carbonated soda can.' },
    { item_id: 'item_18', id: 'item_18', item_name: 'Iced Caramel Macchiato', category: 'Beverages', price: 280, available_quantity: 40, preparation_time: 3, status: 'Available', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=500&q=80', description: 'Espresso poured over chilled milk, ice, and caramel drizzle.' },
    { item_id: 'item_19', id: 'item_19', item_name: 'Fresh Mango Smoothie', category: 'Beverages', price: 250, available_quantity: 25, preparation_time: 4, status: 'Available', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=500&q=80', description: 'Blended real mango pulp with chilled yogurt and honey.' },
    { item_id: 'item_20', id: 'item_20', item_name: 'Chocolate Fudge Shake', category: 'Beverages', price: 290, available_quantity: 20, preparation_time: 4, status: 'Available', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80', description: 'Thick chocolate ice cream milkshake topped with whipped cream.' },

    // Desserts
    { item_id: 'item_21', id: 'item_21', item_name: 'Warm Fudge Brownie', category: 'Desserts', price: 220, available_quantity: 15, preparation_time: 2, status: 'Available', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80', description: 'Rich chocolate brownie served warm with chocolate sauce.' },
    { item_id: 'item_22', id: 'item_22', item_name: 'New York Cheesecake Slice', category: 'Desserts', price: 350, available_quantity: 8, preparation_time: 1, status: 'Available', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=80', description: 'Classic dense cream cheesecake slice on graham cracker crust.' }
  ];

  for (const item of menuItems) {
    await db.collection('menu_items').doc(item.id).set(item);
  }
  console.log(`✅ Seeded ${menuItems.length} menu items across 6 categories.`);

  // ==========================================
  // 3. SEED 45+ ORDERS (Active, Ready, Completed, Cancelled)
  // ==========================================
  const now = Date.now();
  let tokenIndex = 1;

  const orderStatuses = ['Placed', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Completed', 'Completed', 'Cancelled'];

  for (let i = 1; i <= 35; i++) {
    const orderId = `ord_large_${i}`;
    const tokenNumber = generateTokenNumber(tokenIndex++);
    const custUser = users[8 + (i % 15)]; // Select customer
    const status = orderStatuses[i % orderStatuses.length];

    // Pick 1 to 3 random items
    const selectedItem1 = menuItems[i % menuItems.length];
    const selectedItem2 = menuItems[(i + 3) % menuItems.length];
    const orderItems = [
      { item_id: selectedItem1.item_id, item_name: selectedItem1.item_name, quantity: 1, price: selectedItem1.price },
      { item_id: selectedItem2.item_id, item_name: selectedItem2.item_name, quantity: (i % 2) + 1, price: selectedItem2.price }
    ];

    const totalAmount = orderItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const orderTime = new Date(now - (i * 12 * 60000)).toISOString();
    const qrRes = await generateOrderQRCode(orderId, tokenNumber, custUser.user_id);

    const slotNames = ['12:00 - 12:15 PM', '12:15 - 12:30 PM', '12:30 - 12:45 PM', '01:00 - 01:15 PM', '01:30 - 01:45 PM'];

    const orderData = {
      order_id: orderId,
      id: orderId,
      customer_id: custUser.user_id,
      customer_name: custUser.name,
      token_number: tokenNumber,
      items: orderItems,
      total_amount: totalAmount,
      order_time: orderTime,
      pickup_time: slotNames[i % slotNames.length],
      estimated_prep_time: selectedItem1.preparation_time + 3,
      estimated_ready_time: new Date(new Date(orderTime).getTime() + 10 * 60000).toISOString(),
      order_status: status,
      payment_status: 'Paid',
      payment_method: i % 2 === 0 ? 'Online' : 'Card',
      qr_code_image: qrRes.qr_code_image,
      qr_raw_data: qrRes.qr_raw_data,
      is_delayed: i % 7 === 0,
      created_at: orderTime
    };

    if (status === 'Completed') {
      orderData.collected_at = new Date(new Date(orderTime).getTime() + 15 * 60000).toISOString();
    } else if (status === 'Cancelled') {
      orderData.cancel_reason = 'Customer changed lunch timing';
    }

    await db.collection('orders').doc(orderId).set(orderData);
  }

  console.log(`✅ Seeded 35 detailed orders (Tokens C-001 to C-035) with QR signatures and status workflows.`);
  console.log('🎉 Chez Gourmet Large Database Seeding Completed Successfully!');
}

if (require.main === module) {
  seedLargeDatabase().catch(err => console.error('Error during large database seeding:', err));
}

module.exports = seedLargeDatabase;
