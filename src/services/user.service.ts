import { UserRepository } from '../repositories/user.repository.js';
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
    constructor(private readonly repo: UserRepository) {}

    async findById(id: number): Promise<User> {
        const user = await this.repo.findById(id);

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findByEmail(email);
    }

    async findAll(): Promise<User[]> {
        return this.repo.findAll();
    }

    async create(dto: CreateUserDto): Promise<User> {
        const existing = await this.repo.findByEmail(dto.email);

        if (existing) {
            throw new EmailAlreadyTakenError(dto.email);
        }

        try {
            return await this.repo.create(dto);
        } catch (error) {
            if (error instanceof DuplicateKeyError) {
                throw new EmailAlreadyTakenError(dto.email);
            }
            throw error;
        }
    }

    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const user = await this.repo.update(id, dto);

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    async delete(id: number): Promise<void> {
        const deletedId = await this.repo.delete(id);

        if (deletedId === null) {
            throw new UserNotFoundError(id);
        }
    }
}
