const { pool } = require('../config/database');

class Racha {
  // Obtener racha actual
  static async getCurrentStreak(id_usuario) {
    const query = 'SELECT racha_actual FROM usuario WHERE id_usuario = $1';
    const result = await pool.query(query, [id_usuario]);
    return result.rows[0]?.racha_actual || 0;
  }

  // Actualizar racha (se llama cuando crea una nota)
  static async updateStreak(id_usuario) {
    // Verificar si ya creó nota hoy
    const checkQuery = `
      SELECT COUNT(*) as count FROM nota 
      WHERE id_usuario = $1 
      AND DATE(fecha_creacion) = CURRENT_DATE
    `;
    const checkResult = await pool.query(checkQuery, [id_usuario]);
    
    if (checkResult.rows[0].count > 0) {
      // Incrementar racha
      const updateQuery = `
        UPDATE usuario 
        SET racha_actual = racha_actual + 1 
        WHERE id_usuario = $1
        RETURNING racha_actual
      `;
      const result = await pool.query(updateQuery, [id_usuario]);
      return result.rows[0].racha_actual;
    }
    return await this.getCurrentStreak(id_usuario);
  }

  // Resetear racha si no hay actividad
  static async resetStreak(id_usuario) {
    const query = `
      UPDATE usuario 
      SET racha_actual = 0 
      WHERE id_usuario = $1
    `;
    await pool.query(query, [id_usuario]);
  }
}

module.exports = Racha;
