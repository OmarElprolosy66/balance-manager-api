import * as recurringRepo from '../repository/drizzle/recurring-transaction.repository';
import * as categoryRepo from '@/category/repository/drizzle/category.repository';
import { NotFoundError } from '@/common/errors';

import type {
    CreateRecurringTransactionDto,
    UpdateRecurringTransactionDto,
    RecurringTransactionResponseDto,
    RecurringTransactionPaginateDto,
} from '../dto';

function mapToDto(template: any): RecurringTransactionResponseDto {
    return {
        id: template.id,
        title: template.title,
        amount: Number(template.amount),
        categoryId: template.categoryId,
        currencyCode: template.currencyCode,
        type: template.type as 'income' | 'expense',
        recurrence: template.recurrence as
            | 'daily'
            | 'weekly'
            | 'monthly'
            | 'yearly',
        startDate: template.startDate.toISOString(),
        endDate: template.endDate ? template.endDate.toISOString() : null,
        nextOccurrenceAt: template.nextOccurrenceAt.toISOString(),
        isActive: template.isActive,
        version: template.version,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
    };
}

// TODO: Move this to Category Service or Repository.
/////////////////////////////////////////////////

export async function createRecurringTransaction(
    userId: string,
    data: CreateRecurringTransactionDto,
): Promise<RecurringTransactionResponseDto> {
    const categoryExists = await categoryRepo.isExists(userId, data.categoryId);
    if (!categoryExists) {
        throw new NotFoundError(
            'Category not found or does not belong to the user',
        );
    }
    const nextOccurrenceAt = new Date(data.startDate);
    const template = await recurringRepo.create(userId, {
        ...data,
        nextOccurrenceAt,
    });
    return mapToDto(template);
}

export async function getRecurringTransactions(
    userId: string,
    paginate: RecurringTransactionPaginateDto,
) {
    const result = await recurringRepo.findAll(userId, paginate);
    return {
        data: result.data.map(mapToDto),
        total: result.total,
        page: result.page,
        limit: result.limit,
    };
}

export async function getRecurringTransactionById(
    userId: string,
    id: string,
): Promise<RecurringTransactionResponseDto | null> {
    const template = await recurringRepo.findById(userId, id);
    if (!template) return null;
    return mapToDto(template);
}

export async function updateRecurringTransaction(
    userId: string,
    id: string,
    data: UpdateRecurringTransactionDto,
): Promise<RecurringTransactionResponseDto | null> {
    const existing = await recurringRepo.findById(userId, id); // TODO: Implement exists function instead of fetching the entire record for performance optimization
    if (!existing) return null;

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

    let nextOccurrenceAt = existing.nextOccurrenceAt;

    // If startDate or recurrence changes, we recalculate nextOccurrenceAt
    if (data.startDate !== undefined || data.recurrence !== undefined) {
        const newStartDate = data.startDate
            ? new Date(data.startDate)
            : existing.startDate;
        nextOccurrenceAt = newStartDate;
    }

    const updated = await recurringRepo.update(userId, id, {
        ...data,
        nextOccurrenceAt,
        version: existing.version + 1,
    });

    if (!updated) return null;
    return mapToDto(updated);
}

export async function deleteRecurringTransaction(
    userId: string,
    id: string,
): Promise<boolean> {
    const deleted = await recurringRepo.remove(userId, id);
    return !!deleted;
}

export async function pauseRecurringTransaction(
    userId: string,
    id: string,
): Promise<RecurringTransactionResponseDto | null> {
    const existing = await recurringRepo.findById(userId, id); // TODO: Implement exists function instead of fetching the entire record for performance optimization
    if (!existing) return null;

    const updated = await recurringRepo.update(userId, id, {
        isActive: false,
        version: existing.version + 1,
    });
    if (!updated) return null;
    return mapToDto(updated);
}

export async function resumeRecurringTransaction(
    userId: string,
    id: string,
): Promise<RecurringTransactionResponseDto | null> {
    const existing = await recurringRepo.findById(userId, id); // TODO: Implement exists function instead of fetching the entire record for performance optimization
    if (!existing) return null;

    const updated = await recurringRepo.update(userId, id, {
        isActive: true,
        version: existing.version + 1,
    });
    if (!updated) return null;
    return mapToDto(updated);
}

export async function generateMissingRecurringTransactions(
    userId: string,
): Promise<void> {
    await recurringRepo.generateTransactions(userId);
}
