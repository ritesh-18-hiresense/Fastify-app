import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService, UserNotFoundError, EmailAlreadyTakenError } from '../services/user.service.js';
import { CreateUserDto, UpdateUserDto } from '../types/user.types.js';

export class UserController {
    constructor(private readonly userService: UserService) {}

    async getById(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const id = Number(request.params.id);
            const user = await this.userService.findById(id);
            reply.send(user);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                reply.code(404).send({ error: error.message });
                return;
            }
            throw error;
        }
    }

    async getByEmail(
        request: FastifyRequest<{ Querystring: { email: string } }>,
        reply: FastifyReply
    ): Promise<void> {
        const user = await this.userService.findByEmail(request.query.email);

        if (!user) {
            reply.code(404).send({ error: 'User not found' });
            return;
        }

        reply.send(user);
    }

    async list(
        _request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        const users = await this.userService.findAll();
        reply.send(users);
    }

    async create(
        request: FastifyRequest<{ Body: CreateUserDto }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const user = await this.userService.create(request.body);
            reply.code(201).send(user);
        } catch (error) {
            if (error instanceof EmailAlreadyTakenError) {
                reply.code(409).send({ error: error.message });
                return;
            }
            throw error;
        }
    }

    async update(
        request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDto }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const id = Number(request.params.id);
            const user = await this.userService.update(id, request.body);
            reply.send(user);
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                reply.code(404).send({ error: error.message });
                return;
            }
            throw error;
        }
    }

    async delete(
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<void> {
        try {
            const id = Number(request.params.id);
            await this.userService.delete(id);
            reply.code(204).send();
        } catch (error) {
            if (error instanceof UserNotFoundError) {
                reply.code(404).send({ error: error.message });
                return;
            }
            throw error;
        }
    }
}
