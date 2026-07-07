import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
import { ZodError } from 'zod';
import { DrizzleQueryError } from 'drizzle-orm';
import { failed } from '@/common/utils/std.res';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: NextFunction,
) {
    if (err instanceof ZodError) {
        // Log the validation issues securely on the server
        req.log.warn({ issues: err.issues }, 'Validation failed');

        // Map issues in production to omit structural fields like expected, received, codes, etc.
        const issues =
            process.env.NODE_ENV === 'production'
                ? err.issues.map((issue) => ({
                      path: issue.path,
                      message: issue.message,
                  }))
                : err.issues;

        return res.status(400).json(
            failed({
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                issues,
            }),
        );
    }

    // Log unexpected errors
    req.log.error({ err }, 'Request failed');

    if (err instanceof AppError) {
        return res.status(err.statusCode).json(
            failed({
                code: err.code,
                message: err.message,
            }),
        );
    }

    if (err instanceof DrizzleQueryError) {
        return res.status(400).json(
            failed({
                code: 'DATABASE_ERROR',
                message: 'Internal database error',
            }),
        );
    }

    return res.status(500).json(
        failed({
            code: 'INTERNAL_SERVER_ERROR',
            message:
                process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : err.message,
        }),
    );
}
