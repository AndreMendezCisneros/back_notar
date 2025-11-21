const { pool } = require('../config/database');

class Pregunta {
  static async create({ tipo, contenido, id_cuestionario }, options = {}) {
    const executor = options.client || pool;
    const availableColumns = await getColumns(executor);

    const columns = [];
    const values = [];

    if (availableColumns.includes('tipo')) {
      columns.push('tipo');
      values.push(tipo);
    }
    if (availableColumns.includes('contenido')) {
      columns.push('contenido');
      values.push(contenido);
    }
    if (availableColumns.includes('id_cuestionario')) {
      columns.push('id_cuestionario');
      values.push(id_cuestionario);
    }

    const placeholders = columns.map((_, idx) => `$${idx + 1}`);

    const returning = ['id_pregunta'];
    if (availableColumns.includes('tipo')) {
      returning.push('tipo');
    }
    if (availableColumns.includes('contenido')) {
      returning.push('contenido');
    }
    if (availableColumns.includes('id_cuestionario')) {
      returning.push('id_cuestionario');
    }

    const query = `
      INSERT INTO pregunta (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${returning.join(', ')}
    `;

    const result = await executor.query(query, values);
    return result.rows[0];
  }

  // Obtener pregunta por ID
  static async findById(id) {
    const query = `
      SELECT *
      FROM pregunta
      WHERE id_pregunta = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener todas las preguntas de un cuestionario
  static async findByCuestionario(id_cuestionario) {
    const query = `
      SELECT *
      FROM pregunta
      WHERE id_cuestionario = $1
      ORDER BY id_pregunta ASC
    `;
    const result = await pool.query(query, [id_cuestionario]);
    return result.rows;
  }
}

async function getColumns(executor) {
  if (!Pregunta._columns) {
    const result = await executor.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'pregunta'
    `);
    Pregunta._columns = result.rows.map(row => row.column_name);
  }
  return Pregunta._columns;
}

module.exports = Pregunta;

