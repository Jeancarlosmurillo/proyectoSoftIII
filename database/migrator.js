require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function ejecutarMigraciones() {
  const client = await pool.connect();
  try {
    await client.query('CREATE TABLE IF NOT EXISTS migraciones (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      ejecutada_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )');

    const migrationsDir = path.join(__dirname, 'migrations');
    const archivos = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const archivo of archivos) {
      const resultado = await client.query(
        'SELECT id FROM migraciones WHERE filename = $1',
        [archivo]
      );

      if (resultado.rows.length > 0) {
        console.log(`  OK (ya ejecutada): ${archivo}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, archivo), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO migraciones (filename) VALUES ($1)',
          [archivo]
        );
        await client.query('COMMIT');
        console.log(`  OK: ${archivo}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ERROR en ${archivo}: ${error.message}`);
        throw error;
      }
    }

    console.log('\nMigraciones completadas.');
  } finally {
    client.release();
    await pool.end();
  }
}

ejecutarMigraciones().catch(error => {
  console.error('Error fatal:', error.message);
  process.exit(1);
});
