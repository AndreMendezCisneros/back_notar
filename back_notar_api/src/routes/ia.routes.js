const express = require('express');
const router = express.Router();
const IAController = require('../controllers/iaController');
const authMiddleware = require('../middlewares/auth');
const { iaLimiter } = require('../middlewares/rateLimiter');

// Todas las rutas requieren autenticación y rate limiting
router.use(authMiddleware);
router.use(iaLimiter);

// POST /api/ia/generate
router.post('/generate', IAController.generateNota);

// POST /api/ia/summarize
router.post('/summarize', IAController.summarize);

module.exports = router;
