import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { PaginateSchema } from '@/common/schema/paginate.shcema';

extendZodWithOpenApi(z);

export const recurrenceEnumSchema = z.enum([
    'daily',
    'weekly',
    'monthly',
    'yearly',
]);

export const CreateRecurringTransactionSchema = z.object({
    title: z
        .string()
        .min(1)
        .max(255)
        .describe(
            'The title or description template for the recurring transaction.',
        )
        .openapi({ example: 'Netflix Subscription' }),
    amount: z
        .number()
        .positive()
        .describe(
            'The amount of the recurring transaction, must be a positive number.',
        )
        .openapi({ example: 15.49 }),
    categoryId: z
        .string()
        .uuid()
        .describe(
            'The UUID of the category associated with this recurring transaction.',
        )
        .openapi({ example: 'a41e4567-e89b-12d3-a456-426614174999' }),
    currencyCode: z
        .string()
        .length(3)
        .describe('The currency code for the recurring transaction, e.g., USD.')
        .openapi({ example: 'USD' }),
    type: z
        .enum(['income', 'expense'])
        .describe('The type of transaction, either income or expense.')
        .openapi({ example: 'expense' }),
    recurrence: recurrenceEnumSchema
        .describe(
            'How frequently the transaction recurs (daily, weekly, monthly, yearly).',
        )
        .openapi({ example: 'monthly' }),
    startDate: z
        .string()
        .datetime()
        .describe(
            'The starting date and time from which the recurrences begin.',
        )
        .openapi({ example: '2026-07-01T00:00:00.000Z' }),
    endDate: z
        .string()
        .datetime()
        .nullable()
        .optional()
        .describe(
            'The date and time after which no further transactions are generated.',
        )
        .openapi({ example: '2027-07-01T00:00:00.000Z' }),
    isActive: z
        .boolean()
        .optional()
        .default(true)
        .describe(
            'Indicates whether this recurring transaction template is active.',
        )
        .openapi({ example: true }),
});

export type CreateRecurringTransactionDto = z.infer<
    typeof CreateRecurringTransactionSchema
>;

export const UpdateRecurringTransactionSchema =
    CreateRecurringTransactionSchema.partial();
export type UpdateRecurringTransactionDto = z.infer<
    typeof UpdateRecurringTransactionSchema
>;

export const RecurringTransactionResponseSchema =
    CreateRecurringTransactionSchema.extend({
        id: z
            .string()
            .uuid()
            .describe('The unique UUID of the recurring transaction template.')
            .openapi({ example: '678f6543-e21b-34c5-d678-0123456789ab' }),
        nextOccurrenceAt: z
            .string()
            .datetime()
            .describe('The next scheduled occurrence date and time.')
            .openapi({ example: '2026-07-01T00:00:00.000Z' }),
        version: z
            .number()
            .int()
            .nonnegative()
            .describe('The version number for offline synchronization.')
            .openapi({ example: 1 }),
        createdAt: z
            .string()
            .datetime()
            .describe('The date and time when the template was created.')
            .openapi({ example: '2026-06-28T14:40:00.000Z' }),
        updatedAt: z
            .string()
            .datetime()
            .describe('The date and time when the template was last updated.')
            .openapi({ example: '2026-06-28T14:40:00.000Z' }),
    });

export type RecurringTransactionResponseDto = z.infer<
    typeof RecurringTransactionResponseSchema
>;

export const RecurringTransactionPaginateSchema = PaginateSchema.extend({
    sortBy: z
        .enum(['title', 'amount', 'nextOccurrenceAt', 'createdAt'])
        .optional()
        .default('createdAt')
        .describe('Field to sort by.')
        .openapi({ example: 'nextOccurrenceAt' }),
    sortOrder: z
        .enum(['asc', 'desc'])
        .optional()
        .default('asc')
        .describe('Sort order.')
        .openapi({ example: 'asc' }),
    isActive: z
        .boolean()
        .optional()
        .describe('Filter by activity status.')
        .openapi({ example: true }),
});

export type RecurringTransactionPaginateDto = z.infer<
    typeof RecurringTransactionPaginateSchema
>;
