import { Pool, QueryResult, QueryResultRow } from 'pg';
import { getPool } from './pool.js';
import { wrapError } from '../errors/database.error.js';

export interface QueryRunner {
    query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]>;
}

export class Database implements QueryRunner {
    private readonly pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async query<T extends QueryResultRow>(sql: string, params?: unknown[]): Promise<T[]> {
        try {
            const result: QueryResult<T> = await this.pool.query<T>(sql, params);
            return result.rows;
        } catch (error) {
            throw wrapError(error);
        }
    }

    async transaction<T>(callback: (runner: QueryRunner) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');

            const txRunner: QueryRunner = {
                query: async <R extends QueryResultRow>(sql: string, params?: unknown[]) => {
                    try {
                        const result: QueryResult<R> = await client.query<R>(sql, params);
                        return result.rows;
                    } catch (error) {
                        throw wrapError(error);
                    }
                },
            };

            const result = await callback(txRunner);

            await client.query('COMMIT');

            return result;
        } catch (error) {
            await client.query('ROLLBACK').catch(() => {});
            throw error;
        } finally {
            client.release();
        }
    }
}

export const db = new Database(getPool());
