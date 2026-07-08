import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
    if (pool) {
        return pool;
    }

    pool = new Pool({
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        database: process.env.DB_NAME ?? 'postgres',
        user: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        max: Number(process.env.DB_POOL_MAX ?? 20),
        idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT ?? 30000),
        connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT ?? 5000),
        ssl: process.env.DB_SSL === 'true'
            ? { rejectUnauthorized: false }
            : false,
    });

    pool.on('error', (err) => {
        console.error('Unexpected pool error:', err.message);
    });

    return pool;
}

export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
