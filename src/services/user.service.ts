import { QueryRunner } from '../db/db.js';
import { UserQueries } from '../queries/user.query.js';
import { User, CreateUserDto, UpdateUserDto } from '../types/user.types.js';
import { DuplicateKeyError } from '../errors/database.error.js';

export class UserNotFoundError extends Error {
    constructor(id: number) {
        super(`User with id ${id} not found`);
        this.name = 'UserNotFoundError';
    }
}

export class EmailAlreadyTakenError extends Error {
    constructor(email: string) {
        super(`Email ${email} is already taken`);
        this.name = 'EmailAlreadyTakenError';
    }
}

export class UserService {
    constructor(private readonly runner: QueryRunner) {}

    async findById(id: number): Promise<User> {
        const rows = await this.runner.query<User>(UserQueries.findById, [id]);
        const user = rows[0] ?? null;

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const rows = await this.runner.query<User>(UserQueries.findByEmail, [email]);
        return rows[0] ?? null;
    }

    async findAll(): Promise<User[]> {
        return this.runner.query<User>(UserQueries.findAll);
    }

    async create(dto: CreateUserDto): Promise<User> {
        const existing = await this.findByEmail(dto.email);

        if (existing) {
            throw new EmailAlreadyTakenError(dto.email);
        }

        try {
            const rows = await this.runner.query<User>(UserQueries.create, [dto.name, dto.email]);
            return rows[0];
        } catch (error) {
            if (error instanceof DuplicateKeyError) {
                throw new EmailAlreadyTakenError(dto.email);
            }
            throw error;
        }
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const rows = await this.runner.query<User>(UserQueries.update, [id, dto.name ?? null, dto.email ?? null]);
        const user = rows[0] ?? null;

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    async delete(id: number): Promise<void> {
        const rows = await this.runner.query<{ id: number }>(UserQueries.delete, [id]);
        const deletedId = rows[0]?.id ?? null;

        if (deletedId === null) {
            throw new UserNotFoundError(id);
        }
    }
}
