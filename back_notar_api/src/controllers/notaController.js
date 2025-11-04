const Nota = require('../models/Nota');
const Racha = require('../models/Racha');

class NotaController {
  // Crear nota
  static async createNota(req, res) {
    try {
      const { titulo, contenido, tipo_fuente, id_tema, id_documento } = req.body;
      const id_usuario = req.user.id;

      const nuevaNota = await Nota.create(
        titulo,
        contenido,
        tipo_fuente,
        id_tema,
        id_usuario,
        id_documento
      );

      // Actualizar racha
      const nuevaRacha = await Racha.updateStreak(id_usuario);

      res.status(201).json({
        message: 'Nota creada exitosamente',
        nota: nuevaNota,
        racha_actual: nuevaRacha
      });
    } catch (error) {
      console.error('Error creando nota:', error);
      res.status(500).json({ error: 'Error al crear nota' });
    }
  }

  // Obtener nota por ID
  static async getNota(req, res) {
    try {
      const { id } = req.params;
      const nota = await Nota.findById(id);

      if (!nota) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }

      res.json({ nota });
    } catch (error) {
      console.error('Error obteniendo nota:', error);
      res.status(500).json({ error: 'Error al obtener nota' });
    }
  }

  // Obtener notas del usuario
  static async getNotasByUser(req, res) {
    try {
      const id_usuario = req.user.id;
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const notas = await Nota.findByUsuario(id_usuario, limit, offset);

      res.json({
        notas,
        count: notas.length,
        limit,
        offset
      });
    } catch (error) {
      console.error('Error obteniendo notas:', error);
      res.status(500).json({ error: 'Error al obtener notas' });
    }
  }

  // Obtener notas más buscadas
  static async getMasBuscadas(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const notas = await Nota.getMasBuscadas(limit);

      res.json({ notas_mas_buscadas: notas });
    } catch (error) {
      console.error('Error obteniendo notas más buscadas:', error);
      res.status(500).json({ error: 'Error al obtener notas' });
    }
  }
}

module.exports = NotaController;
