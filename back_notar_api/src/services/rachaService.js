const Racha = require('../models/Racha');
const { pool } = require('../config/database');

class RachaService {
  // Verificar rachas de todos los usuarios (ejecutar diariamente)
  static async checkAllStreaks() {
    try {
      const query = `
        SELECT id_usuario, racha_actual, ultimo_login 
        FROM usuario 
        WHERE racha_actual > 0
      `;
      const result = await pool.query(query);

      for (const user of result.rows) {
        if (!user.ultimo_login) {
          continue;
        }

        const lastActivity = new Date(user.ultimo_login);
        if (Number.isNaN(lastActivity.getTime())) {
          continue;
        }
        const now = new Date();
        const diffDays = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

        // Si pasó más de 1 día, resetear racha
        if (diffDays > 1) {
          await Racha.resetStreak(user.id_usuario);
          console.log(`Racha reseteada para usuario ${user.id_usuario}`);
        }
      }
    } catch (error) {
      console.error('Error verificando rachas:', error);
    }
  }
}

module.exports = RachaService;
