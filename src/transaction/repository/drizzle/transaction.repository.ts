import { eq, and, desc, asc, count, isNull } from 'drizzle-orm';
import { db } from '@/database/drizzle';
import { transactionsTable } from '@/database/drizzle/schema';
import type {
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionPaginateDto,
} from '@/transaction/dto';

export async function create(userId: string, data: CreateTransactionDto) {
    const [transaction] = await db
        .insert(transactionsTable)
        .values({
            userId,
            type: data.type,
            categoryId: data.categoryId,
            currencyCode: data.currencyCode,
            amount: data.amount.toString(),
            exchangeRate: data.exchangeRate.toString(),
            baseCurrencyAmount: data.baseCurrencyAmount.toString(),
            description: data.description,
            transactionDate: data.transactionDate
                ? new Date(data.transactionDate)
                : new Date(),
        })
        .returning();
    return transaction;
}

export async function findAll(
    userId: string,
    paginate: TransactionPaginateDto,
) {
    const conditions = [
        eq(transactionsTable.userId, userId),
        isNull(transactionsTable.deletedAt),
    ];

    if (paginate.filterByType) {
        conditions.push(eq(transactionsTable.type, paginate.filterByType));
    }
    if (paginate.filterByCategoryId) {
        conditions.push(
            eq(transactionsTable.categoryId, paginate.filterByCategoryId),
        );
    }
    if (paginate.filterByCurrencyCode) {
        conditions.push(
            eq(transactionsTable.currencyCode, paginate.filterByCurrencyCode),
        );
    }

    const sortBy = paginate.sortBy || 'transactionDate';
    const sortOrder = paginate.sortOrder || 'desc';
    const orderColumn =
        sortBy === 'amount'
            ? transactionsTable.amount
            : transactionsTable.transactionDate;
    const orderFn = sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn);

    const limitVal = paginate.limit ?? 10;
    const offsetVal = ((paginate.page ?? 1) - 1) * limitVal;

    const data = await db
        .select()
        .from(transactionsTable)
        .where(and(...conditions))
        .orderBy(orderFn)
        .limit(limitVal)
        .offset(offsetVal);

    // Get total count
    const [countResult] = await db
        .select({ value: count() })
        .from(transactionsTable)
        .where(and(...conditions));

    const total = countResult ? Number(countResult.value) : 0;

    return {
        data,
        total,
        page: paginate.page ?? 1,
        limit: limitVal,
    };
}

export async function findById(userId: string, id: string) {
    const [transaction] = await db
        .select()
        .from(transactionsTable)
        .where(
            and(
                eq(transactionsTable.id, id),
                eq(transactionsTable.userId, userId),
                isNull(transactionsTable.deletedAt),
            ),
        )
        .limit(1);
    return transaction || null;
}

export async function update(
    userId: string,
    id: string,
    data: UpdateTransactionDto,
) {
    const updateValues: any = {};
    if (data.type !== undefined) updateValues.type = data.type;
    if (data.categoryId !== undefined)
        updateValues.categoryId = data.categoryId;
    if (data.currencyCode !== undefined)
        updateValues.currencyCode = data.currencyCode;
    if (data.amount !== undefined) updateValues.amount = data.amount.toString();
    if (data.exchangeRate !== undefined)
        updateValues.exchangeRate = data.exchangeRate.toString();
    if (data.baseCurrencyAmount !== undefined)
        updateValues.baseCurrencyAmount = data.baseCurrencyAmount.toString();
    if (data.description !== undefined)
        updateValues.description = data.description;
    if (data.transactionDate !== undefined)
        updateValues.transactionDate = new Date(data.transactionDate);

    const [transaction] = await db
        .update(transactionsTable)
        .set(updateValues)
        .where(
            and(
                eq(transactionsTable.id, id),
                eq(transactionsTable.userId, userId),
                isNull(transactionsTable.deletedAt),
            ),
        )
        .returning();
    return transaction || null;
}

export async function remove(userId: string, id: string) {
    const [transaction] = await db
        .update(transactionsTable)
        .set({ deletedAt: new Date() })
        .where(
            and(
                eq(transactionsTable.id, id),
                eq(transactionsTable.userId, userId),
                isNull(transactionsTable.deletedAt),
            ),
        )
        .returning();
    return transaction || null;
}

export async function isExists(userId: string, id: string): Promise<boolean> {
    const [transaction] = await db
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(
            and(
                eq(transactionsTable.id, id),
                eq(transactionsTable.userId, userId),
                isNull(transactionsTable.deletedAt),
            ),
        )
        .limit(1);
    return !!transaction;
}
