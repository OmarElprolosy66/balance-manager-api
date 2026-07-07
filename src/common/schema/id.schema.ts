import { z } from 'zod';

export const idSchema = z.object({
    id: z
        .uuid()
        .describe(
            'A valid UUID string representing the unique identifier of a resource.',
        ),
});
export type IdSchema = z.infer<typeof idSchema>;
