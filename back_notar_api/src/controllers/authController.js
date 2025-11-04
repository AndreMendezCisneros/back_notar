const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

class AuthController {
  static async register(req, res) {
    try {
      const { email, nombre, password } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await Usuario.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Este email ya está registrado.' });
      }

      // Crear el nuevo usuario
      const newUser = await Usuario.create(email, nombre, password);

      // Generar token - IMPORTANTE: expiresIn debe ser un STRING
      const token = jwt.sign(
        { id: newUser.id_usuario, email: newUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }  // ← ESTO DEBE SER UN STRING, NO process.env.JWT_EXPIRES_IN
      );

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: newUser,
        token
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await Usuario.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValid = await Usuario.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar token
      const token = jwt.sign(
        { id: user.id_usuario, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }  // ← MISMO AQUÍ
      );

      res.json({
        message: 'Login exitoso',
        user: {
          id: user.id_usuario,
          email: user.email,
          nombre: user.nombre
        },
        token
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
}

module.exports = AuthController;
