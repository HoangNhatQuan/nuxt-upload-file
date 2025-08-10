const { body, validationResult } = require("express-validator");

// Validation middleware for upload requests
const validateUpload = [
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description too long"),
];

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateUpload,
  handleValidationErrors,
};
