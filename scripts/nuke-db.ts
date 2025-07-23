// Load environment variables
require('dotenv').config();

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

// Import dependencies for Neon database
// This is needed to ensure WebSocket support for Neon
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

async function nukeDatabase() {
  try {
    console.log('💣 Starting complete database nuke operation...');
    console.log('⚠️ This will drop all tables and enums in the database!');

    // Drop all tables first
    try {
      // Get database schema from environment
      const databaseUrl = process.env.DATABASE_URL || '';
      const schemaMatch = databaseUrl.match(/schema=([^&]+)/);
      const schema = schemaMatch ? schemaMatch[1] : 'public';
      
      console.log(`📊 Using database schema: ${schema}`);
      
      // First drop all tables
      await db.execute(sql.raw(`
        DO $$ 
        DECLARE
          r RECORD;
        BEGIN
          -- Drop all tables in the specified schema
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = '${schema}') 
          LOOP
            EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
          END LOOP;
          
          -- Drop all types including enums
          FOR r IN (SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = '${schema}' AND t.typtype = 'e')
          LOOP
            EXECUTE 'DROP TYPE IF EXISTS "' || r.typname || '" CASCADE';
          END LOOP;
        END $$;
      `));
      
      console.log('💥 All tables and types have been dropped!');
    } catch (error) {
      console.error('❌ Error nuking database:', error);
    }

    console.log('✅ Database nuke operation completed.');
    console.log('ℹ️ You can now run "npm run db:migrate" to apply migrations');
    console.log('ℹ️ Then run "npm run db:seed" to populate with fresh data.');
  } catch (error) {
    console.error('❌ Error in nuke operation:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  nukeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { nukeDatabase };
