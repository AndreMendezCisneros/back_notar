const { pool } = require('../config/database');

class Opcion {
  static async create({ contenido, es_correcta = false, id_pregunta }, options = {}) {
    const executor = options.client || pool;
    const availableColumns = await getColumns(executor);

    const columns = [];
    const values = [];

    if (availableColumns.includes('contenido')) {
      columns.push('contenido');
      values.push(contenido);
    }
    if (availableColumns.includes('es_correcta')) {
      columns.push('es_correcta');
      values.push(es_correcta);
    }
    if (availableColumns.includes('id_pregunta')) {
      columns.push('id_pregunta');
      values.push(id_pregunta);
    }

    const placeholders = columns.map((_, idx) => `$${idx + 1}`);

    const returning = ['id_opcion'];
    if (availableColumns.includes('contenido')) {
      returning.push('contenido');
    }
    if (availableColumns.includes('es_correcta')) {
      returning.push('es_correcta');
    }
    if (availableColumns.includes('id_pregunta')) {
      returning.push('id_pregunta');
    }

    const query = `
      INSERT INTO opcion (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING ${returning.join(', ')}
    `;

    const result = await executor.query(query, values);
    return result.rows[0];
  }
}

async function getColumns(executor) {
  if (!Opcion._columns) {
    const result = await executor.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'opcion'
    `);
    Opcion._columns = result.rows.map(row => row.column_name);
  }
  return Opcion._columns;
}

module.exports = Opcion;

