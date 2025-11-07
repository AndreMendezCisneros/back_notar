const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

module.exports = async function auth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'JWT secret not configured' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      return res.status(401).json({ message: 'Token inválido' });
    }

    const userId = decoded.id_usuario || decoded.id || decoded.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Token sin identificador de usuario' });
    }

    const user = await Usuario.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = {
      ...user,
      id: user.id_usuario
    };
    return next();
  } catch (error) {
    return res.status(500).json({ message: 'Error de autenticación', error: error.message });
  }
}


