import request from 'supertest';
import { app } from '@/main';
import {
    clearDatabase,
    seedCurrencies,
    closeDatabaseConnection,
} from './test-helper';
import { db } from '@/database/drizzle/db';
import {
    passwordResetOtpsTable,
    emailVerificationOtpsTable,
} from '@/database/drizzle/schema';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';

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

    it('should handle signup OTP verification flow and complete registration, login, token refresh, and logout', async () => {
        // 1. Request Signup OTP
        const otpReqRes = await request(app)
            .post('/api/v1/auth/signup/request-otp')
            .send({ email: testUser.email });

        expect(otpReqRes.status).toBe(200);
        expect(otpReqRes.body.success).toBe(true);

        // Fetch OTP from DB
        const [otpRecord] = await db
            .select()
            .from(emailVerificationOtpsTable)
            .where(eq(emailVerificationOtpsTable.email, testUser.email))
            .limit(1);
        expect(otpRecord).toBeDefined();

        // 2. Verify Signup OTP
        const verifyOtpRes = await request(app)
            .post('/api/v1/auth/signup/verify-otp')
            .send({ email: testUser.email, otp: otpRecord.otp });

        expect(verifyOtpRes.status).toBe(200);
        expect(verifyOtpRes.body.success).toBe(true);
        expect(verifyOtpRes.body.data.verificationToken).toBeDefined();

        const verificationToken = verifyOtpRes.body.data.verificationToken;

        // 3. Complete Sign Up using verificationToken
        const signupRes = await request(app)
            .post('/api/v1/auth/signup')
            .send({ ...testUser, verificationToken });

        expect(signupRes.status).toBe(201);
        expect(signupRes.body.success).toBe(true);
        expect(signupRes.body.data.email).toBe(testUser.email);
        expect(signupRes.body.data.accessToken).toBeDefined();

        // 4. Log In
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

        // 5. Refresh Token
        const refreshRes = await request(app)
            .post('/api/v1/auth/refresh-token')
            .set('Cookie', [refreshTokenCookie || ''])
            .send();

        expect(refreshRes.status).toBe(200);
        expect(refreshRes.body.success).toBe(true);
        expect(refreshRes.body.data.accessToken).toBeDefined();

        // 6. Log Out
        const logoutRes = await request(app)
            .get('/api/v1/auth/logout')
            .set('Authorization', `Bearer ${refreshRes.body.data.accessToken}`)
            .set('Cookie', [refreshTokenCookie || ''])
            .send();

        expect(logoutRes.status).toBe(200);
        expect(logoutRes.body.success).toBe(true);
    }, 90000);

    it('should reject signup without a valid verification token', async () => {
        // Attempt signup without verificationToken
        const missingRes = await request(app)
            .post('/api/v1/auth/signup')
            .send(testUser);

        expect(missingRes.status).toBe(400);

        // Attempt signup with fake verificationToken
        const invalidRes = await request(app)
            .post('/api/v1/auth/signup')
            .send({ ...testUser, verificationToken: 'invalid.token.here' });

        expect(invalidRes.status).toBe(400);

        // Attempt signup with token issued for a different email
        const secretKey =
            process.env.JWT_SECRET ||
            '120f6e5b4ea32f65bda68452fcfaaef06b0136e1d0e4a6f60bc3771fa0936dd6';
        const mismatchedToken = sign(
            {
                email: 'someoneelse@example.com',
                purpose: 'signup_verification',
            },
            secretKey,
            { expiresIn: '15m' },
        );

        const mismatchRes = await request(app)
            .post('/api/v1/auth/signup')
            .send({ ...testUser, verificationToken: mismatchedToken });

        expect(mismatchRes.status).toBe(400);
    });

    it('should reject signup OTP verification with incorrect OTP', async () => {
        await request(app)
            .post('/api/v1/auth/signup/request-otp')
            .send({ email: testUser.email });

        const verifyRes = await request(app)
            .post('/api/v1/auth/signup/verify-otp')
            .send({ email: testUser.email, otp: '000000' });

        expect(verifyRes.status).toBe(400);
    });

    it('should reject signup OTP request if user already exists', async () => {
        const secretKey =
            process.env.JWT_SECRET ||
            '120f6e5b4ea32f65bda68452fcfaaef06b0136e1d0e4a6f60bc3771fa0936dd6';
        const verificationToken = sign(
            { email: testUser.email, purpose: 'signup_verification' },
            secretKey,
            { expiresIn: '15m' },
        );

        // Create user first
        await request(app)
            .post('/api/v1/auth/signup')
            .send({ ...testUser, verificationToken });

        // Request OTP for already registered email
        const conflictRes = await request(app)
            .post('/api/v1/auth/signup/request-otp')
            .send({ email: testUser.email });

        expect(conflictRes.status).toBe(409);
    });

    it('should handle OTP password reset flow (request, verify, confirm)', async () => {
        // Pre-requisite: Create user with verificationToken
        const secretKey =
            process.env.JWT_SECRET ||
            '120f6e5b4ea32f65bda68452fcfaaef06b0136e1d0e4a6f60bc3771fa0936dd6';
        const verificationToken = sign(
            { email: testUser.email, purpose: 'signup_verification' },
            secretKey,
            { expiresIn: '15m' },
        );

        await request(app)
            .post('/api/v1/auth/signup')
            .send({ ...testUser, verificationToken });

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
