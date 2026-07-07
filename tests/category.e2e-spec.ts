import request from 'supertest';
import { app } from '@/main';
import {
    clearDatabase,
    seedCurrencies,
    createUserAndLogin,
} from './test-helper';

beforeAll(async () => {
    await seedCurrencies();
});

beforeEach(async () => {
    await clearDatabase();
});

describe('Category Module (e2e)', () => {
    it('should support complete CRUD lifecycle for categories with ownership isolation', async () => {
        // 1. Create two users
        const userA = await createUserAndLogin(
            'usera.cat@example.com',
            'User A',
        );
        const userB = await createUserAndLogin(
            'userb.cat@example.com',
            'User B',
        );

        // 2. User A creates a category
        const categoryData = {
            name: 'Books & Learning',
            icon: 'book',
            color: '#00FF00',
        };

        const createRes = await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send(categoryData);

        expect(createRes.status).toBe(201);
        expect(createRes.body.success).toBe(true);
        expect(createRes.body.data.id).toBeDefined();
        expect(createRes.body.data.name).toBe(categoryData.name);
        expect(createRes.body.data.icon).toBe(categoryData.icon);
        expect(createRes.body.data.color).toBe(categoryData.color);

        const categoryId = createRes.body.data.id;

        // 3. User B should NOT be able to view User A's category
        const getByOtherUserRes = await request(app)
            .get(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userB.accessToken}`)
            .send();

        expect(getByOtherUserRes.status).toBe(404);
        expect(getByOtherUserRes.body.success).toBe(false);

        // 4. User A should be able to view their own category
        const getByOwnerRes = await request(app)
            .get(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send();

        expect(getByOwnerRes.status).toBe(200);
        expect(getByOwnerRes.body.success).toBe(true);
        expect(getByOwnerRes.body.data.id).toBe(categoryId);

        // 5. User B should NOT be able to update User A's category
        const updateByOtherUserRes = await request(app)
            .patch(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userB.accessToken}`)
            .send({ name: 'Hacked name' });

        expect(updateByOtherUserRes.status).toBe(404);

        // 6. User A should be able to update their category
        const updateByOwnerRes = await request(app)
            .patch(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send({ name: 'Edu & Books', color: '#111111' });

        expect(updateByOwnerRes.status).toBe(200);
        expect(updateByOwnerRes.body.data.name).toBe('Edu & Books');
        expect(updateByOwnerRes.body.data.color).toBe('#111111');

        // 7. User B should NOT be able to delete User A's category
        const deleteByOtherUserRes = await request(app)
            .delete(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userB.accessToken}`)
            .send();

        expect(deleteByOtherUserRes.status).toBe(404);

        // 8. User A deletes their category
        const deleteByOwnerRes = await request(app)
            .delete(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send();

        expect(deleteByOwnerRes.status).toBe(204);

        // 9. Get by ID after deletion returns 404
        const getDeletedRes = await request(app)
            .get(`/api/v1/categories/${categoryId}`)
            .set('Authorization', `Bearer ${userA.accessToken}`)
            .send();

        expect(getDeletedRes.status).toBe(404);
    }, 90000);

    it('should list, sort, and paginate categories', async () => {
        const { accessToken } = await createUserAndLogin(
            'cat.list@example.com',
            'List User',
        );

        // Create 3 categories
        const c1 = { name: 'Food' };
        const c2 = { name: 'Automobile' };
        const c3 = { name: 'Rent' };

        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(c1);
        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(c2);
        await request(app)
            .post('/api/v1/categories')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(c3);

        // Query listing with sort by name desc
        const listDescRes = await request(app)
            .get('/api/v1/categories?sortBy=name&sortOrder=desc')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(listDescRes.status).toBe(200);
        expect(listDescRes.body.data.data).toHaveLength(3);
        expect(listDescRes.body.data.data[0].name).toBe('Rent');
        expect(listDescRes.body.data.data[1].name).toBe('Food');
        expect(listDescRes.body.data.data[2].name).toBe('Automobile');

        // Query listing with pagination
        const paginateRes = await request(app)
            .get('/api/v1/categories?page=1&limit=2&sortBy=name&sortOrder=asc')
            .set('Authorization', `Bearer ${accessToken}`)
            .send();

        expect(paginateRes.status).toBe(200);
        expect(paginateRes.body.data.data).toHaveLength(2);
        expect(paginateRes.body.data.total).toBe(3);
        expect(paginateRes.body.data.data[0].name).toBe('Automobile');
        expect(paginateRes.body.data.data[1].name).toBe('Food');
    }, 90000);
});
