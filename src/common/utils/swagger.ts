import {
    OpenAPIRegistry,
    OpenApiGeneratorV3,
    extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Extend Zod with OpenAPI properties (enables .openapi() method on Zod objects)
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Register JWT Bearer Authentication scheme in OpenAPI components
export const bearerAuthSecurity = registry.registerComponent(
    'securitySchemes',
    'bearerAuth',
    {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
    },
);

/**
 * Standard Zod response wrapper for successful outputs.
 */
export function zSuccessResponse<T extends z.ZodTypeAny>(
    dataSchema: T,
    description = 'Success',
) {
    return z
        .object({
            success: z
                .literal(true)
                .describe('Indicates that the operation was successful.'),
            data: dataSchema,
        })
        .openapi({
            description,
        });
}

/**
 * Standard Zod response wrapper for failed outputs (error responses).
 */
export function zFailedResponse(
    errorCode = 'ERROR_CODE',
    description = 'Error',
) {
    return z
        .object({
            success: z
                .literal(false)
                .describe('Indicates that the operation failed.'),
            error: z.object({
                code: z
                    .string()
                    .default(errorCode)
                    .describe('Machine-readable uppercase error identifier.'),
                message: z
                    .string()
                    .optional()
                    .describe('Human-readable error explanation.'),
                issues: z
                    .array(z.any())
                    .optional()
                    .describe(
                        'Detailed validation validation parameters list (if code is VALIDATION_ERROR).',
                    ),
            }),
        })
        .openapi({
            description,
        });
}

/**
 * Generates the OpenAPI 3.0.0 document.
 */
export function generateOpenApiDocument() {
    const generator = new OpenApiGeneratorV3(registry.definitions);
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: 'Money Manager API',
            version: '1.0.0',
            description:
                'API Documentation for Money Manager backend services (Mobile-friendly).',
        },
        servers: [
            {
                url: '/api/v1',
                description: 'V1 API Root',
            },
        ],
    });
}
