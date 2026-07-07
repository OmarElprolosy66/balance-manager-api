import { z } from 'zod';

export const PaginateSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1)
        .describe('The page number to retrieve, starting from 1.'),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .describe('The number of items per page, with a maximum of 100.'),
    sortBy: z
        .string()
        .optional()
        .describe('The field by which to sort the results.'),
    sortOrder: z
        .enum(['asc', 'desc'])
        .optional()
        .default('asc')
        .describe(
            'The order in which to sort the results, either ascending (asc) or descending (desc).',
        ),
});
export type PaginateSchema = z.infer<typeof PaginateSchema>;
