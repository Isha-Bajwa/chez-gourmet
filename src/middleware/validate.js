const { validationResult } = require('express-validator');

/**
 * Helper to process express-validator errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map(err => ({ field: err.path || err.param, message: err.msg }))
    });
  }
  next();
};

module.exports = validate;
