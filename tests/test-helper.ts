import { db, pool } from '@/database/drizzle/db';
import {
    currenciesTable,
    categoriesTable,
    usersTable,
    devicesTable,
    transactionsTable,
    recurringTransactionsTable,
    passwordResetOtpsTable,
    emailVerificationOtpsTable,
} from '@/database/drizzle/schema';
import { sql, eq } from 'drizzle-orm';
import request from 'supertest';
import { app } from '@/main';
import { v7 as uuidv7 } from 'uuid';
import { sign } from 'jsonwebtoken';

/**
 * Truncate all tables to ensure clean slate for tests.
 */
export async function clearDatabase() {
    await db.delete(emailVerificationOtpsTable);
    await db.delete(passwordResetOtpsTable);
    await db.delete(recurringTransactionsTable);
    await db.delete(transactionsTable);
    await db.delete(devicesTable);
    await db.delete(categoriesTable);
    await db.delete(usersTable);
}

/**
 * Seed basic currencies required for foreign key constraints.
 */
export async function seedCurrencies() {
    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
        {
            code: 'EGP',
            name: 'Egyptian Pound',
            symbol: 'EGP',
            decimalPlaces: 2,
        },
    ];
    for (const currency of currencies) {
        const [existing] = await db
            .select()
            .from(currenciesTable)
            .where(eq(currenciesTable.code, currency.code))
            .limit(1);
        if (!existing) {
            await db.insert(currenciesTable).values(currency);
        }
    }
}

/**
 * Close pool connection.
 */
export async function closeDatabaseConnection() {
    await pool.end();
}

/**
 * Helper to register and login a test user, returning the credentials.
 */
export async function createUserAndLogin(
    email = 'testuser@example.com',
    name = 'Test User',
) {
    const secretKey =
        process.env.JWT_SECRET ||
        '120f6e5b4ea32f65bda68452fcfaaef06b0136e1d0e4a6f60bc3771fa0936dd6';
    const verificationToken = sign(
        { email, purpose: 'signup_verification' },
        secretKey,
        { expiresIn: '15m' },
    );

    const signupData = {
        email,
        password: 'password123',
        name,
        deviceIdentifier: 'test-device-uuid',
        platform: 'android',
        baseCurrency: 'USD',
        verificationToken,
    };

    // Sign up
    await request(app).post('/api/v1/auth/signup').send(signupData);

    // Log in
    const loginRes = await request(app).post('/api/v1/auth/login').send({
        email,
        password: 'password123',
        deviceIdentifier: 'test-device-uuid',
        platform: 'android',
    });

    const body = loginRes.body as any;
    const accessToken = body?.data?.accessToken as string;

    const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

    return {
        accessToken,
        userId: user.id,
        deviceIdentifier: 'test-device-uuid',
    };
}

/**
 * Helper to create a category for a user.
 */
export async function createTestCategory(
    userId: string,
    name = 'Test Category',
) {
    const [category] = await db
        .insert(categoriesTable)
        .values({
            id: uuidv7(),
            userId,
            name,
        })
        .returning();
    return category;
}
