const express = require('express');
const router = express.Router();
const CuestionarioController = require('../controllers/cuestionarioController');
const authMiddleware = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/cuestionarios/preguntas/:id - Obtener una pregunta por ID (debe ir antes de /:id)
router.get('/preguntas/:id', CuestionarioController.getPreguntaById);

// GET /api/cuestionarios/nota/:id_nota - Obtener todos los cuestionarios de una nota
router.get('/nota/:id_nota', CuestionarioController.getByNota);

// GET /api/cuestionarios/:id_cuestionario/preguntas - Obtener preguntas de un cuestionario
router.get('/:id_cuestionario/preguntas', CuestionarioController.getPreguntasByCuestionario);

// GET /api/cuestionarios/:id - Obtener un cuestionario completo por ID (debe ir al final)
router.get('/:id', CuestionarioController.getById);

module.exports = router;

