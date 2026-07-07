import {
    registry,
    zSuccessResponse,
    zFailedResponse,
} from '@/common/utils/swagger';
import {
    CreateRecurringTransactionSchema,
    UpdateRecurringTransactionSchema,
    RecurringTransactionResponseSchema,
    RecurringTransactionPaginateSchema,
} from '../dto/recurring-transaction.dto';
import { idSchema } from '@/common/schema';
import { z } from 'zod';

// GET /recurring-transactions
registry.registerPath({
    method: 'get',
    path: '/recurring-transactions',
    summary: 'Get paginated list of recurring transactions',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        query: RecurringTransactionPaginateSchema,
    },
    responses: {
        200: {
            description: 'Paginated templates list',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        z.object({
                            data: z.array(RecurringTransactionResponseSchema),
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

// GET /recurring-transactions/:id
registry.registerPath({
    method: 'get',
    path: '/recurring-transactions/{id}',
    summary: 'Get recurring transaction template by ID',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        200: {
            description: 'Recurring transaction template details',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        RecurringTransactionResponseSchema,
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
        404: {
            description: 'Template not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// POST /recurring-transactions
registry.registerPath({
    method: 'post',
    path: '/recurring-transactions',
    summary: 'Create a new recurring transaction template',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateRecurringTransactionSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Template created successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        RecurringTransactionResponseSchema,
                    ),
                },
            },
        },
        400: {
            description: 'Validation error',
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

// PATCH /recurring-transactions/:id
registry.registerPath({
    method: 'patch',
    path: '/recurring-transactions/{id}',
    summary: 'Update recurring transaction template by ID',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
        body: {
            content: {
                'application/json': {
                    schema: UpdateRecurringTransactionSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Template updated successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        RecurringTransactionResponseSchema,
                    ),
                },
            },
        },
        400: {
            description: 'Validation error',
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
            description: 'Template not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// DELETE /recurring-transactions/:id
registry.registerPath({
    method: 'delete',
    path: '/recurring-transactions/{id}',
    summary: 'Delete recurring transaction template by ID',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        204: {
            description: 'Template deleted successfully (No Content)',
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
        404: {
            description: 'Template not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// POST /recurring-transactions/:id/pause
registry.registerPath({
    method: 'post',
    path: '/recurring-transactions/{id}/pause',
    summary: 'Pause/Deactivate recurring transaction template',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        200: {
            description: 'Template paused successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        RecurringTransactionResponseSchema,
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
        404: {
            description: 'Template not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// POST /recurring-transactions/:id/resume
registry.registerPath({
    method: 'post',
    path: '/recurring-transactions/{id}/resume',
    summary: 'Resume/Reactivate recurring transaction template',
    tags: ['Recurring Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        200: {
            description: 'Template resumed successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        RecurringTransactionResponseSchema,
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
        404: {
            description: 'Template not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});
