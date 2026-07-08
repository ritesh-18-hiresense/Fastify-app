export class DatabaseError extends Error {
    constructor(
        message: string,
        public readonly code?: string,
        public readonly detail?: string
    ) {
        super(message);
        this.name = 'DatabaseError';
    }
}

export class ConnectionError extends DatabaseError {
    constructor(message: string, detail?: string) {
        super(message, 'CONNECTION_ERROR', detail);
        this.name = 'ConnectionError';
    }
}

export class DuplicateKeyError extends DatabaseError {
    constructor(message: string, detail?: string) {
        super(message, '23505', detail);
        this.name = 'DuplicateKeyError';
    }
}

export class ForeignKeyError extends DatabaseError {
    constructor(message: string, detail?: string) {
        super(message, '23503', detail);
        this.name = 'ForeignKeyError';
    }
}

export class QueryTimeoutError extends DatabaseError {
    constructor(message: string, detail?: string) {
        super(message, '57014', detail);
        this.name = 'QueryTimeoutError';
    }
}

const PG_ERROR_CODES: Record<string, new (message: string, detail?: string) => DatabaseError> = {
    '23505': DuplicateKeyError,
    '23503': ForeignKeyError,
    '57014': QueryTimeoutError,
};

export function wrapError(error: unknown): DatabaseError {
    if (error instanceof DatabaseError) {
        return error;
    }

    const pgError = error as { code?: string; message?: string; detail?: string };

    if (pgError?.code && pgError.code in PG_ERROR_CODES) {
        const ErrorClass = PG_ERROR_CODES[pgError.code];
        return new ErrorClass(pgError.message ?? 'Database error', pgError.detail);
    }

    if (pgError?.code === 'ECONNREFUSED' || pgError?.code === 'ETIMEOUT' || pgError?.code?.startsWith('08')) {
        return new ConnectionError(pgError.message ?? 'Connection error', pgError.detail);
    }

    if (pgError?.message?.toLowerCase().includes('timeout') || pgError?.message?.includes('canceling statement')) {
        return new QueryTimeoutError(pgError.message, pgError.detail);
    }

    return new DatabaseError(pgError?.message ?? 'Unknown database error', pgError?.code, pgError?.detail);
}
