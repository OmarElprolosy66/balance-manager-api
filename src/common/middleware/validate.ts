import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

interface ValidationSchemas {
    body?: z.ZodObject<any>;
    query?: z.ZodObject<any>;
    params?: z.ZodObject<any>;
}

export const validate = (schemas: ValidationSchemas) => {
    return async (
        req: Request,
        _: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            if (schemas.params) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const parsedParams = await schemas.params.parseAsync(
                    req.params,
                );
                Object.defineProperty(req, 'params', {
                    value: parsedParams,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
            if (schemas.query) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const parsedQuery = await schemas.query.parseAsync(req.query);
                Object.defineProperty(req, 'query', {
                    value: parsedQuery,
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
            if (schemas.body) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                req.body = (await schemas.body.parseAsync(req.body)) as any;
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
