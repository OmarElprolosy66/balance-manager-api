import * as transactionRepo from '../repository/drizzle/transaction.repository';
import * as categoryRepo from '@/category/repository/drizzle/category.repository';
import { NotFoundError } from '@/common/errors';

import type {
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionResponseDto,
    TransactionPaginateDto,
} from '../dto';

// TODO: Handle mapping errors
function mapToDto(transaction: any): TransactionResponseDto {
    return {
        id: transaction.id,
        type: transaction.type as 'income' | 'expense',
        categoryId: transaction.categoryId,
        currencyCode: transaction.currencyCode,
        amount: Number(transaction.amount),
        exchangeRate: Number(transaction.exchangeRate),
        baseCurrencyAmount: Number(transaction.baseCurrencyAmount),
        description: transaction.description ?? undefined,
        transactionDate: transaction.transactionDate.toISOString(),
    };
}

export async function createTransaction(
    userId: string,
    data: CreateTransactionDto,
): Promise<TransactionResponseDto> {
    const categoryExists = await categoryRepo.isExists(userId, data.categoryId);
    if (!categoryExists) {
        throw new NotFoundError(
            'Category not found or does not belong to the user',
        );
    }
    const transaction = await transactionRepo.create(userId, data);
    return mapToDto(transaction);
}

export async function getTransactions(
    userId: string,
    paginate: TransactionPaginateDto,
) {
    const result = await transactionRepo.findAll(userId, paginate);
    return {
        data: result.data.map(mapToDto),
        total: result.total,
        page: result.page,
        limit: result.limit,
    };
}

export async function getTransactionById(
    userId: string,
    id: string,
): Promise<TransactionResponseDto | null> {
    const transaction = await transactionRepo.findById(userId, id);
    if (!transaction) return null;
    return mapToDto(transaction);
}

export async function updateTransaction(
    userId: string,
    id: string,
    data: UpdateTransactionDto,
): Promise<TransactionResponseDto | null> {
    if (data.categoryId !== undefined) {
        const categoryExists = await categoryRepo.isExists(
            userId,
            data.categoryId,
        );
        if (!categoryExists) {
            throw new NotFoundError(
                'Category not found or does not belong to the user',
            );
        }
    }
    const transaction = await transactionRepo.update(userId, id, data);
    if (!transaction) return null;
    return mapToDto(transaction);
}

export async function deleteTransaction(
    userId: string,
    id: string,
): Promise<boolean> {
    const transaction = await transactionRepo.remove(userId, id);
    return !!transaction;
}
