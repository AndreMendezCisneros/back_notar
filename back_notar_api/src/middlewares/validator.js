const { validationResult } = require('express-validator');

// Middleware para validar las peticiones
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  // Si hay errores de validación, devuelve un 400
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array() 
    });
  }
  
  // Si no hay errores, continúa
  next();
};

module.exports = { validateRequest };
