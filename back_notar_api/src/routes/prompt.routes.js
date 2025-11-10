const express = require('express');
const router = express.Router();
const PromptController = require('../controllers/promptController');
const authMiddleware = require('../middlewares/auth');
const requireSuperAdmin = require('../middlewares/requireSuperAdmin');
const { body } = require('express-validator');
const { validateRequest } = require('../middlewares/validator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/prompts/active - Obtener prompt activo (cualquier usuario autenticado)
router.get('/active', PromptController.getActive);

// Rutas que requieren superadmin
router.use(requireSuperAdmin);

// GET /api/prompts - Obtener todos los prompts (solo superadmin)
router.get('/', PromptController.getAll);

// GET /api/prompts/:id - Obtener prompt por ID (solo superadmin)
router.get('/:id', PromptController.getById);

// POST /api/prompts - Crear nueva versión de prompt (solo superadmin)
router.post('/',
  [
    body('numero_version')
      .notEmpty().withMessage('numero_version es obligatorio')
      .isLength({ max: 50 }).withMessage('numero_version no puede exceder 50 caracteres'),
    body('contenido_prompt')
      .notEmpty().withMessage('contenido_prompt es obligatorio')
      .isString().withMessage('contenido_prompt debe ser un texto'),
    body('descripcion')
      .optional()
      .isString().withMessage('descripcion debe ser un texto'),
    validateRequest
  ],
  PromptController.create
);

module.exports = router;

