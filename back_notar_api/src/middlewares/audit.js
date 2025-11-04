const { pool } = require('../config/database');

/**
 * Uso: app.post('/ruta', auth, audit('CREAR_NOTA'), controller)
 */
function audit(actionName) {
  return async function auditMiddleware(req, res, next) {
    const usuario = req.user;
    if (!usuario || !usuario.id_usuario) {
      // Si no hay usuario autenticado, no registramos auditoría y seguimos
      return next();
    }

    // Registrar al finalizar la respuesta para capturar statusCode
    res.on('finish', async () => {
      try {
        const query = `
          INSERT INTO auditoria (id_usuario, accion)
          VALUES ($1, $2)
        `;
        const values = [usuario.id_usuario, actionName];
        await pool.query(query, values);
      } catch (err) {
        // No interrumpir el flujo por errores de auditoría
        // Se podría agregar un logger aquí si existe
      }
    });

    return next();
  };
}

module.exports = audit;


