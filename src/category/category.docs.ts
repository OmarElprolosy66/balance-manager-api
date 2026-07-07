import {
    registry,
    zSuccessResponse,
    zFailedResponse,
} from '@/common/utils/swagger';
import {
    CreateCategorySchema,
    UpdateCategorySchema,
    CategoryResponseSchema,
    CategoryPaginateSchema,
} from './dto/category.dto';
import { idSchema } from '@/common/schema';
import { z } from 'zod';

// GET /categories
registry.registerPath({
    method: 'get',
    path: '/categories',
    summary: 'Get paginated list of categories',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        query: CategoryPaginateSchema,
    },
    responses: {
        200: {
            description: 'Paginated categories list',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        z.object({
                            data: z.array(CategoryResponseSchema),
                            total: z.number(),
                            page: z.number(),
                            limit: z.number(),
                        }),
                    ),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
    },
});

// GET /categories/:id
registry.registerPath({
    method: 'get',
    path: '/categories/{id}',
    summary: 'Get category by ID',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        200: {
            description: 'Category details',
            content: {
                'application/json': {
                    schema: zSuccessResponse(CategoryResponseSchema),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
        404: {
            description: 'Category not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// POST /categories
registry.registerPath({
    method: 'post',
    path: '/categories',
    summary: 'Create a new category',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateCategorySchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Category created successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(CategoryResponseSchema),
                },
            },
        },
        400: {
            description: 'Bad Request / Validation Error',
            content: {
                'application/json': {
                    schema: zFailedResponse('VALIDATION_ERROR'),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
    },
});

// PATCH /categories/:id
registry.registerPath({
    method: 'patch',
    path: '/categories/{id}',
    summary: 'Update category by ID',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
        body: {
            content: {
                'application/json': {
                    schema: UpdateCategorySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Category updated successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(CategoryResponseSchema),
                },
            },
        },
        400: {
            description: 'Bad Request / Validation Error',
            content: {
                'application/json': {
                    schema: zFailedResponse('VALIDATION_ERROR'),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
        404: {
            description: 'Category not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// DELETE /categories/:id
registry.registerPath({
    method: 'delete',
    path: '/categories/{id}',
    summary: 'Delete category by ID',
    tags: ['Categories'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        204: {
            description: 'Category deleted successfully',
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
        404: {
            description: 'Category not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});
