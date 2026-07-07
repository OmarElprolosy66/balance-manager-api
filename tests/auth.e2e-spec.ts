import request from 'supertest';
import { app } from '@/main';
import {
    clearDatabase,
    seedCurrencies,
    closeDatabaseConnection,
} from './test-helper';
import { db } from '@/database/drizzle/db';
import { passwordResetOtpsTable } from '@/database/drizzle/schema';

beforeAll(async () => {
    await seedCurrencies();
});

beforeEach(async () => {
    await clearDatabase();
});

afterAll(async () => {
    // Keep database pool alive for subsequent E2E test runs
});

describe('Authentication Module (e2e)', () => {
    const testUser = {
        email: 'auth.e2e@example.com',
        password: 'Password123',
        name: 'Auth Spec User',
        deviceIdentifier: 'device-auth-e2e',
        platform: 'ios',
        baseCurrency: 'USD',
    };

    it('should register a new user, log in, rotate refresh token, and log out', async () => {
        // 1. Sign Up
        const signupRes = await request(app)
            .post('/api/v1/auth/signup')
            .send(testUser);

        expect(signupRes.status).toBe(201);
        expect(signupRes.body.success).toBe(true);
        expect(signupRes.body.data.email).toBe(testUser.email);
        expect(signupRes.body.data.accessToken).toBeDefined();

        // 2. Log In
        const loginRes = await request(app).post('/api/v1/auth/login').send({
            email: testUser.email,
            password: testUser.password,
            deviceIdentifier: testUser.deviceIdentifier,
            platform: testUser.platform,
        });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.success).toBe(true);
        expect(loginRes.body.data.accessToken).toBeDefined();

        // Extract cookie
        const cookies = loginRes.headers['set-cookie'] as string[];
        expect(cookies).toBeDefined();
        const refreshTokenCookie = cookies.find((c) =>
            c.startsWith('refreshToken='),
        );
        expect(refreshTokenCookie).toBeDefined();

        // 3. Refresh Token
        const refreshRes = await request(app)
            .post('/api/v1/auth/refresh-token')
            .set('Cookie', [refreshTokenCookie || ''])
            .send();

        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body.success).toBe(true);
        expect(refreshRes.body.data.accessToken).toBeDefined();

        // 4. Log Out
        const logoutRes = await request(app)
            .get('/api/v1/auth/logout')
            .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
            .set('Cookie', [refreshTokenCookie || ''])
            .send();

        expect(logoutRes.status).toBe(200);
        expect(logoutRes.body.success).toBe(true);
    }, 90000);

    it('should handle OTP password reset flow (request, verify, confirm)', async () => {
        // Pre-requisite: Create user
        await request(app).post('/api/v1/auth/signup').send(testUser);

        // 1. Request OTP
        const reqRes = await request(app)
            .post('/api/v1/auth/reset-password/request')
            .send({ email: testUser.email });

        expect(reqRes.status).toBe(200);
        expect(reqRes.body.success).toBe(true);

        // Retrieve OTP from DB since SMTP is mocked/logged in dev
        const [otpRecord] = await db
            .select()
            .from(passwordResetOtpsTable)
            .limit(1);
        expect(otpRecord).toBeDefined();
        const otp = otpRecord.otp;

        // 2. Verify OTP
        const verifyRes = await request(app)
            .post('/api/v1/auth/reset-password/verify')
            .send({ email: testUser.email, otp });

        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.success).toBe(true);
        expect(verifyRes.body.data.resetToken).toBeDefined();

        const resetToken = verifyRes.body.data.resetToken;

        // 3. Confirm Password Reset
        const confirmRes = await request(app)
            .post('/api/v1/auth/reset-password/confirm')
            .send({
                resetToken,
                newPassword: 'NewPassword999',
            });

        expect(confirmRes.status).toBe(200);
        expect(confirmRes.body.success).toBe(true);

        // 4. Log in with new password to verify
        const newLoginRes = await request(app).post('/api/v1/auth/login').send({
            email: testUser.email,
            password: 'NewPassword999',
            deviceIdentifier: testUser.deviceIdentifier,
            platform: testUser.platform,
        });

        expect(newLoginRes.status).toBe(200);
        expect(newLoginRes.body.success).toBe(true);
    }, 90000);
});
