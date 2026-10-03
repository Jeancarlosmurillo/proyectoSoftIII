const express = require('express');
const cors = require('cors');
const casosRoutes = require('./routes/casos');
const areasRoutes = require('./routes/areas');
const categoriasRoutes = require('./routes/categorias');
const usuariosRoutes = require('./routes/usuarios');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/casos', casosRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/usuarios', usuariosRoutes);

module.exports = app;
