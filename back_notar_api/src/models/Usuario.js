const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {
  // Crear usuario
  static async create(email, nombre, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO usuario (email, nombre, password_hash, rol, estado)
      VALUES ($1, $2, $3, 'estudiante', 'activo')
      RETURNING id_usuario, email, nombre, rol, racha_actual, created_at
    `;
    const result = await pool.query(query, [email, nombre, passwordHash]);
    return result.rows[0];
  }

  // Buscar por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(id) {
    const query = `
      SELECT id_usuario, email, nombre, rol, estado, racha_actual, 
             ultimo_login, created_at
      FROM usuario WHERE id_usuario = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar último login
  static async updateLastLogin(id) {
    const query = `
      UPDATE usuario 
      SET ultimo_login = CURRENT_TIMESTAMP 
      WHERE id_usuario = $1
    `;
    await pool.query(query, [id]);
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Usuario;
