import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserController } from '../controllers/user.controller.js';
import { UserService } from '../services/user.service.js';
import { CreateUserDto } from '../types/user.types.js';

async function createUsersInTransaction(
    request: FastifyRequest<{ Body: { users: CreateUserDto[] } }>,
    reply: FastifyReply
): Promise<void> {
    const { users } = request.body;

    if (!users || users.length === 0) {
        reply.code(400).send({ error: 'No users provided' });
        return;
    }

    const result = await request.server.db.transaction(async (tx) => {
        const txService = new UserService(tx);

        const created = [];
        for (const dto of users) {
            const user = await txService.create(dto);
            created.push(user);
        }

        return created;
    });

    reply.code(201).send(result);
}

export async function userRoutes(fastify: FastifyInstance): Promise<void> {
    const service = new UserService(fastify.db);
    const controller = new UserController(service);

    fastify.get('/users', controller.list.bind(controller));

    fastify.get('/users/email', controller.getByEmail.bind(controller));

    fastify.get('/users/:id', controller.getById.bind(controller));

    fastify.post('/users', controller.create.bind(controller));

    fastify.post('/users/batch', createUsersInTransaction);

    fastify.put('/users/:id', controller.update.bind(controller));

    fastify.delete('/users/:id', controller.delete.bind(controller));
}
