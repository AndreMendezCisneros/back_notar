const { pool } = require('../config/database');

class Nota {
  static async getAvailableColumns(executor = pool) {
    if (!this._notaColumnsCache) {
      const query = `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'nota'
      `;
      const result = await executor.query(query);
      this._notaColumnsCache = result.rows.map(row => row.column_name);
    }
    return this._notaColumnsCache;
  }

  // Crear nota (sin opción de editar después)
  static async create({ titulo, contenido, tipo_fuente, id_tema, id_usuario, id_documento = null, id_prompt = null }, options = {}) {
    const executor = options.client || pool;
    const availableColumns = await Nota.getAvailableColumns(executor);

    const insertColumns = ['titulo', 'contenido', 'tipo_fuente', 'id_usuario'];
    const values = [titulo, contenido, tipo_fuente || 'texto', id_usuario];

    if (availableColumns.includes('id_tema')) {
      insertColumns.push('id_tema');
      values.push(id_tema ?? null);
    }

    if (availableColumns.includes('id_documento')) {
      insertColumns.push('id_documento');
      values.push(id_documento ?? null);
    }

    if (availableColumns.includes('id_prompt')) {
      insertColumns.push('id_prompt');
      values.push(id_prompt ?? null);
    }

    if (availableColumns.includes('estado')) {
      insertColumns.push('estado');
      values.push('publicado');
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`);

    const returningColumns = ['id_nota', 'titulo', 'contenido', 'fecha_creacion', 'id_usuario'];
    if (availableColumns.includes('id_tema')) {
      returningColumns.push('id_tema');
    }
    if (availableColumns.includes('id_prompt')) {
      returningColumns.push('id_prompt');
    }
    if (availableColumns.includes('id_documento')) {
      returningColumns.push('id_documento');
    }

    const query = `
      INSERT INTO nota (${insertColumns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${returningColumns.join(', ')}
    `;

    const result = await executor.query(query, values);
    return result.rows[0];
  }

  // Obtener por ID
  static async findById(id) {
    const query = `
      SELECT n.*, t.nombre as tema_nombre, u.nombre as usuario_nombre
      FROM nota n
      LEFT JOIN tema t ON n.id_tema = t.id_tema
      LEFT JOIN usuario u ON n.id_usuario = u.id_usuario
      WHERE n.id_nota = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener notas de un usuario
  static async findByUsuario(id_usuario, limit = 50, offset = 0) {
    const query = `
      SELECT n.id_nota, n.titulo, n.contenido, n.fecha_creacion, t.nombre as tema
      FROM nota n
      LEFT JOIN tema t ON n.id_tema = t.id_tema
      WHERE n.id_usuario = $1
      ORDER BY n.fecha_creacion DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await pool.query(query, [id_usuario, limit, offset]);
    return result.rows;
  }

  // Obtener notas más buscadas
  static async getMasBuscadas(limit = 10) {
    const query = `
      SELECT t.id_tema, t.nombre, t.num_busquedas, t.num_notas
      FROM tema t
      ORDER BY t.num_busquedas DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // NO hay métodos update() ni delete() - por diseño
}

module.exports = Nota;
