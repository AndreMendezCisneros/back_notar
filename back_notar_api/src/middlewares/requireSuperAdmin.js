// Middleware para verificar que el usuario sea superadmin
module.exports = function requireSuperAdmin(req, res, next) {
  try {
    // req.user debe estar disponible (después de auth middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (req.user.rol !== 'superadmin') {
      return res.status(403).json({ 
        error: 'Acceso denegado. Se requiere rol de super administrador.' 
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Error al verificar permisos' });
  }
};

