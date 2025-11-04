const { pool } = require('../config/database');

class Nota {
  // Crear nota (sin opción de editar después)
  static async create(titulo, contenido, tipo_fuente, id_tema, id_usuario, id_documento = null) {
    const query = `
      INSERT INTO nota (titulo, contenido, tipo_fuente, id_tema, id_usuario, id_documento, estado)
      VALUES ($1, $2, $3, $4, $5, $6, 'publicado')
      RETURNING id_nota, titulo, contenido, fecha_creacion, id_usuario
    `;
    const result = await pool.query(query, [titulo, contenido, tipo_fuente, id_tema, id_usuario, id_documento]);
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
