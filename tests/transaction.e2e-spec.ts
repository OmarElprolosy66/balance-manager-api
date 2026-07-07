import request from 'supertest';
import { app } from '@/main';
import {
    clearDatabase,
    seedCurrencies,
    closeDatabaseConnection,
    createUserAndLogin,
    createTestCategory,
} from './test-helper';

beforeAll(async () => {
    await seedCurrencies();
});

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    // Keep database pool alive for subsequent E2E test runs
});

describe('Transaction Module (e2e)', () => {
    it('should perform CRUD operations on transactions', async () => {
        const { accessToken, userId } = await createUserAndLogin(
            'trans.e2e@example.com',
        );
        const category = await createTestCategory(userId, 'Food');

        const transactionData = {
            type: 'expense',
            categoryId: category.id,
            currencyCode: 'USD',
            amount: 50.0,
            exchangeRate: 1.0,
            baseCurrencyAmount: 50.0,
            description: 'Lunch at Cafe',
            transactionDate: new Date().toISOString(),
        };

        const createRes = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(transactionData);

        expect(createRes.status).toBe(201);
        expect(createRes.body.success).toBe(true);
        const transactionId = createRes.body.data.id;

        const getRes = await request(app)
            .get(`/api/v1/transactions/${transactionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(getRes.status).toBe(200);

        const updateRes = await request(app)
            .patch(`/api/v1/transactions/${transactionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                amount: 60.0,
                description: 'Dinner at Cafe',
            });

        expect(updateRes.status).toBe(200);

        const deleteRes = await request(app)
            .delete(`/api/v1/transactions/${transactionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(deleteRes.status).toBe(204);

        const getDeletedRes = await request(app)
            .get(`/api/v1/transactions/${transactionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(getDeletedRes.status).toBe(404);
        expect(getDeletedRes.body.success).toBe(false);
    }, 90000);

    it('should list, sort, and filter transactions', async () => {
        const { accessToken, userId } = await createUserAndLogin(
            'trans.list@example.com',
        );
        const foodCategory = await createTestCategory(userId, 'Food');
        const billsCategory = await createTestCategory(userId, 'Bills');

        const t1 = {
            type: 'expense',
            categoryId: foodCategory.id,
            currencyCode: 'USD',
            amount: 15.0,
            exchangeRate: 1.0,
            baseCurrencyAmount: 15.0,
            description: 'Lunch',
        };
        const t2 = {
            type: 'income',
            categoryId: billsCategory.id,
            currencyCode: 'EGP',
            amount: 500.0,
            exchangeRate: 0.02,
            baseCurrencyAmount: 10.0,
            description: 'Salary',
        };

        const r1 = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(t1);
        expect(r1.status).toBe(201);

        const r2 = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(t2);
        expect(r2.status).toBe(201);

        const filterTypeRes = await request(app)
            .get('/api/v1/transactions?filterByType=income')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(filterTypeRes.status).toBe(200);
        expect(filterTypeRes.body.success).toBe(true);
        expect(filterTypeRes.body.data.data).toHaveLength(1);
        expect(filterTypeRes.body.data.data[0].type).toBe('income');
        expect(filterTypeRes.body.data.data[0].amount).toBe(500.0);

        const sortRes = await request(app)
            .get('/api/v1/transactions?sortBy=amount&sortOrder=desc')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(sortRes.status).toBe(200);
        expect(sortRes.body.success).toBe(true);
        expect(sortRes.body.data.data).toHaveLength(2);
        expect(sortRes.body.data.data[0].amount).toBe(500.0);
        expect(sortRes.body.data.data[1].amount).toBe(15.0);
    }, 90000);
});
