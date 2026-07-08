export const UserQueries = {
    findById: `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE id = $1;
    `,

    findByEmail: `
        SELECT id, name, email, created_at, updated_at
        FROM users
        WHERE email = $1;
    `,

    findAll: `
        SELECT id, name, email, created_at, updated_at
        FROM users
        ORDER BY created_at DESC;
    `,

    create: `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        RETURNING id, name, email, created_at, updated_at;
    `,

    update: `
        UPDATE users
        SET name = COALESCE($2, name),
            email = COALESCE($3, email),
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, email, created_at, updated_at;
    `,

    delete: `
        DELETE FROM users
        WHERE id = $1
        RETURNING id;
    `,
};
