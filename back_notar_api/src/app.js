const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(helmet()); // Seguridad
app.use(cors()); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON
app.use(express.urlencoded({ extended: true }));

// Rutas
const authRoutes = require('./routes/auth.routes');
const notaRoutes = require('./routes/nota.routes');
const iaRoutes = require('./routes/ia.routes');
const promptRoutes = require('./routes/prompt.routes');
const cuestionarioRoutes = require('./routes/cuestionario.routes');

app.use('/api/auth', authRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/cuestionarios', cuestionarioRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
