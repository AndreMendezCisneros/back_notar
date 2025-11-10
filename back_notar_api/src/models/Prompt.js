const { pool } = require('../config/database');

class Prompt {
  // Obtener el prompt activo (más reciente)
  static async getActive() {
    const query = `
      SELECT id_version, numero_version, descripcion, contenido_prompt, fecha_creacion
      FROM prompt_version
      ORDER BY fecha_creacion DESC, id_version DESC
      LIMIT 1
    `;
    const result = await pool.query(query);
    return result.rows[0] || null;
  }

  // Obtener todos los prompts
  static async getAll() {
    const query = `
      SELECT id_version, numero_version, descripcion, contenido_prompt, fecha_creacion
      FROM prompt_version
      ORDER BY fecha_creacion DESC, id_version DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener prompt por ID
  static async findById(id) {
    const query = `
      SELECT id_version, numero_version, descripcion, contenido_prompt, fecha_creacion
      FROM prompt_version
      WHERE id_version = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Crear nueva versión de prompt
  static async create({ numero_version, descripcion, contenido_prompt, id_version = null }) {
    // Si id_version es proporcionado, lo usamos; si no, la BD lo generará (si tiene DEFAULT)
    // En Supabase, las columnas VARCHAR PK suelen tener gen_random_uuid() como DEFAULT
    let query;
    let values;
    
    if (id_version) {
      query = `
        INSERT INTO prompt_version (id_version, numero_version, descripcion, contenido_prompt, fecha_creacion)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING id_version, numero_version, descripcion, contenido_prompt, fecha_creacion
      `;
      values = [id_version, numero_version, descripcion, contenido_prompt];
    } else {
      // Insertar sin id_version - la BD lo generará si tiene DEFAULT
      query = `
        INSERT INTO prompt_version (numero_version, descripcion, contenido_prompt, fecha_creacion)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING id_version, numero_version, descripcion, contenido_prompt, fecha_creacion
      `;
      values = [numero_version, descripcion, contenido_prompt];
    }
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Actualizar prompt (crear nueva versión en lugar de modificar existente)
  // Por inmutabilidad, no permitimos UPDATE directo
  // En su lugar, se crea una nueva versión
}

module.exports = Prompt;

