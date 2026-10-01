const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db, auth, isFirebaseLive } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_chez_gourmet_jwt_key_2026';

/**
 * Register a new user with Email, Password, Name, and Role
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Name, Email, and Password are all required.'
      });
    }

    if (role && (role.toLowerCase().includes('admin') || role.toLowerCase().includes('administrator'))) {
      return res.status(400).json({
        success: false,
        message: 'Creation of Administrator accounts is prohibited via public registration.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user already exists in Firestore
    const existingUsers = await db.collection('users').where('email', '==', cleanEmail).get();
    if (!existingUsers.empty) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.'
      });
    }

    // 2. Optional Firebase Auth user creation if live
    let firebaseUid = null;
    if (isFirebaseLive && auth) {
      try {
        const fbUser = await auth.createUser({
          email: cleanEmail,
          password: password,
          displayName: name
        });
        firebaseUid = fbUser.uid;
      } catch (fbErr) {
        console.warn('⚠️ Firebase Auth creation notice:', fbErr.message);
        // Continue creating user in Firestore
      }
    }

    // 3. Hash Password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userId = firebaseUid || `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newUser = {
      user_id: userId,
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      role: role.toLowerCase(), // 'customer', 'kitchen staff', 'canteen manager', 'administrator'
      password_hash: passwordHash,
      account_status: 'active',
      created_at: new Date().toISOString()
    };

    // Save to Firestore 'users' collection
    await db.collection('users').doc(userId).set(newUser);

    // Generate JWT Token
    const token = jwt.sign(
      { uid: userId, email: cleanEmail, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password hash from response
    const { password_hash, ...userResponse } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Chez Gourmet.',
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message
    });
  }
};

/**
 * Sign In / Login user with Email and Password
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and Password are required to sign in.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Query user by email from Firestore
    const userQuery = await db.collection('users').where('email', '==', cleanEmail).get();

    if (userQuery.empty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials or register.'
      });
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data();

    // Validate Password
    let isPasswordValid = false;
    if (user.password_hash) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // Default password check for seeded demo users ('password123')
      if (password === 'password123' || password === 'admin123' || password === '123456') {
        isPasswordValid = true;
        // Upgrade account with hashed password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await userDoc.ref.update({ password_hash: hash });
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    if (user.account_status === 'suspended' || user.account_status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact canteen management.'
      });
    }

    // Generate JWT Auth Token
    const token = jwt.sign(
      { uid: user.user_id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userResponse } = user;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Sign in failed.',
      error: error.message
    });
  }
};

/**
 * Get profile of currently logged in user
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(200).json({ success: true, user: req.user });
    }

    const { password_hash, ...userData } = userDoc.data();
    return res.status(200).json({ success: true, user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.', error: error.message });
  }
};

/**
 * Handle Google Authentication Sign In / Sign Up
 */
const googleLogin = async (req, res) => {
  try {
    const { email, name, google_id, photo_url } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google Email is required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user exists in Firestore
    const userQuery = await db.collection('users').where('email', '==', cleanEmail).get();
    let user;

    if (userQuery.empty) {
      const userId = google_id || `usr_google_${Date.now()}`;
      user = {
        user_id: userId,
        id: userId,
        name: (name || cleanEmail.split('@')[0]).trim(),
        email: cleanEmail,
        role: 'customer',
        photo_url: photo_url || '',
        account_status: 'active',
        created_at: new Date().toISOString()
      };
      await db.collection('users').doc(userId).set(user);
    } else {
      user = userQuery.docs[0].data();
    }

    // Generate JWT Token
    const token = jwt.sign(
      { uid: user.user_id || user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userResponse } = user;

    return res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}! Signed in via Google.`,
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Google Sign-In failed.',
      error: error.message
    });
  }
};

/**
 * Get Public Firebase Config for Frontend
 */
const getFirebaseConfig = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      apiKey: process.env.FIREBASE_API_KEY || ""
    }
  });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  googleLogin,
  getFirebaseConfig
};
