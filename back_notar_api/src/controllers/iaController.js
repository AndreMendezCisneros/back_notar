const axios = require('axios');

class IAController {
  // Generar nota con IA
  static async generateNota(req, res) {
    try {
      const { tema, contenido } = req.body;
      const id_usuario = req.user.id;

      // Petición a tu microservicio FastAPI
      const response = await axios.post('http://localhost:8000/api/v1/generate', {
        tema,
        contenido
      }, {
        timeout: 30000 // 30 segundos máximo
      });

      res.json({
        status: 'success',
        nota_generada: response.data
      });

    } catch (error) {
      console.error('Error llamando a IA:', error.message);
      res.status(500).json({ 
        error: 'Error al generar nota con IA',
        detalle: error.message
      });
    }
  }

  // Resumir nota
  static async summarize(req, res) {
    try {
      const { texto } = req.body;

      // Petición a tu microservicio FastAPI
      const response = await axios.post('http://localhost:8000/api/v1/summarize', {
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
      res.status(500).json({ 
        error: 'Error al resumir texto',
        detalle: error.message
      });
    }
  }
}

module.exports = IAController;
