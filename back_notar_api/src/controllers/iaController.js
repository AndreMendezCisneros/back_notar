const axios = require('axios');
const { pool } = require('../config/database');
const Nota = require('../models/Nota');
const Cuestionario = require('../models/Cuestionario');
const Pregunta = require('../models/Pregunta');
const Opcion = require('../models/Opcion');
const Racha = require('../models/Racha');

const IA_SERVICE_URL = process.env.IA_SERVICE_URL || 'http://localhost:8000';

class IAController {
  // Generar nota con IA
  static async generateNota(req, res) {
    try {
      const { tema, contenido = '', titulo, id_tema = null } = req.body;
      const persist = req.body.persist === false ? false : true;
      const id_usuario = req.user.id || req.user.id_usuario;

      if (!tema) {
        return res.status(400).json({ error: 'tema es obligatorio' });
      }

      // Petición a tu microservicio FastAPI
      const response = await axios.post(`${IA_SERVICE_URL}/api/v1/generate`, {
        tema,
        contenido
      }, {
        timeout: 60000 // 60 segundos máximo para IA
      });

      const payload = response.data?.data || response.data?.nota || response.data;
      const notaGenerada = payload?.nota || {};
      const cuestionariosGenerados = payload?.cuestionarios || payload?.cuestionario || [];

      if (!notaGenerada?.contenido) {
        return res.status(502).json({
          error: 'La IA no devolvió contenido utilizable',
          detalle: payload
        });
      }

      let notaPersistida = null;
      let cuestionariosPersistidos = [];

      if (persist) {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const tituloNota = (titulo || notaGenerada.titulo || tema || 'Nota generada por IA').toString().trim();
          const contenidoNota = (notaGenerada.contenido || '').toString().trim();

          if (!contenidoNota) {
            throw new Error('La IA no devolvió contenido para la nota');
          }

          notaPersistida = await Nota.create({
            titulo: tituloNota,
            contenido: contenidoNota,
            tipo_fuente: 'ia',
            id_tema,
            id_usuario,
            id_documento: null,
            id_prompt: null
          }, { client });

          for (const [indexCuestionario, cuestionario] of (Array.isArray(cuestionariosGenerados) ? cuestionariosGenerados : []).entries()) {
            const cuestionarioTitulo = (cuestionario?.titulo || `Cuestionario ${indexCuestionario + 1}`).toString().trim();
            const cuestionarioDescripcionRaw = cuestionario?.descripcion ?? cuestionario?.contenido ?? null;
            const cuestionarioDescripcion = cuestionarioDescripcionRaw == null
              ? null
              : cuestionarioDescripcionRaw.toString().trim() || null;

            const cuestionarioDB = await Cuestionario.create({
              titulo: cuestionarioTitulo,
              contenido: cuestionarioDescripcion,
              id_nota: notaPersistida.id_nota
            }, { client });

            const preguntasPersistidas = [];
            for (const [indexPregunta, pregunta] of (Array.isArray(cuestionario?.preguntas) ? cuestionario.preguntas : []).entries()) {
              const contenidoPregunta = (pregunta?.contenido || pregunta?.enunciado || `Pregunta ${indexPregunta + 1}`).toString().trim();
              const tipoPregunta = (pregunta?.tipo || 'seleccion_multiple').toString().trim();

              const preguntaDB = await Pregunta.create({
                tipo: tipoPregunta,
                contenido: contenidoPregunta,
                id_cuestionario: cuestionarioDB.id_cuestionario
              }, { client });

              const opcionesPersistidas = [];
              for (const [indexOpcion, opcion] of (Array.isArray(pregunta?.opciones) ? pregunta.opciones : []).entries()) {
                const contenidoOpcion = (opcion?.contenido || opcion?.texto || `Opción ${indexOpcion + 1}`).toString().trim();
                const esCorrecta = Boolean(opcion?.es_correcta);

                const opcionDB = await Opcion.create({
                  contenido: contenidoOpcion,
                  es_correcta: esCorrecta,
                  id_pregunta: preguntaDB.id_pregunta
                }, { client });

                opcionesPersistidas.push(opcionDB);
              }

              preguntasPersistidas.push({
                ...preguntaDB,
                opciones: opcionesPersistidas
              });
            }

            cuestionariosPersistidos.push({
              ...cuestionarioDB,
              preguntas: preguntasPersistidas
            });
          }

          await Racha.updateStreak(id_usuario);

          await client.query('COMMIT');
        } catch (persistError) {
          await client.query('ROLLBACK');
          console.error('Error persistiendo nota generada:', persistError);
          return res.status(500).json({
            error: 'Error al guardar la nota generada',
            detalle: persistError.message
          });
        } finally {
          client.release();
        }
      }

      res.json({
        status: 'success',
        data: payload,
        persisted: persist,
        nota_persistida: notaPersistida,
        cuestionarios_persistidos: cuestionariosPersistidos
      });

    } catch (error) {
      console.error('Error llamando a IA:', error.message);
      res.status(error.response?.status || 500).json({ 
        error: 'Error al generar nota con IA',
        detalle: error.response?.data || error.message
      });
    }
  }

  // Resumir nota
  static async summarize(req, res) {
    try {
      const { texto } = req.body;

      // Petición a tu microservicio FastAPI
      const response = await axios.post(`${IA_SERVICE_URL}/api/v1/summarize`, {
        texto
      }, {
        timeout: 30000
      });

      res.json({
        status: 'success',
        resumen: response.data
      });

    } catch (error) {
      console.error('Error resumiendo:', error.message);
      res.status(error.response?.status || 500).json({ 
        error: 'Error al resumir texto',
        detalle: error.response?.data || error.message
      });
    }
  }
}

module.exports = IAController;
