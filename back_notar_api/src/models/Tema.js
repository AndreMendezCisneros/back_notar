const { pool } = require('../config/database');

class Tema {
  static async findByNombre(nombre, options = {}) {
    const executor = options.client || pool;
    const query = `
      SELECT * FROM tema
      WHERE LOWER(nombre) = LOWER($1)
      LIMIT 1
    `;
    const result = await executor.query(query, [nombre]);
    return result.rows[0] || null;
  }

  static async create(nombre, descripcion = null, options = {}) {
    const executor = options.client || pool;
    const query = `
      INSERT INTO tema (nombre, descripcion)
      VALUES ($1, $2)
      RETURNING id_tema, nombre
    `;
    const result = await executor.query(query, [nombre, descripcion]);
    return result.rows[0];
  }

  static async findOrCreateByNombre({ nombre, descripcion = null }, options = {}) {
    const executor = options.client || pool;
    const existing = await this.findByNombre(nombre, { client: executor });
    if (existing) {
      return existing;
    }
    return await this.create(nombre, descripcion, { client: executor });
  }
}

module.exports = Tema;
