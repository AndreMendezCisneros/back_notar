const { pool } = require('../config/database');

class Cuestionario {
  static async create({ titulo, contenido, id_nota }, options = {}) {
    const executor = options.client || pool;
    const { columns, placeholders, values, returning } = buildInsertQuery(
      ['titulo', 'contenido', 'id_nota'],
      [titulo, contenido, id_nota],
      await getColumns(executor)
    );

    const query = `
      INSERT INTO cuestionario (${columns})
      VALUES (${placeholders})
      RETURNING ${returning}
    `;
    const result = await executor.query(query, values);
    return result.rows[0];
  }

  // Obtener cuestionario por ID
  static async findById(id) {
    const query = `
      SELECT *
      FROM cuestionario
      WHERE id_cuestionario = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener todos los cuestionarios de una nota
  static async findByNota(id_nota) {
    const query = `
      SELECT *
      FROM cuestionario
      WHERE id_nota = $1
      ORDER BY fecha_creacion ASC
    `;
    const result = await pool.query(query, [id_nota]);
    return result.rows;
  }
}

async function getColumns(executor) {
  if (!Cuestionario._columns) {
    const result = await executor.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'cuestionario'
    `);
    Cuestionario._columns = result.rows.map(row => row.column_name);
  }
  return Cuestionario._columns;
}

function buildInsertQuery(baseColumns, baseValues, availableColumns) {
  const columns = [];
  const values = [];

  baseColumns.forEach((column, index) => {
    if (availableColumns.includes(column)) {
      columns.push(column);
      values.push(baseValues[index]);
    }
  });

  const placeholders = columns.map((_, idx) => `$${idx + 1}`);

  const returning = ['id_cuestionario', 'titulo'];
  if (availableColumns.includes('contenido')) {
    returning.push('contenido');
  }
  if (availableColumns.includes('id_nota')) {
    returning.push('id_nota');
  }

  return {
    columns: columns.join(', '),
    placeholders: placeholders.join(', '),
    values,
    returning: returning.join(', ')
  };
}

module.exports = Cuestionario;

