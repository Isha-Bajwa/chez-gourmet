const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getProfile, googleLogin } = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

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
