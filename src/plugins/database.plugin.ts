import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Database, db } from '../db/db.js';
import { closePool } from '../db/pool.js';

declare module 'fastify' {
    interface FastifyInstance {
        db: Database;
    }
}

export default fp(async (fastify: FastifyInstance) => {
    fastify.decorate('db', db);

    await db.query<{ one: number }>('SELECT 1');

    fastify.log.info('Database connection verified');

    fastify.addHook('onClose', async () => {
        await closePool();
    });
}, {
    name: 'database',
});
