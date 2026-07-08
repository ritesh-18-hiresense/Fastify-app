export interface User {
    id: number;
    name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateUserDto {
    name: string;
    email: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
}
