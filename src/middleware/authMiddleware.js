const jwt = require('jsonwebtoken');
const { auth, isFirebaseLive, db } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_chez_gourmet_jwt_key_2026';

/**
 * Authenticate incoming requests using either Firebase Auth token or JWT
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (isFirebaseLive && auth) {
      try {
        const decodedFirebaseToken = await auth.verifyIdToken(token);
        const userDoc = await db.collection('users').doc(decodedFirebaseToken.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};
        
        req.user = {
          uid: decodedFirebaseToken.uid,
          id: decodedFirebaseToken.uid,
          email: decodedFirebaseToken.email || userData.email,
          name: userData.name || decodedFirebaseToken.name || 'User',
          role: userData.role || 'customer',
          account_status: userData.account_status || 'active'
        };
        return next();
      } catch (err) {
        // Fallback to local JWT check
      }
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.',
      error: error.message
    });
  }
};

/**
 * Optional Authentication (Attaches req.user if token present, but allows request if absent)
 */
const optionalAuthenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
};

/**
 * Authorize users based on roles
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    const userRole = (req.user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    const roleMatches = normalizedAllowed.some(role => {
      if (role === 'admin' && (userRole === 'administrator' || userRole === 'admin')) return true;
      if (role === 'manager' && (userRole === 'canteen manager' || userRole === 'manager')) return true;
      if (role === 'staff' && (userRole === 'kitchen staff' || userRole === 'canteen staff' || userRole === 'staff')) return true;
      return role === userRole;
    });

    if (!roleMatches) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' does not have permission to access this resource.`
      });
    }

    next();
  };
};

module.exports = {
  authenticateUser,
  optionalAuthenticateUser,
  authorizeRoles
};
