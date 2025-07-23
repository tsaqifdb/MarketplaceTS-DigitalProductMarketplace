import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from './schema';

// Load environment variables
if (typeof window === 'undefined') {
  require('dotenv').config();
}


// Use direct connection (non-pooler) for better Node.js script compatibility
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
