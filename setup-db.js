import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://DeathBirthRegistry_owner:npg_hJkLjX2TF9No@ep-damp-mountain-abnc8w0t-pooler.eu-west-2.aws.neon.tech/DeathBirthRegistry?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupDatabase() {
  try {
    // Read the SQL files
    const schemaFile = fs.readFileSync(join(__dirname, 'schema2.sql'), 'utf8');
    const migrationFile = fs.readFileSync(join(__dirname, 'migrations/add_password_field.sql'), 'utf8');
    
    // Execute the SQL
    await pool.query(schemaFile);
    await pool.query(migrationFile);
    
    console.log('Database tables created successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase(); 