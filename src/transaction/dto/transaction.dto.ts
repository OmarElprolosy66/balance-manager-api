import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { PaginateSchema } from '@/common/schema/paginate.shcema';

extendZodWithOpenApi(z);

export const transactionTypeEnumSchema = z.enum(['income', 'expense']);

export const CreateTransactionSchema = z.object({
    type: transactionTypeEnumSchema
        .describe('The type of the transaction, either income or expense.')
        .openapi({ example: 'expense' }),
    categoryId: z
        .uuid()
        .describe('The UUID of the category associated with the transaction.')
        .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    currencyCode: z
        .string()
        .max(3)
        .describe('The currency code for the transaction, up to 3 characters.')
        .openapi({ example: 'USD' }),
    amount: z
        .number()
        .positive()
        .describe('The amount of the transaction, must be a positive number.')
        .openapi({ example: 120.5 }),
    exchangeRate: z
        .number()
        .positive()
        .describe(
            "The exchange rate to the user's base currency at the time of the transaction.",
        )
        .openapi({ example: 1.0 }),
    baseCurrencyAmount: z
        .number()
        .positive()
        .describe("The amount of the transaction in the user's base currency.")
        .openapi({ example: 120.5 }),
    description: z
        .string()
        .max(255)
        .describe(
            'A brief description of the transaction, up to 255 characters.',
        )
        .openapi({ example: 'Weekly groceries at Supermarket' }),
    transactionDate: z.iso
        .datetime()
        .describe('The date and time of the transaction.')
        .default(new Date().toISOString())
        .openapi({ example: '2026-06-28T14:30:00.000Z' }),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = CreateTransactionSchema.partial();
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionSchema>;

export const TransactionResponseSchema = CreateTransactionSchema.extend({
    id: z
        .uuid()
        .describe('The UUID of the transaction.')
        .openapi({ example: '987f6543-e21b-34c5-d678-0123456789ab' }),
});
export type TransactionResponseDto = z.infer<typeof TransactionResponseSchema>;

export const TransactionPaginateSchema = PaginateSchema.extend({
    sortBy: z
        .enum(['amount', 'transactionDate'])
        .optional()
        .describe('The field by which to sort the results.')
        .openapi({ example: 'transactionDate' }),
    sortOrder: z
        .enum(['asc', 'desc'])
        .optional()
        .default('asc')
        .describe(
            'The order in which to sort the results, either ascending (asc) or descending (desc).',
        )
        .openapi({ example: 'desc' }),
    filterByType: z
        .enum(['income', 'expense'])
        .optional()
        .describe('Filter transactions by type, either income or expense.')
        .openapi({ example: 'expense' }),
    filterByCategoryId: z
        .uuid()
        .optional()
        .describe('Filter transactions by the UUID of the category.')
        .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    filterByCurrencyCode: z
        .string()
        .max(3)
        .optional()
        .describe('Filter transactions by currency code, up to 3 characters.')
        .openapi({ example: 'USD' }),
});
export type TransactionPaginateDto = z.infer<typeof TransactionPaginateSchema>;

export const TransactionPaginatedResponseSchema = z.object({
    data: z
        .array(TransactionResponseSchema)
        .describe('An array of transactions.'),
    total: z
        .number()
        .int()
        .nonnegative()
        .describe('The total number of transactions available.')
        .openapi({ example: 45 }),
    page: z
        .number()
        .int()
        .min(1)
        .describe('The current page number, starting from 1.')
        .openapi({ example: 1 }),
    limit: z
        .number()
        .int()
        .min(1)
        .max(100)
        .describe('The number of transactions per page, with a maximum of 100.')
        .openapi({ example: 10 }),
});
export type TransactionPaginatedResponseDto = z.infer<
    typeof TransactionPaginatedResponseSchema
>;
