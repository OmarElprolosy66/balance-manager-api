import {
    pgTable,
    pgEnum,
    uuid,
    varchar,
    timestamp,
    integer,
    uniqueIndex,
    boolean,
    decimal,
    index,
} from 'drizzle-orm/pg-core';
import { v7 as uuidv7 } from 'uuid';

export const recurrenceEnum = pgEnum('recurrence', [
    'daily',
    'weekly',
    'monthly',
    'yearly',
]);

export const transactionTypeEnum = pgEnum('transaction_type', [
    'income',
    'expense',
]);

export const usersTable = pgTable(
    'users',
    {
        id: uuid('id')
            .primaryKey()
            .$default(() => uuidv7()),
        name: varchar('name', { length: 255 }).notNull(),
        email: varchar('email', { length: 255 }).notNull().unique(),
        passwordHash: varchar('passwordHash', { length: 255 }).notNull(),
        baseCurrency: varchar('baseCurrency', { length: 3 }).references(
            () => currenciesTable.code,
        ),
        createdAt: timestamp('createdAt').notNull().defaultNow(),
        updatedAt: timestamp('updatedAt')
            .notNull()
            .defaultNow()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        uniqueIndex('unique_email').on(table.email),
        uniqueIndex('unique_name').on(table.id),
    ],
);

export const devicesTable = pgTable(
    'devices',
    {
        id: uuid('id')
            .primaryKey()
            .$default(() => uuidv7()),
        userId: uuid('userId')
            .references(() => usersTable.id)
            .notNull(),
        deviceIdentifier: varchar('deviceIdentifier', {
            length: 255,
        }).notNull(),
        platform: varchar('platform', { length: 255 }).notNull(),
        refreshTokenHash: varchar('refreshTokenHash', {
            length: 255,
        }),
        isRevoked: boolean('isRevoked').notNull().default(false),
        expiresAt: timestamp('expiresAt'),
        lastUsedAt: timestamp('lastUsedAt')
            .notNull()
            .defaultNow()
            .$onUpdateFn(() => new Date()),
        lastSyncAt: timestamp('lastSyncAt').notNull().defaultNow(),
        createdAt: timestamp('createdAt').notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex('unique_device_per_user').on(
            table.deviceIdentifier,
            table.userId,
        ),
    ],
);

/// TODO: Make seeder to insert all available currencies into the currencies table
export const currenciesTable = pgTable(
    'currencies',
    {
        code: varchar('code', { length: 3 }).primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        symbol: varchar('symbol', { length: 255 }).notNull(),
        decimalPlaces: integer('decimalPlaces').notNull(),
    },
    (table) => [uniqueIndex('unique_currency_code').on(table.code)],
);

export const categoriesTable = pgTable(
    'categories',
    {
        id: uuid('id')
            .primaryKey()
            .$default(() => uuidv7()),
        userId: uuid('userId')
            .references(() => usersTable.id)
            .notNull(),
        name: varchar('name', { length: 255 }).notNull(), // edge case: two users can have categories with the same name, but one user cannot have two categories with the same name
        icon: varchar('icon', { length: 255 }),
        color: varchar('color', { length: 255 }),
    },
    (table) => [
        uniqueIndex('unique_category_per_user').on(table.id, table.userId),
    ],
);

export const transactionsTable = pgTable('transactions', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    userId: uuid('userId')
        .references(() => usersTable.id)
        .notNull(),
    type: transactionTypeEnum('type').notNull(),
    categoryId: uuid('categoryId').references(() => categoriesTable.id),
    currencyCode: varchar('currencyCode', { length: 3 }).references(
        () => currenciesTable.code,
    ),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    exchangeRate: decimal('exchangeRate', {
        precision: 10,
        scale: 2,
    }).notNull(), // exchange rate to the user's base currency at the time of the transaction, multiplied by 100 to avoid floating point issues
    baseCurrencyAmount: decimal('baseCurrencyAmount', {
        precision: 10,
        scale: 2,
    }).notNull(), // amount converted to the user's base currency using the exchange rate at the time of the transaction
    description: varchar('description', { length: 255 }),
    transactionDate: timestamp('transactionDate').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt') // TODO: Replace with virsion
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
    deletedAt: timestamp('deletedAt'),
});

export const obligationsTable = pgTable('obligations', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    userId: uuid('userId')
        .references(() => usersTable.id)
        .notNull(),
    categoryId: uuid('categoryId')
        .references(() => categoriesTable.id)
        .notNull(),
    currencyCode: varchar('currencyCode', { length: 3 })
        .references(() => currenciesTable.code)
        .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    recurrence: recurrenceEnum('recurrence'),
    nextDueDate: timestamp('nextDueDate').notNull(),
    reminderDays: integer('reminderDays').notNull(), // number of days before the due date to send a reminder
    lastPaidAt: timestamp('lastPaidAt'),
    isActive: boolean('isActive').notNull().default(true),
    note: varchar('note', { length: 255 }),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt')
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
    deletedAt: timestamp('deletedAt'),
});

export const notificationsTable = pgTable('notifications', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    userId: uuid('userId')
        .references(() => usersTable.id)
        .notNull(),
    obligationId: uuid('obligationId')
        .references(() => obligationsTable.id)
        .notNull()
        .unique(),
    scheduledAt: timestamp('scheduledAt').notNull(),
    sent: boolean('sent').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const savingGoalsTable = pgTable('saving_goals', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    userId: uuid('userId')
        .references(() => usersTable.id)
        .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    targetAmount: decimal('targetAmount', {
        precision: 10,
        scale: 2,
    }).notNull(),
    currencyCode: varchar('currencyCode', { length: 3 })
        .references(() => currenciesTable.code)
        .notNull(),
    deadline: timestamp('deadline').notNull(),
    completedAt: timestamp('completedAt'),
});

export const savingContributionsTable = pgTable('saving_contributions', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    goalId: uuid('goalId')
        .references(() => savingGoalsTable.id)
        .notNull(),
    transactionId: uuid('transactionId')
        .references(() => transactionsTable.id)
        .notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const recurringTransactionsTable = pgTable(
    'recurring_transactions',
    {
        id: uuid('id')
            .primaryKey()
            .$default(() => uuidv7()),
        userId: uuid('userId')
            .references(() => usersTable.id)
            .notNull(),
        title: varchar('title', { length: 255 }).notNull(),
        amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
        categoryId: uuid('categoryId')
            .references(() => categoriesTable.id)
            .notNull(),
        currencyCode: varchar('currencyCode', { length: 3 })
            .references(() => currenciesTable.code)
            .notNull(),
        type: transactionTypeEnum('type').notNull(),
        recurrence: recurrenceEnum('recurrence').notNull(),
        startDate: timestamp('startDate').notNull(),
        endDate: timestamp('endDate'),
        nextOccurrenceAt: timestamp('nextOccurrenceAt').notNull(),
        isActive: boolean('isActive').notNull().default(true),
        version: integer('version').notNull().default(1),
        createdAt: timestamp('createdAt').notNull().defaultNow(),
        updatedAt: timestamp('updatedAt')
            .notNull()
            .defaultNow()
            .$onUpdateFn(() => new Date()),
    },
    (table) => [
        index('idx_rec_trans_user_active_next').on(
            table.userId,
            table.isActive,
            table.nextOccurrenceAt,
        ),
    ],
);

export const passwordResetOtpsTable = pgTable('password_reset_otps', {
    id: uuid('id')
        .primaryKey()
        .$default(() => uuidv7()),
    userId: uuid('userId')
        .references(() => usersTable.id, { onDelete: 'cascade' })
        .notNull(),
    otp: varchar('otp', { length: 6 }).notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
});
