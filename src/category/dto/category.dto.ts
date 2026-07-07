import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { PaginateSchema } from '@/common/schema/paginate.shcema';

extendZodWithOpenApi(z);

export const CreateCategorySchema = z.object({
    name: z
        .string()
        .min(1)
        .max(255)
        .describe('The unique display name of the category.')
        .openapi({ example: 'Groceries' }),
    icon: z
        .string()
        .max(255)
        .nullable()
        .optional()
        .describe('The optional icon identifier or path for the category.')
        .openapi({ example: 'shopping-cart' }),
    color: z
        .string()
        .max(255)
        .nullable()
        .optional()
        .describe('The optional hex color code associated with the category.')
        .openapi({ example: '#FF5733' }),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = CreateCategorySchema.partial();
export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;

export const CategoryResponseSchema = CreateCategorySchema.extend({
    id: z
        .uuid()
        .describe('The UUID of the category.')
        .openapi({ example: '321e4567-e89b-12d3-a456-426614174000' }),
});

export type CategoryResponseDto = z.infer<typeof CategoryResponseSchema>;

export const CategoryPaginateSchema = PaginateSchema.extend({
    sortBy: z
        .enum(['name'])
        .optional()
        .describe('The field by which to sort the results.')
        .openapi({ example: 'name' }),
    sortOrder: z
        .enum(['asc', 'desc'])
        .optional()
        .default('asc')
        .describe(
            'The order in which to sort the results, either ascending (asc) or descending (desc).',
        )
        .openapi({ example: 'asc' }),
});

export type CategoryPaginateDto = z.infer<typeof CategoryPaginateSchema>;
