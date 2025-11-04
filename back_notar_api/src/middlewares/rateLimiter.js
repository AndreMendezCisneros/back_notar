const rateLimit = require('express-rate-limit');

// Limitar peticiones a IA: 5 por minuto
const iaLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // máximo 5 peticiones
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en un minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { iaLimiter };
