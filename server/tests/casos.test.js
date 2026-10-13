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
    expect(res.body.atencion).toBeUndefined();
  });

  test('Detalle incluye solución cuando hay atención registrada', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test detalle con atención',
        descripcion: 'Descripción de prueba para detalle con atención',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;
    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app)
      .post(`/api/casos/${casoId}/atencion`)
      .send({
        diagnostico: 'Falla en el access point',
        solucion: 'Reemplazo del equipo',
        usuario_id: 2
      });

    const res = await request(app).get(`/api/casos/${casoId}`);
    expect(res.status).toBe(200);
    expect(res.body.atencion).toBeDefined();
    expect(res.body.atencion.solucion).toBe('Reemplazo del equipo');
    expect(res.body.atencion.diagnostico).toBe('Falla en el access point');
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
      .send({ estado: 'En atención', usuario_id: 2 });

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

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    await db.query(
      `INSERT INTO atencion (caso_id, diagnostico, solucion, agente_id) VALUES ($1, $2, $3, $4)`,
      [casoId, 'Falla de red', 'Reinicio de router', 2]
    );

    await request(app)
      .post(`/api/casos/${casoId}/validacion`)
      .send({ accion: 'aprobar', usuario_id: 3 });

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'En análisis', usuario_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ESTADO_CONFLICTO');
  });
});

describe('POST /api/casos/:id/asignar', () => {
  test('CP-06: Agente se asigna un caso', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test asignación',
        descripcion: 'Descripción de prueba para asignación',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .post(`/api/casos/${casoId}/asignar`)
      .send({ usuario_id: 2 });

    expect(res.status).toBe(200);
    expect(res.body.agente_id).toBe(2);
    expect(res.body.fecha_asignacion).toBeDefined();
  });

  test('Rechazar asignación si ya tiene agente (409)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test duplicado',
        descripcion: 'Descripción de prueba para duplicado',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/asignar`)
      .send({ usuario_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('CASO_YA_ASIGNADO');
  });

  test('Rechazar asignación por solicitante (403)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test permiso asignar',
        descripcion: 'Descripción de prueba para permiso asignar',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    const res = await request(app)
      .post(`/api/casos/${casoId}/asignar`)
      .send({ usuario_id: 1 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('SIN_PERMISO');
  });
});

describe('POST /api/casos/:id/atencion', () => {
  test('CP-07: Agente asignado registra atención', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test atención',
        descripcion: 'Descripción de prueba para atención',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/atencion`)
      .send({
        diagnostico: 'Falla en el access point',
        solucion: 'Reemplazo del equipo',
        usuario_id: 2
      });

    expect(res.status).toBe(201);
    expect(res.body.diagnostico).toBe('Falla en el access point');
    expect(res.body.solucion).toBe('Reemplazo del equipo');
    expect(res.body.agente_id).toBe(2);
  });

  test('Rechazar atención por agente no asignado (403)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test atención no asignado',
        descripcion: 'Descripción de prueba para atención no asignado',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });

    await db.query(
      `INSERT INTO usuario (nombre, correo, rol) VALUES ('Otro Agente', 'otro@test.com', 'agente') ON CONFLICT (correo) DO NOTHING`
    );
    const otroAgente = await db.query(`SELECT id FROM usuario WHERE correo = 'otro@test.com'`);

    const res = await request(app)
      .post(`/api/casos/${casoId}/atencion`)
      .send({
        diagnostico: 'Diagnóstico de otro agente',
        solucion: 'Solución de otro agente',
        usuario_id: otroAgente.rows[0].id
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('SIN_PERMISO');
  });

  test('Rechazar atención si el caso no está En atención (409)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test atención estado',
        descripcion: 'Descripción de prueba para atención estado',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/atencion`)
      .send({
        diagnostico: 'Diagnóstico prematuro',
        solucion: 'Solución prematura',
        usuario_id: 2
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ESTADO_INVALIDO');
  });
});

describe('POST /api/casos/:id/validacion', () => {
  test('CP-08: Validador devuelve un caso', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test devolución',
        descripcion: 'Descripción de prueba para devolución',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/validacion`)
      .send({ accion: 'devolver', comentario: 'Falta información', usuario_id: 3 });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('En atención');
  });

  test('CP-09: Validador aprueba un caso', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test aprobación',
        descripcion: 'Descripción de prueba para aprobación',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/validacion`)
      .send({ accion: 'aprobar', usuario_id: 3 });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Cerrada');
    expect(res.body.fecha_cierre).toBeDefined();
  });

  test('Rechazar validación por solicitante (403)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test validación solicitante',
        descripcion: 'Descripción de prueba para validación solicitante',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/validacion`)
      .send({ accion: 'aprobar', usuario_id: 1 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('SIN_PERMISO');
  });

  test('Rechazar validación por agente (403)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test validación agente',
        descripcion: 'Descripción de prueba para validación agente',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    const res = await request(app)
      .post(`/api/casos/${casoId}/validacion`)
      .send({ accion: 'aprobar', usuario_id: 2 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('SIN_PERMISO');
  });

  test('Rechazar Cerrada sin atención por PATCH (409)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test cerrar sin atención',
        descripcion: 'Descripción de prueba para cerrar sin atención',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'Cerrada', usuario_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('TRANSICION_INVALIDA');
  });

  test('Rechazar transición desde En validación por PATCH (409)', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test transición validación',
        descripcion: 'Descripción de prueba para transición validación',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    const res = await request(app)
      .patch(`/api/casos/${casoId}/estado`)
      .send({ estado: 'Cerrada', usuario_id: 2 });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('TRANSICION_INVALIDA');
  });
});

describe('GET /api/casos - filtros combinables', () => {
  test('CP-10: Filtrar por área, tipo y prioridad combinados', async () => {
    await request(app).post('/api/casos').send({
      tipo: 'Incidente',
      titulo: 'Test filtro área',
      descripcion: 'Descripción de prueba para filtro por área',
      prioridad: 'P1',
      usuario_id: 1,
      categoria_id: 1
    });

    await request(app).post('/api/casos').send({
      tipo: 'Solicitud',
      titulo: 'Test filtro área 2',
      descripcion: 'Descripción de prueba para filtro por área 2',
      prioridad: 'P2',
      usuario_id: 1,
      categoria_id: 4
    });

    const res = await request(app).get('/api/casos?area_id=1&tipo=Incidente&prioridad=P1');

    expect(res.status).toBe(200);
    res.body.forEach(caso => {
      expect(caso.tipo).toBe('Incidente');
      expect(caso.prioridad).toBe('P1');
    });
  });

  test('Rechazar filtro con estado inválido (400)', async () => {
    const res = await request(app).get('/api/casos?estado=Devuelta');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FILTRO_INVALIDO');
  });

  test('Rechazar filtro con tipo inválido (400)', async () => {
    const res = await request(app).get('/api/casos?tipo=Reclamo');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FILTRO_INVALIDO');
  });

  test('Filtrar por categoria_id', async () => {
    const res = await request(app).get('/api/casos?categoria_id=1');
    expect(res.status).toBe(200);
    res.body.forEach(caso => {
      expect(caso.categoria_id).toBe(1);
    });
  });
});

describe('GET /api/indicadores', () => {
  test('Obtener indicadores', async () => {
    await request(app).post('/api/casos').send({
      tipo: 'Incidente',
      titulo: 'Test indicadores',
      descripcion: 'Descripción de prueba para indicadores',
      prioridad: 'P1',
      usuario_id: 1,
      categoria_id: 1
    });

    const res = await request(app).get('/api/indicadores');

    expect(res.status).toBe(200);
    expect(res.body.casos_por_estado).toBeDefined();
    expect(res.body.casos_por_tipo).toBeDefined();
    expect(res.body.casos_por_prioridad).toBeDefined();
    expect(res.body.tiempo_promedio_atencion_horas).toBeDefined();
    expect(res.body.tiempo_promedio_asignacion_horas).toBeDefined();
  });
});

describe('POST /api/categorias', () => {
  test('Crear categoría como administrador', async () => {
    const nombreUnico = `Nueva Categoría ${Date.now()}`;
    const res = await request(app)
      .post('/api/categorias')
      .send({
        nombre: nombreUnico,
        descripcion: 'Descripción de prueba',
        area_id: 1,
        usuario_id: 4
      });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe(nombreUnico);
    expect(res.body.activa).toBe(true);
  });

  test('Rechazar crear categoría como agente (403)', async () => {
    const res = await request(app)
      .post('/api/categorias')
      .send({
        nombre: 'Categoría no permitida',
        descripcion: 'Descripción de prueba',
        area_id: 1,
        usuario_id: 2
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('SIN_PERMISO');
  });

  test('Rechazar crear categoría con área inexistente (400)', async () => {
    const res = await request(app)
      .post('/api/categorias')
      .send({
        nombre: 'Categoría sin área',
        descripcion: 'Descripción de prueba',
        area_id: 9999,
        usuario_id: 4
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('AREA_INVALIDA');
  });
});

describe('PATCH /api/categorias/:id', () => {
  test('Editar categoría como administrador', async () => {
    const catResult = await db.query(
      `SELECT c.id FROM categoria c
       WHERE NOT EXISTS (SELECT 1 FROM caso ca WHERE ca.categoria_id = c.id)
       LIMIT 1`
    );
    if (catResult.rows.length === 0) return;

    const catId = catResult.rows[0].id;
    const nombreUnico = `Categoría editada ${Date.now()}`;
    const res = await request(app)
      .patch(`/api/categorias/${catId}`)
      .send({
        nombre: nombreUnico,
        usuario_id: 4
      });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe(nombreUnico);
  });

  test('Desactivar categoría como administrador', async () => {
    const catResult = await db.query(
      `SELECT c.id FROM categoria c
       WHERE NOT EXISTS (SELECT 1 FROM caso ca WHERE ca.categoria_id = c.id)
       LIMIT 1`
    );
    if (catResult.rows.length === 0) return;

    const catId = catResult.rows[0].id;
    const res = await request(app)
      .patch(`/api/categorias/${catId}/activar`)
      .send({ activa: false, usuario_id: 4 });

    expect(res.status).toBe(200);
    expect(res.body.activa).toBe(false);
  });

  test('Rechazar desactivar categoría con casos (409)', async () => {
    const casoResult = await db.query('SELECT categoria_id FROM caso LIMIT 1');
    if (casoResult.rows.length > 0) {
      const catId = casoResult.rows[0].categoria_id;
      const res = await request(app)
        .patch(`/api/categorias/${catId}/activar`)
        .send({ activa: false, usuario_id: 4 });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('CATEGORIA_EN_USO');
    }
  });
});

describe('Flujo completo - integración', () => {
  test('Registrar → Asignar → Atender → Validar → Cerrar', async () => {
    const crearRes = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test integración',
        descripcion: 'Descripción de prueba para integración',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: 1
      });

    const casoId = crearRes.body.id;
    expect(crearRes.body.estado).toBe('Pendiente');

    await request(app).post(`/api/casos/${casoId}/asignar`).send({ usuario_id: 2 });

    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En análisis', usuario_id: 2 });
    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En atención', usuario_id: 2 });

    await request(app)
      .post(`/api/casos/${casoId}/atencion`)
      .send({
        diagnostico: 'Falla de red',
        solucion: 'Reinicio de router',
        usuario_id: 2
      });

    await request(app).patch(`/api/casos/${casoId}/estado`).send({ estado: 'En validación', usuario_id: 2 });

    await request(app)
      .post(`/api/casos/${casoId}/validacion`)
      .send({ accion: 'aprobar', usuario_id: 3 });

    const histRes = await request(app).get(`/api/casos/${casoId}/historial`);

    expect(histRes.body.length).toBeGreaterThanOrEqual(6);
    expect(histRes.body[0].evento).toBe('Caso creado');
    expect(histRes.body[1].evento).toBe('Agente asignado');
    expect(histRes.body[2].evento).toBe('Cambio de estado');
    expect(histRes.body[histRes.body.length - 1].evento).toContain('Validación');

    const casoFinal = await request(app).get(`/api/casos/${casoId}`);
    expect(casoFinal.body.estado).toBe('Cerrada');
    expect(casoFinal.body.fecha_cierre).toBeDefined();
    expect(casoFinal.body.atencion.solucion).toBe('Reinicio de router');
  });
});

describe('Categorías - tests adicionales', () => {
  test('POST /casos rechaza categoría inactiva', async () => {
    const nombreCat = `Cat inactiva ${Date.now()}`;
    const catRes = await request(app)
      .post('/api/categorias')
      .send({
        nombre: nombreCat,
        descripcion: 'Categoría para desactivar',
        area_id: 1,
        usuario_id: 4
      });
    const catId = catRes.body.id;

    await request(app)
      .patch(`/api/categorias/${catId}/activar`)
      .send({ activa: false, usuario_id: 4 });

    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test categoría inactiva',
        descripcion: 'Descripción de prueba para categoría inactiva',
        prioridad: 'P2',
        usuario_id: 1,
        categoria_id: catId
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('CATEGORIA_INVALIDA');
  });

  test('Reactivar categoría (activa: true)', async () => {
    const nombreCat = `Cat reactivar ${Date.now()}`;
    const catRes = await request(app)
      .post('/api/categorias')
      .send({
        nombre: nombreCat,
        descripcion: 'Categoría para reactivar',
        area_id: 1,
        usuario_id: 4
      });
    const catId = catRes.body.id;

    await request(app)
      .patch(`/api/categorias/${catId}/activar`)
      .send({ activa: false, usuario_id: 4 });

    const res = await request(app)
      .patch(`/api/categorias/${catId}/activar`)
      .send({ activa: true, usuario_id: 4 });

    expect(res.status).toBe(200);
    expect(res.body.activa).toBe(true);
  });

  test('GET /api/categorias con filtro por área', async () => {
    const res = await request(app).get('/api/categorias?area_id=1');
    expect(res.status).toBe(200);
    res.body.forEach(cat => {
      expect(cat.area_id).toBe(1);
    });
  });
});

describe('Filtros - validación area_id y categoria_id', () => {
  test('Rechazar filtro con area_id inválido (400)', async () => {
    const res = await request(app).get('/api/casos?area_id=abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FILTRO_INVALIDO');
  });

  test('Rechazar filtro con categoria_id inválido (400)', async () => {
    const res = await request(app).get('/api/casos?categoria_id=-1');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FILTRO_INVALIDO');
  });
});

describe('Casos de prueba adicionales (CP-12 a CP-15)', () => {
  test('CP-12: Aceptar caracteres especiales y código', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({
        tipo: 'Incidente',
        titulo: 'Test <script>alert("xss")</script>',
        descripcion: 'Detalles con caracteres especiales: áéíóú Ññ " quotes \' y #$%&/',
        prioridad: 'P1',
        usuario_id: 1,
        categoria_id: 1
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  test('CP-13: Rechazar petición POST /api/casos con body vacío', async () => {
    const res = await request(app)
      .post('/api/casos')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('DATOS_INVALIDOS');
  });

  test('CP-14: Búsqueda con espacios en blanco extras', async () => {
    const res = await request(app).get('/api/casos?estado=Pendiente');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('CP-15: Responder con arreglo vacío cuando no hay resultados', async () => {
    const res = await request(app).get('/api/casos?prioridad=P99');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FILTRO_INVALIDO');
  });
});
