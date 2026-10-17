import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Client } = pg;

const targetDb = process.env.PGDATABASE || 'qa_book_db';
const user = process.env.PGUSER || 'postgres';
const password = process.env.PGPASSWORD || '';
const host = process.env.PGHOST || 'localhost';
const port = parseInt(process.env.PGPORT || '5432', 10);

async function initializeDatabase() {
  console.log(`[InitDB] Connecting to PostgreSQL server on ${host}:${port} as ${user}...`);

  // Step 1: Connect to default maintenance database 'postgres' to verify or create targetDb
  const maintenanceClient = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
  });

  try {
    await maintenanceClient.connect();
    console.log('[InitDB] Connected to PostgreSQL maintenance database.');

    const checkDbRes = await maintenanceClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1;`,
      [targetDb]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`[InitDB] Database "${targetDb}" does not exist. Creating...`);
      await maintenanceClient.query(`CREATE DATABASE "${targetDb}";`);
      console.log(`[InitDB] Database "${targetDb}" created successfully.`);
    } else {
      console.log(`[InitDB] Database "${targetDb}" already exists.`);
    }
  } catch (err) {
    console.error('[InitDB] Error ensuring target database exists:', err.message);
    throw err;
  } finally {
    await maintenanceClient.end();
  }

  // Step 2: Connect to target database and execute schema.sql
  const schemaPath = path.resolve(__dirname, '../../schema.sql');
  console.log(`[InitDB] Reading schema from: ${schemaPath}`);
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  const appDbClient = new Client({
    host,
    port,
    user,
    password,
    database: targetDb,
  });

  try {
    await appDbClient.connect();
    console.log(`[InitDB] Connected to target database "${targetDb}". Executing schema & seeds...`);
    await appDbClient.query(sql);

    const chapterCountRes = await appDbClient.query(`SELECT COUNT(*) FROM chapters;`);
    const qaCountRes = await appDbClient.query(`SELECT COUNT(*) FROM qa_items;`);

    console.log(`[InitDB] Schema and seed data executed successfully!`);
    console.log(`[InitDB] Chapters count: ${chapterCountRes.rows[0].count}`);
    console.log(`[InitDB] Q&A Items count: ${qaCountRes.rows[0].count}`);
  } catch (err) {
    console.error('[InitDB] Error executing schema.sql:', err.message);
    throw err;
  } finally {
    await appDbClient.end();
  }
}

initializeDatabase()
  .then(() => {
    console.log('[InitDB] Database initialization complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[InitDB] Database initialization failed:', err);
    process.exit(1);
  });
