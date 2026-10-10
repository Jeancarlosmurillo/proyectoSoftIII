const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/database');

beforeAll(async () => {
  await db.query(`INSERT INTO area (nombre, descripcion) VALUES ('Hardware', 'Equipos') ON CONFLICT (nombre) DO NOTHING`);
  await db.query(`INSERT INTO area (nombre, descripcion) VALUES ('Software', 'Aplicaciones') ON CONFLICT (nombre) DO NOTHING`);
  await db.query(`INSERT INTO categoria (area_id, nombre, descripcion) SELECT id, 'Computador', 'Equipo' FROM area WHERE nombre = 'Hardware' ON CONFLICT (nombre) DO NOTHING`);
  await db.query(`INSERT INTO categoria (area_id, nombre, descripcion) SELECT id, 'Wi-Fi', 'Red' FROM area WHERE nombre = 'Hardware' ON CONFLICT (nombre) DO NOTHING`);
  await db.query(`INSERT INTO categoria (area_id, nombre, descripcion) SELECT id, 'Instalación', 'Instalación' FROM area WHERE nombre = 'Software' ON CONFLICT (nombre) DO NOTHING`);
  await db.query(`INSERT INTO usuario (nombre, correo, rol) VALUES ('Ana', 'ana@test.com', 'solicitante') ON CONFLICT (correo) DO NOTHING`);
  await db.query(`INSERT INTO usuario (nombre, correo, rol) VALUES ('Carlos', 'carlos@test.com', 'agente') ON CONFLICT (correo) DO NOTHING`);
  await db.query(`INSERT INTO usuario (nombre, correo, rol) VALUES ('Maria', 'maria@test.com', 'validador') ON CONFLICT (correo) DO NOTHING`);
  await db.query(`INSERT INTO usuario (nombre, correo, rol) VALUES ('Pedro', 'pedro@test.com', 'administrador') ON CONFLICT (correo) DO NOTHING`);
});

afterAll(async () => {
  await db.pool.end();
});

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
        categoria_id: 1
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
        categoria_id: 3
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.tipo).toBe('Solicitud');
  });

  test('CP-03: Rechazar descripción menor a 10 caracteres', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Wi-Fi',
        descripcion: 'Corta',
        prioridad: 'P1',
        usuario_id: 1,
        categoria_id: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('DATOS_INVALIDOS');
    expect(res.body.mensaje).toContain('descripcion');
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
        categoria_id: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('DATOS_INVALIDOS');
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
        categoria_id: 1
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('DATOS_INVALIDOS');
  });

  test('Rechazar categoría inexistente', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Problema',
        descripcion: 'Descripción suficientemente larga',
        prioridad: 'P1',
        usuario_id: 1,
        categoria_id: 9999
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('CATEGORIA_INVALIDA');
  });
});

describe('GET /api/casos', () => {
  test('Listar todos los casos', async () => {
    const res = await request(app).get('/api/casos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Filtrar por estado (HU-03)', async () => {
    const res = await request(app).get('/api/casos?estado=Pendiente');
    expect(res.status).toBe(200);
    res.body.forEach(caso => {
      expect(caso.estado).toBe('Pendiente');
    });
  });

  test('Filtrar por solicitante (HU-02)', async () => {
    const res = await request(app).get('/api/casos?usuario_id=1');
    expect(res.status).toBe(200);
    res.body.forEach(caso => {
      expect(caso.usuario_id).toBe(1);
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

describe('GET /api/casos/:id', () => {
  test('Obtener detalle de caso (HU-12)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test detalle',
        descripcion: 'Descripción de prueba para detalle',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;
    const res = await request(app).get(`/api/casos/${casoId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(casoId);
    expect(res.body.titulo).toBe('Test detalle');
  });

  test('Retornar 404 si caso no existe', async () => {
    const res = await request(app).get('/api/casos/99999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NO_ENCONTRADO');
  });
});

describe('GET /api/casos/:id/historial', () => {
  test('Obtener historial en orden cronológico (HU-08)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test historial',
        descripcion: 'Descripción de prueba para historial',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En análisis', usuario_id: 2 });

    const res = await request(app).get(`/api/casos/${casoId}/historial`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0].evento).toBe('Caso creado');
    expect(res.body[1].evento).toBe('Cambio de estado');
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
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En análisis', usuario_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En análisis');
  });

  test('CP-05: Transición inválida retorna 409', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test inválida',
        descripcion: 'Descripción de prueba para transición inválida',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'Cerrada', usuario_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('TRANSICION_INVALIDA');
  });

  test('CP-04: Historial se crea en la misma transacción', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test CP-04',
        descripcion: 'Descripción de prueba para transacción',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En análisis', usuario_id: 2 });

    const histRes = await request(app).get(`/api/casos/${casoId}/historial`);
    const cambioEvento = histRes.body.find(h => h.evento === 'Cambio de estado');

    expect(cambioEvento).toBeDefined();
    expect(cambioEvento.estado_anterior).toBe('Pendiente');
    expect(cambioEvento.estado_nuevo).toBe('En análisis');
  });

  test('Rechazar cambio de estado por solicitante (403)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test 403',
        descripcion: 'Descripción de prueba para permiso',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En análisis', usuario_id: 1 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('SIN_PERMISO');
  });

  test('Rechazar cambio de estado en caso cerrado (409)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test cerrado',
        descripcion: 'Descripción de prueba para caso cerrado',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    await db.query(
      `INSERT INTO atencion (caso_id, diagnostico, solucion, agente_id) VALUES ($1, $2, $3, $4)`,
      [casoId, 'Falla de red', 'Reinicio de router', 2]
    );

    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'Cerrada', usuario_id: 2 });

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En análisis', usuario_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ESTADO_CONFLICTO');
  });
});
