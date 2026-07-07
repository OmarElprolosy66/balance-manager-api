export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public code = 'APP_ERROR',
        public details?: unknown,
    ) {
        super(message);

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}
