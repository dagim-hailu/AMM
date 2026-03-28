import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env file from the current directory (apps/backend-api)
dotenv.config({ path: join(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL is not defined in the environment!');
} else {
  console.log('✅ Environment variables loaded efficiently.');
}
