const { pool } = require('../config/database');

/**
 * Uso: app.post('/ruta', auth, audit('CREAR_NOTA'), controller)
 */
function audit(actionName, options = {}) {
  const normalizedOptions = typeof options === 'string'
    ? { table: options }
    : options;

  const tableName = normalizedOptions.table || null;
  const descriptionOption = normalizedOptions.description || normalizedOptions.buildDescription;

  return async function auditMiddleware(req, res, next) {
    const usuario = req.user;
    const userId = usuario?.id_usuario || usuario?.id;

    if (!userId) {
      return next();
    }

    res.on('finish', async () => {
      if (res.statusCode >= 400) {
        return;
      }

      try {
        const description = typeof descriptionOption === 'function'
          ? descriptionOption(req, res)
          : descriptionOption || `Acción ${actionName}`;

        const query = `
          INSERT INTO auditoria (id_usuario, tabla_afectada, accion, descripcion)
          VALUES ($1, $2, $3, $4)
        `;
        const values = [userId, tableName, actionName, description];
        await pool.query(query, values);
      } catch (err) {
        // Opcional: registrar error en un logger
      }
    });

    return next();
  };
}

module.exports = audit;


