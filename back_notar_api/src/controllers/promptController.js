const Prompt = require('../models/Prompt');

class PromptController {
  // Obtener prompt activo (público, cualquier usuario autenticado puede ver)
  static async getActive(req, res) {
    try {
      const prompt = await Prompt.getActive();
      
      if (!prompt) {
        return res.status(404).json({ 
          error: 'No hay ningún prompt configurado en el sistema' 
        });
      }

      res.json({
        status: 'success',
        data: prompt
      });
    } catch (error) {
      console.error('Error obteniendo prompt activo:', error);
      
      // Manejar errores específicos de la base de datos
      if (error.code === '42P01') {
        return res.status(500).json({ 
          error: 'La tabla "prompt_version" no existe en la base de datos. Ejecuta el script SQL para crear la tabla.',
          detalle: 'Tabla no encontrada. Verifica que la migración SQL haya sido ejecutada.'
        });
      }
      
      res.status(500).json({ 
        error: 'Error al obtener prompt activo',
        detalle: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener todos los prompts (solo superadmin)
  static async getAll(req, res) {
    try {
      const prompts = await Prompt.getAll();
      
      res.json({
        status: 'success',
        data: prompts,
        count: prompts.length
      });
    } catch (error) {
      console.error('Error obteniendo prompts:', error);
      
      if (error.code === '42P01') {
        return res.status(500).json({ 
          error: 'La tabla "prompt" no existe en la base de datos. Ejecuta el script SQL para crear la tabla.',
          detalle: 'Tabla no encontrada. Verifica que la migración SQL haya sido ejecutada.'
        });
      }
      
      res.status(500).json({ 
        error: 'Error al obtener prompts',
        detalle: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Obtener prompt por ID (solo superadmin)
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const prompt = await Prompt.findById(id);
      
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt no encontrado' });
      }

      res.json({
        status: 'success',
        data: prompt
      });
    } catch (error) {
      console.error('Error obteniendo prompt:', error);
      
      if (error.code === '42P01') {
        return res.status(500).json({ 
          error: 'La tabla "prompt" no existe en la base de datos. Ejecuta el script SQL para crear la tabla.',
          detalle: 'Tabla no encontrada. Verifica que la migración SQL haya sido ejecutada.'
        });
      }
      
      res.status(500).json({ 
        error: 'Error al obtener prompt',
        detalle: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }

  // Crear nueva versión de prompt (solo superadmin)
  static async create(req, res) {
    try {
      const { numero_version, descripcion, contenido_prompt } = req.body;

      // Validaciones
      if (!numero_version || !contenido_prompt) {
        return res.status(400).json({ 
          error: 'numero_version y contenido_prompt son obligatorios' 
        });
      }

      if (numero_version.length > 50) {
        return res.status(400).json({ 
          error: 'numero_version no puede exceder 50 caracteres' 
        });
      }

      if (!contenido_prompt.trim()) {
        return res.status(400).json({ 
          error: 'contenido_prompt no puede estar vacío' 
        });
      }

      const newPrompt = await Prompt.create({
        numero_version,
        descripcion: descripcion || null,
        contenido_prompt
      });

      res.status(201).json({
        status: 'success',
        message: 'Nueva versión de prompt creada exitosamente',
        data: newPrompt
      });
    } catch (error) {
      console.error('Error creando prompt:', error);
      
      // Manejar errores específicos de la base de datos
      if (error.code === '42P01') {
        return res.status(500).json({ 
          error: 'La tabla "prompt_version" no existe en la base de datos. Ejecuta el script SQL para crear la tabla.',
          detalle: 'Tabla no encontrada. Verifica que la migración SQL haya sido ejecutada.'
        });
      }
      
      if (error.code && error.code.startsWith('42')) {
        return res.status(400).json({ 
          error: 'Error de base de datos',
          detalle: error.message || 'Error al ejecutar la consulta'
        });
      }
      
      res.status(500).json({ 
        error: 'Error al crear prompt',
        detalle: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  }
}

module.exports = PromptController;

