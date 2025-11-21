const Cuestionario = require('../models/Cuestionario');
const Pregunta = require('../models/Pregunta');
const Opcion = require('../models/Opcion');
const Nota = require('../models/Nota');

class CuestionarioController {
  // Obtener todos los cuestionarios de una nota (con preguntas y opciones)
  static async getByNota(req, res) {
    try {
      const { id_nota } = req.params;
      const id_usuario = req.user.id || req.user.id_usuario;

      // Verificar que la nota existe y pertenece al usuario
      const nota = await Nota.findById(id_nota);
      if (!nota) {
        return res.status(404).json({ error: 'Nota no encontrada' });
      }

      // Verificar que la nota pertenece al usuario (o es admin/superadmin)
      if (nota.id_usuario !== id_usuario && req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
        return res.status(403).json({ error: 'No tienes permiso para acceder a esta nota' });
      }

      // Obtener cuestionarios
      const cuestionarios = await Cuestionario.findByNota(id_nota);

      // Para cada cuestionario, obtener sus preguntas y opciones
      const cuestionariosCompletos = await Promise.all(
        cuestionarios.map(async (cuestionario) => {
          const preguntas = await Pregunta.findByCuestionario(cuestionario.id_cuestionario);
          
          const preguntasCompletas = await Promise.all(
            preguntas.map(async (pregunta) => {
              const opciones = await Opcion.findByPregunta(pregunta.id_pregunta);
              return {
                ...pregunta,
                opciones
              };
            })
          );

          return {
            ...cuestionario,
            preguntas: preguntasCompletas
          };
        })
      );

      res.json({
        status: 'success',
        id_nota: parseInt(id_nota),
        cuestionarios: cuestionariosCompletos,
        count: cuestionariosCompletos.length
      });
    } catch (error) {
      console.error('Error obteniendo cuestionarios:', error);
      res.status(500).json({ error: 'Error al obtener cuestionarios' });
    }
  }

  // Obtener un cuestionario completo por ID (con preguntas y opciones)
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user.id || req.user.id_usuario;

      // Obtener cuestionario
      const cuestionario = await Cuestionario.findById(id);
      if (!cuestionario) {
        return res.status(404).json({ error: 'Cuestionario no encontrado' });
      }

      // Verificar que la nota pertenece al usuario
      const nota = await Nota.findById(cuestionario.id_nota);
      if (!nota) {
        return res.status(404).json({ error: 'Nota asociada no encontrada' });
      }

      if (nota.id_usuario !== id_usuario && req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este cuestionario' });
      }

      // Obtener preguntas con sus opciones
      const preguntas = await Pregunta.findByCuestionario(id);
      const preguntasCompletas = await Promise.all(
        preguntas.map(async (pregunta) => {
          const opciones = await Opcion.findByPregunta(pregunta.id_pregunta);
          return {
            ...pregunta,
            opciones
          };
        })
      );

      res.json({
        status: 'success',
        cuestionario: {
          ...cuestionario,
          preguntas: preguntasCompletas
        }
      });
    } catch (error) {
      console.error('Error obteniendo cuestionario:', error);
      res.status(500).json({ error: 'Error al obtener cuestionario' });
    }
  }

  // Obtener todas las preguntas de un cuestionario (con opciones)
  static async getPreguntasByCuestionario(req, res) {
    try {
      const { id_cuestionario } = req.params;
      const id_usuario = req.user.id || req.user.id_usuario;

      // Verificar que el cuestionario existe
      const cuestionario = await Cuestionario.findById(id_cuestionario);
      if (!cuestionario) {
        return res.status(404).json({ error: 'Cuestionario no encontrado' });
      }

      // Verificar que la nota pertenece al usuario
      const nota = await Nota.findById(cuestionario.id_nota);
      if (!nota) {
        return res.status(404).json({ error: 'Nota asociada no encontrada' });
      }

      if (nota.id_usuario !== id_usuario && req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
        return res.status(403).json({ error: 'No tienes permiso para acceder a este cuestionario' });
      }

      // Obtener preguntas con opciones
      const preguntas = await Pregunta.findByCuestionario(id_cuestionario);
      const preguntasCompletas = await Promise.all(
        preguntas.map(async (pregunta) => {
          const opciones = await Opcion.findByPregunta(pregunta.id_pregunta);
          return {
            ...pregunta,
            opciones
          };
        })
      );

      res.json({
        status: 'success',
        id_cuestionario: parseInt(id_cuestionario),
        preguntas: preguntasCompletas,
        count: preguntasCompletas.length
      });
    } catch (error) {
      console.error('Error obteniendo preguntas:', error);
      res.status(500).json({ error: 'Error al obtener preguntas' });
    }
  }

  // Obtener una pregunta por ID (con opciones)
  static async getPreguntaById(req, res) {
    try {
      const { id } = req.params;
      const id_usuario = req.user.id || req.user.id_usuario;

      // Obtener pregunta
      const pregunta = await Pregunta.findById(id);
      if (!pregunta) {
        return res.status(404).json({ error: 'Pregunta no encontrada' });
      }

      // Verificar permisos a través del cuestionario y nota
      const cuestionario = await Cuestionario.findById(pregunta.id_cuestionario);
      if (!cuestionario) {
        return res.status(404).json({ error: 'Cuestionario asociado no encontrado' });
      }

      const nota = await Nota.findById(cuestionario.id_nota);
      if (!nota) {
        return res.status(404).json({ error: 'Nota asociada no encontrada' });
      }

      if (nota.id_usuario !== id_usuario && req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
        return res.status(403).json({ error: 'No tienes permiso para acceder a esta pregunta' });
      }

      // Obtener opciones
      const opciones = await Opcion.findByPregunta(id);

      res.json({
        status: 'success',
        pregunta: {
          ...pregunta,
          opciones
        }
      });
    } catch (error) {
      console.error('Error obteniendo pregunta:', error);
      res.status(500).json({ error: 'Error al obtener pregunta' });
    }
  }
}

module.exports = CuestionarioController;

