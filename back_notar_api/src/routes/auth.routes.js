const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validator');

// POST /api/auth/register
router.post('/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('nombre').notEmpty().withMessage('Nombre requerido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña mínimo 6 caracteres'),
    validateRequest
  ],
  AuthController.register
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    validateRequest
  ],
  AuthController.login
);

module.exports = router;
