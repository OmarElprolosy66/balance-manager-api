import { eq, and, lte, desc, asc, count } from 'drizzle-orm';
import { db } from '@/database/drizzle';
import {
    recurringTransactionsTable,
    transactionsTable,
} from '@/database/drizzle/schema';
import type {
    CreateRecurringTransactionDto,
    UpdateRecurringTransactionDto,
    RecurringTransactionPaginateDto,
} from '@/transaction/dto';
import { calculateNextOccurrence } from '@/common/utils/dateMath';

export async function create(
    userId: string,
    data: CreateRecurringTransactionDto & { nextOccurrenceAt: Date },
) {
    const [template] = await db
        .insert(recurringTransactionsTable)
        .values({
            userId,
            title: data.title,
            amount: data.amount.toString(),
            categoryId: data.categoryId,
            currencyCode: data.currencyCode,
            type: data.type,
            recurrence: data.recurrence,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            nextOccurrenceAt: data.nextOccurrenceAt,
            isActive: data.isActive ?? true,
            version: 1,
        })
        .returning();
    return template;
}

export async function findAll(
    userId: string,
    paginate: RecurringTransactionPaginateDto,
) {
    const conditions = [eq(recurringTransactionsTable.userId, userId)];

    if (paginate.isActive !== undefined) {
        conditions.push(
            eq(recurringTransactionsTable.isActive, paginate.isActive),
        );
    }

    const sortBy = paginate.sortBy || 'createdAt';
    const sortOrder = paginate.sortOrder || 'asc';

    const orderColumn =
        sortBy === 'title'
            ? recurringTransactionsTable.title
            : sortBy === 'amount'
              ? recurringTransactionsTable.amount
              : sortBy === 'nextOccurrenceAt'
                ? recurringTransactionsTable.nextOccurrenceAt
                : recurringTransactionsTable.createdAt;

    const orderFn = sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn);

    const limitVal = paginate.limit ?? 10;
    const offsetVal = ((paginate.page ?? 1) - 1) * limitVal;

    const data = await db
        .select()
        .from(recurringTransactionsTable)
        .where(and(...conditions))
        .orderBy(orderFn)
        .limit(limitVal)
        .offset(offsetVal);

    // Get total count
    const [countResult] = await db
        .select({ value: count() })
        .from(recurringTransactionsTable)
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
    const [template] = await db
        .select()
        .from(recurringTransactionsTable)
        .where(
            and(
                eq(recurringTransactionsTable.id, id),
                eq(recurringTransactionsTable.userId, userId),
            ),
        )
        .limit(1);
    return template || null;
}

export async function update(
    userId: string,
    id: string,
    data: UpdateRecurringTransactionDto & {
        nextOccurrenceAt?: Date;
        version?: number;
    },
    tx: any = db,
) {
    const updateValues: any = {};
    if (data.title !== undefined) updateValues.title = data.title;
    if (data.amount !== undefined) updateValues.amount = data.amount.toString();
    if (data.categoryId !== undefined)
        updateValues.categoryId = data.categoryId;
    if (data.currencyCode !== undefined)
        updateValues.currencyCode = data.currencyCode;
    if (data.type !== undefined) updateValues.type = data.type;
    if (data.recurrence !== undefined)
        updateValues.recurrence = data.recurrence;
    if (data.startDate !== undefined)
        updateValues.startDate = new Date(data.startDate);
    if (data.endDate !== undefined)
        updateValues.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.nextOccurrenceAt !== undefined)
        updateValues.nextOccurrenceAt = data.nextOccurrenceAt;
    if (data.isActive !== undefined) updateValues.isActive = data.isActive;
    if (data.version !== undefined) updateValues.version = data.version;

    const [template] = await tx
        .update(recurringTransactionsTable)
        .set(updateValues)
        .where(
            and(
                eq(recurringTransactionsTable.id, id),
                eq(recurringTransactionsTable.userId, userId),
            ),
        )
        .returning();
    return template || null;
}

export async function remove(userId: string, id: string) {
    const [template] = await db
        .delete(recurringTransactionsTable)
        .where(
            and(
                eq(recurringTransactionsTable.id, id),
                eq(recurringTransactionsTable.userId, userId),
            ),
        )
        .returning();
    return template || null;
}

export async function findActiveBeforeDate(
    userId: string,
    maxDate: Date,
    tx: any = db,
) {
    return tx
        .select()
        .from(recurringTransactionsTable)
        .where(
            and(
                eq(recurringTransactionsTable.userId, userId),
                eq(recurringTransactionsTable.isActive, true),
                lte(recurringTransactionsTable.nextOccurrenceAt, maxDate),
            ),
        );
}

export async function findActiveBeforeDateWithLock(
    userId: string,
    maxDate: Date,
    tx: any = db,
) {
    return tx
        .select()
        .from(recurringTransactionsTable)
        .where(
            and(
                eq(recurringTransactionsTable.userId, userId),
                eq(recurringTransactionsTable.isActive, true),
                lte(recurringTransactionsTable.nextOccurrenceAt, maxDate),
            ),
        )
        .for('update');
}

export async function generateTransactions(userId: string) {
    const now = new Date();
    await db.transaction(async (tx) => {
        // Find and lock active templates that are due
        const templates = await findActiveBeforeDateWithLock(userId, now, tx);

        for (const template of templates) {
            let currentOcc = new Date(template.nextOccurrenceAt);
            const endDate = template.endDate
                ? new Date(template.endDate)
                : null;
            const transactionsToCreate: any[] = [];

            while (currentOcc <= now) {
                if (endDate && currentOcc > endDate) {
                    break;
                }

                transactionsToCreate.push({
                    userId: template.userId,
                    type: template.type,
                    categoryId: template.categoryId,
                    currencyCode: template.currencyCode,
                    amount: template.amount,
                    exchangeRate: '1.00',
                    baseCurrencyAmount: template.amount,
                    description: template.title, // preserve title as description
                    transactionDate: new Date(currentOcc.getTime()),
                });

                const nextOcc = calculateNextOccurrence(
                    currentOcc,
                    template.recurrence,
                );
                if (endDate && nextOcc > endDate) {
                    currentOcc = nextOcc;
                    break;
                }
                currentOcc = nextOcc;
            }

            if (transactionsToCreate.length > 0) {
                // Bulk insert generated transactions
                await tx.insert(transactionsTable).values(transactionsToCreate);

                // Update nextOccurrenceAt and increment template version
                const nextActiveStatus =
                    endDate && currentOcc > endDate ? false : template.isActive;
                await update(
                    userId,
                    template.id,
                    {
                        nextOccurrenceAt: currentOcc,
                        isActive: nextActiveStatus,
                        version: template.version + 1,
                    },
                    tx,
                );
            }
        }
    });
}

export async function isExists(userId: string, id: string): Promise<boolean> {
    const [template] = await db
        .select({ id: recurringTransactionsTable.id })
        .from(recurringTransactionsTable)
        .where(
            and(
                eq(recurringTransactionsTable.id, id),
                eq(recurringTransactionsTable.userId, userId),
            ),
        )
        .limit(1);
    return !!template;
}
