import {
    registry,
    zSuccessResponse,
    zFailedResponse,
} from '@/common/utils/swagger';
import {
    CreateTransactionSchema,
    UpdateTransactionSchema,
    TransactionResponseSchema,
    TransactionPaginateSchema,
    TransactionPaginatedResponseSchema,
} from '../dto/transaction.dto';
import { idSchema } from '@/common/schema';

// GET /transactions
registry.registerPath({
    method: 'get',
    path: '/transactions',
    summary: 'Get paginated list of transactions',
    tags: ['Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        query: TransactionPaginateSchema,
    },
    responses: {
        200: {
            description: 'Paginated transactions list',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        TransactionPaginatedResponseSchema,
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

// GET /transactions/:id
registry.registerPath({
    method: 'get',
    path: '/transactions/{id}',
    summary: 'Get transaction by ID',
    tags: ['Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        200: {
            description: 'Transaction details',
            content: {
                'application/json': {
                    schema: zSuccessResponse(TransactionResponseSchema),
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
            description: 'Transaction not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// POST /transactions
registry.registerPath({
    method: 'post',
    path: '/transactions',
    summary: 'Create a new transaction',
    tags: ['Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateTransactionSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Transaction created successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(TransactionResponseSchema),
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

// PATCH /transactions/:id
registry.registerPath({
    method: 'patch',
    path: '/transactions/{id}',
    summary: 'Update transaction by ID',
    tags: ['Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
        body: {
            content: {
                'application/json': {
                    schema: UpdateTransactionSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Transaction updated successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(TransactionResponseSchema),
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
            description: 'Transaction not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// DELETE /transactions/:id
registry.registerPath({
    method: 'delete',
    path: '/transactions/{id}',
    summary: 'Soft delete transaction by ID',
    tags: ['Transactions'],
    security: [{ bearerAuth: [] }],
    request: {
        params: idSchema,
    },
    responses: {
        204: {
            description: 'Transaction deleted successfully (No Content)',
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
        404: {
            description: 'Transaction not found',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});
