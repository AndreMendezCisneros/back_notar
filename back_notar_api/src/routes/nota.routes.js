const express = require('express');
const router = express.Router();
const NotaController = require('../controllers/notaController');
const authMiddleware = require('../middlewares/auth');
const auditMiddleware = require('../middlewares/audit');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// POST /api/notas - Crear nota
router.post('/', 
  auditMiddleware('nota_create'),
  NotaController.createNota
);

// GET /api/notas/:id - Obtener una nota
router.get('/:id', NotaController.getNota);

// GET /api/notas/user/me - Obtener mis notas
router.get('/user/me', NotaController.getNotasByUser);

// GET /api/notas/mas-buscadas - Notas más buscadas
router.get('/mas-buscadas', NotaController.getMasBuscadas);

module.exports = router;
