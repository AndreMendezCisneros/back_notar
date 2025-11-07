const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const NotaController = require('../controllers/notaController');
const authMiddleware = require('../middlewares/auth');
const auditMiddleware = require('../middlewares/audit');
const { validateRequest } = require('../middlewares/validator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/notas - Crear nota
router.post(
  '/',
  [
    body('titulo').trim().notEmpty().withMessage('El título es obligatorio'),
    body('contenido').trim().notEmpty().withMessage('El contenido es obligatorio'),
    body('tipo_fuente').optional().isString().withMessage('El tipo de fuente debe ser texto'),
    body('id_tema').optional().isInt({ gt: 0 }).withMessage('El id_tema debe ser un entero positivo'),
    body('id_documento').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('El id_documento debe ser un entero positivo o nulo'),
    body('id_prompt').optional({ nullable: true }).isInt({ gt: 0 }).withMessage('El id_prompt debe ser un entero positivo o nulo')
  ],
  validateRequest,
  auditMiddleware('nota_create', {
    table: 'nota',
    description: (req) => {
      const titulo = req.body?.titulo || 'sin título';
      return `Creación de nota "${titulo}"`;
    }
  }),
  NotaController.createNota
);

// GET /api/notas/user/me - Obtener mis notas
router.get('/user/me', NotaController.getNotasByUser);

// GET /api/notas/mas-buscadas - Notas más buscadas
router.get('/mas-buscadas', NotaController.getMasBuscadas);

// GET /api/notas/:id - Obtener una nota
router.get('/:id', NotaController.getNota);

module.exports = router;
