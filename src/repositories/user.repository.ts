import { QueryRunner } from '../db/db.js';
import { UserQueries } from '../queries/user.query.js';
import {
    User,
    CreateUserDto,
    UpdateUserDto,
} from '../types/user.types.js';

export class UserRepository {
    constructor(private readonly runner: QueryRunner) {}

    async findById(id: number): Promise<User | null> {
        const rows = await this.runner.query<User>(UserQueries.findById, [id]);
        return rows[0] ?? null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const rows = await this.runner.query<User>(UserQueries.findByEmail, [email]);
        return rows[0] ?? null;
    }

    async findAll(): Promise<User[]> {
        return this.runner.query<User>(UserQueries.findAll);
    }

    async create(dto: CreateUserDto): Promise<User> {
        const rows = await this.runner.query<User>(UserQueries.create, [dto.name, dto.email]);
        return rows[0];
    }

    async update(id: number, dto: UpdateUserDto): Promise<User | null> {
        const rows = await this.runner.query<User>(UserQueries.update, [id, dto.name ?? null, dto.email ?? null]);
        return rows[0] ?? null;
    }

    async delete(id: number): Promise<number | null> {
        const rows = await this.runner.query<{ id: number }>(UserQueries.delete, [id]);
        return rows[0]?.id ?? null;
    }
}
