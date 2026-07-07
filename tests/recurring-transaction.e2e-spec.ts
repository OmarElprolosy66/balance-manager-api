import request from 'supertest';
import { app } from '@/main';
import {
    clearDatabase,
    seedCurrencies,
    closeDatabaseConnection,
    createUserAndLogin,
    createTestCategory,
} from './test-helper';
import { synchronize } from '@/devices/services/sync.service';

beforeAll(async () => {
    await seedCurrencies();
});

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    // Keep database pool alive for subsequent E2E test runs
});

describe('Recurring Transaction Module (e2e)', () => {
    it('should perform CRUD, pause, resume, and lazy generation operations', async () => {
        // 1. Setup Auth & Category
        const { accessToken, userId } = await createUserAndLogin(
            'rec.e2e@example.com',
        );
        const category = await createTestCategory(userId, 'Salary');

        // Create a template starting 2 days ago to verify lazy generation
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const templateData = {
            title: 'Monthly Pocket Allowance',
            amount: 200.0,
            categoryId: category.id,
            currencyCode: 'USD',
            type: 'income',
            recurrence: 'daily',
            startDate: twoDaysAgo.toISOString(),
            isActive: true,
        };

        // 2. Create Template
        const createRes = await request(app)
            .post('/api/v1/recurring-transactions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(templateData);

        expect(createRes.status).toBe(201);
        expect(createRes.body.success).toBe(true);
        expect(createRes.body.data.id).toBeDefined();
        expect(createRes.body.data.title).toBe(templateData.title);
        expect(createRes.body.data.isActive).toBe(true);

        const templateId = createRes.body.data.id;

        // 3. Get Template by ID
        const getRes = await request(app)
            .get(`/api/v1/recurring-transactions/${templateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(getRes.status).toBe(200);
        expect(getRes.body.success).toBe(true);
        expect(getRes.body.data.id).toBe(templateId);

        // 4. Update Template
        const updateRes = await request(app)
            .patch(`/api/v1/recurring-transactions/${templateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                amount: 250.0,
                title: 'Monthly Pocket Allowance (Increased)',
            });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.success).toBe(true);
        expect(updateRes.body.data.amount).toBe(250.0);

        // 5. Pause Template
        const pauseRes = await request(app)
            .post(`/api/v1/recurring-transactions/${templateId}/pause`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(pauseRes.status).toBe(200);
        expect(pauseRes.body.success).toBe(true);
        expect(pauseRes.body.data.isActive).toBe(false);

        // 6. Resume Template
        const resumeRes = await request(app)
            .post(`/api/v1/recurring-transactions/${templateId}/resume`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(resumeRes.status).toBe(200);
        expect(resumeRes.body.success).toBe(true);
        expect(resumeRes.body.data.isActive).toBe(true);

        // 7. Verify Lazy Generation
        // Initially, verify that 0 transactions exist
        const checkBeforeRes = await request(app)
            .get('/api/v1/transactions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(checkBeforeRes.body.data.data).toHaveLength(0);

        // Trigger lazy generation via synchronize
        await synchronize(userId, {});

        // Fetch transactions again to verify that daily transactions have been generated
        const checkAfterRes = await request(app)
            .get('/api/v1/transactions')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(checkAfterRes.body.data.data.length).toBeGreaterThan(0);
        expect(checkAfterRes.body.data.data[0].description).toBe(
            'Monthly Pocket Allowance (Increased)',
        );

        // 8. Delete Template
        const deleteRes = await request(app)
            .delete(`/api/v1/recurring-transactions/${templateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(deleteRes.status).toBe(204);

        const getDeletedRes = await request(app)
            .get(`/api/v1/recurring-transactions/${templateId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(getDeletedRes.status).toBe(404);
    }, 90000);
});
