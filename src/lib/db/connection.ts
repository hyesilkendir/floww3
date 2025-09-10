import { drizzle as drizzleMySql } from 'drizzle-orm/mysql2';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import mysql from 'mysql2/promise';
import postgres from 'postgres';
import * as mysqlSchema from './schema';
import * as pgSchema from './pg-schema';

// Dialect selection: 'mysql' (default) or 'postgres'
const DIALECT = (process.env.DB_DIALECT || (process.env.DATABASE_URL ? 'postgres' : 'mysql')).toLowerCase();

let dbInstance: any;

if (DIALECT === 'postgres') {
  // Postgres (Supabase) connection
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing required environment variable: DATABASE_URL for Postgres connection');
  }

  const sql = postgres(databaseUrl, {
    ssl: 'require',
    max: parseInt(process.env.PG_POOL_SIZE || '10'),
  });

  dbInstance = drizzlePostgres(sql, {
    schema: pgSchema,
    logger: process.env.NODE_ENV === 'development',
  });
} else {
  // Validate environment variables for MySQL only
  const requiredEnvVars = {
    DB_HOST: process.env.DB_HOST,
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_DATABASE: process.env.DB_DATABASE,
    DB_PORT: process.env.DB_PORT,
  } as const;

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  const pool = mysql.createPool({
    host: requiredEnvVars.DB_HOST!,
    user: requiredEnvVars.DB_USERNAME!,
    password: requiredEnvVars.DB_PASSWORD!,
    database: requiredEnvVars.DB_DATABASE!,
    port: parseInt(requiredEnvVars.DB_PORT!),
    charset: 'utf8mb4',
    timezone: '+03:00', // Turkey timezone
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  dbInstance = drizzleMySql(pool, {
    schema: mysqlSchema,
    mode: 'default',
    logger: process.env.NODE_ENV === 'development',
  });
}

export const db = dbInstance;
export type Database = typeof db;