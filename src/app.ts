import 'dotenv/config';
import Fastify from 'fastify';
import databasePlugin from './plugins/database.plugin.js';
import { userRoutes } from './routes/user.routes.js';
import { DatabaseError } from './errors/database.error.js';

const fastify = Fastify({
    logger: true,
});

await fastify.register(databasePlugin);

await fastify.register(userRoutes);

fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof DatabaseError) {
        fastify.log.error({ code: error.code, detail: error.detail }, 'Database error');
        reply.code(500).send({ error: 'Internal server error' });
        return;
    }

    reply.send(error);
});
fastify.get("/info", (req, rep) => {
    rep.send({
        msg: "Server is up and running",
        version: '1.0'
    })
})
fastify.get("/", (req, rep) => {
    rep.send({
        msg: "Server is up and running"
    })
})

try {
    await fastify.listen({ port: Number(process.env.PORT ?? 3000), host: '0.0.0.0' });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
