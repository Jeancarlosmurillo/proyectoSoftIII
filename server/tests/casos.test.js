const request = require('supertest');
const app = require('../src/app');

describe('POST /api/casos', () => {
  test('CP-01: Crear incidente válido', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Wi-Fi no funciona',
        descripcion: 'No puedo conectarme al Wi-Fi institucional desde el edificio A',
        prioridad: 'P1',
        usuario_id: 1,
        categoria_id: 7
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.estado).toBe('Pendiente');
    expect(res.body.tipo).toBe('Incidente');
  });

  test('CP-02: Crear solicitud válida', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Solicitud',
        titulo: 'Instalar Visual Studio',
        descripcion: 'Necesito que instalen Visual Studio en mi equipo institucional',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 4
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.tipo).toBe('Solicitud');
  });

  test('CP-03: Rechazar sin descripción válida', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Wi-Fi',
        descripcion: 'Corta',
        prioridad: 'P1',
        usuario_id: 1,
        categoria_id: 7
      });

    expect(res.status).toBe(400);
    expect(res.body.errores).toContain('Descripción debe tener al menos 10 caracteres');
  });

  test('Rechazar tipo inválido', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Reclamo',
        titulo: 'Problema',
        descripcion: 'Descripción suficientemente larga',
        prioridad: 'P1',
        usuario_id: 1,
        categoria_id: 7
      });

    expect(res.status).toBe(400);
  });

  test('Rechazar prioridad inválida', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Problema',
        descripcion: 'Descripción suficientemente larga',
        prioridad: 'P5',
        usuario_id: 1,
        categoria_id: 7
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/casos', () => {
  test('Listar todos los casos', async () => {
    const res = await request(app).get('/api/casos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Filtrar por estado', async () => {
    const res = await request(app).get('/api/casos?estado=Pendiente');
    expect(res.status).toBe(200);
    res.body.forEach(caso => {
      expect(caso.estado).toBe('Pendiente');
    });
  });

  test('Filtrar por tipo', async () => {
    const res = await request(app).get('/api/casos?tipo=Incidente');
    expect(res.status).toBe(200);
    res.body.forEach(caso => {
      expect(caso.tipo).toBe('Incidente');
    });
  });
});

describe('PATCH /api/casos/:id/estado', () => {
  test('Transición válida de estado', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test transición',
        descripcion: 'Descripción de prueba para transición',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 7
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En analisis', usuario_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En analisis');
  });

  test('Transición inválida de estado', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test inválida',
        descripcion: 'Descripción de prueba para transición inválida',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 7
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'Cerrada', usuario_id: 2 });

    expect(res.status).toBe(400);
  });
});
