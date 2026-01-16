import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

// libSQL requires "file:" protocol for local SQLite files
// Handle both cases: absolute path with or without file: prefix
let dbUrl = process.env.DB_FILE_NAME!;

// If it's an absolute path without file: prefix, add it
if (dbUrl.startsWith('/') && !dbUrl.startsWith('file:')) {
  dbUrl = `file:${dbUrl}`;
}

// If it's a relative path without file: prefix, add it
if (!dbUrl.startsWith('/') && !dbUrl.startsWith('file:')) {
  dbUrl = `file:${dbUrl}`;
}

const db = drizzle(dbUrl);

export default db;