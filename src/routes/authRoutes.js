const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getProfile, googleLogin, getFirebaseConfig } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/config', getFirebaseConfig);

router.get('/debug', (req, res) => {
  const { isFirebaseLive } = require('../config/firebase');
  res.json({
    firebase_connected: isFirebaseLive,
    env_vars_present: {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET
    }
  });
});

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email address is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email address is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  loginUser
);

router.post('/google', googleLogin);

router.get('/profile', authenticateUser, getProfile);

module.exports = router;
