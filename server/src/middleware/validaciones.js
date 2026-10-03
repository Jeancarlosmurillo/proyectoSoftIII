const validarCaso = (req, res, next) => {
  const { tipo, titulo, descripcion, prioridad } = req.body;
  const errores = [];

  if (!tipo || !['Incidente', 'Solicitud'].includes(tipo)) {
    errores.push('Tipo debe ser Incidente o Solicitud');
  }
  if (!titulo || titulo.trim() === '') {
    errores.push('Título es obligatorio');
  }
  if (!descripcion || descripcion.length < 10) {
    errores.push('Descripción debe tener al menos 10 caracteres');
  }
  if (!prioridad || !['P1', 'P2', 'P3'].includes(prioridad)) {
    errores.push('Prioridad debe ser P1, P2 o P3');
  }

  if (errores.length > 0) {
    return res.status(400).json({ errores });
  }

  next();
};

module.exports = { validarCaso };
