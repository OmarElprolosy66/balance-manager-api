import * as devicesRepo from '@/devices/repository/drizzle';
import * as authRepo from '../repository/drizzle/auth.repository';
import * as passwordService from './password.service';
import * as jwtService from './jwt.service';
import * as passwordResetOtpRepo from '../repository/drizzle/password.repository';
import * as emailVerificationRepo from '../repository/drizzle/email-verification.repository';

import {
    AppError,
    ConflictError,
    NotFoundError,
    BadRequestError,
} from '@/common/errors';
import type { SignUpDto, LogInDto } from '../dto';
import { UserEntity } from '../repository/user.entity';
import { v7 as uuidv7 } from 'uuid';
import { createHash } from 'crypto';
import { sendMail } from './mail.service';
import { sign, verify } from 'jsonwebtoken';

export async function requestSignupOtp(email: string): Promise<void> {
    const existingUser = await authRepo.isExistsByEmail(email);
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await emailVerificationRepo.createEmailVerificationOtp(
        email,
        otp,
        expiresAt,
    );

    const subject = 'Your Signup Verification Code';
    const html = `
        <p>Hello,</p>
        <p>Thank you for signing up for Money Manager. Your One-Time Password (OTP) is:</p>
        <h2 style="font-size: 24px; letter-spacing: 2px;">${otp}</h2>
        <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    `;
    await sendMail(email, subject, html);
}

export async function verifySignupOtp(
    email: string,
    otp: string,
): Promise<{ verificationToken: string }> {
    const validOtp = await emailVerificationRepo.findValidEmailVerificationOtp(
        email,
        otp,
    );

    if (!validOtp) {
        throw new BadRequestError('Invalid or expired OTP');
    }

    await emailVerificationRepo.deleteEmailVerificationOtp(validOtp.id);

    const secretKey = process.env.JWT_SECRET as string;
    const verificationToken = sign(
        { email, purpose: 'signup_verification' },
        secretKey,
        { expiresIn: '15m' },
    );

    return { verificationToken };
}

interface SignupVerificationTokenPayload {
    email: string;
    purpose: string;
}

export async function signUp(
    dto: SignUpDto,
): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    const secretKey = process.env.JWT_SECRET as string;

    let decoded: SignupVerificationTokenPayload;
    try {
        decoded = verify(
            dto.verificationToken,
            secretKey,
        ) as SignupVerificationTokenPayload;
    } catch {
        throw new BadRequestError('Invalid or expired verification token');
    }

    if (
        !decoded ||
        typeof decoded !== 'object' ||
        decoded.purpose !== 'signup_verification' ||
        decoded.email?.toLowerCase() !== dto.email.toLowerCase()
    ) {
        throw new BadRequestError(
            'Invalid or expired verification token for this email',
        );
    }

    const existingUser = await authRepo.isExistsByEmail(dto.email);
    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await passwordService.hashPassword(dto.password);
    const user = await authRepo.createUser(
        UserEntity.create(
            uuidv7(),
            dto.email,
            dto.name,
            passwordHash,
            dto.baseCurrency,
        ),
    );
    if (!user) {
        throw new AppError(
            'Failed to create user',
            500,
            'USER_CREATION_FAILED',
        );
    }

    // TODO: Create default categories for that user

    const { accessToken, refreshToken } = await generateTokensAndUpsertDevice(
        user,
        dto,
    );

    return { user, accessToken, refreshToken };
}

export async function login(
    dto: LogInDto,
): Promise<{ user: UserEntity; accessToken: string; refreshToken: string }> {
    // Find the user by email
    const user = await authRepo.findUserByEmail(dto.email);
    if (!user) {
        throw new NotFoundError('Invalid Credentials');
    }

    // check password

    const isPasswordValid = await passwordService.verifyPassword(
        user.getPasswordHash(),
        dto.password,
    );
    if (!isPasswordValid) {
        throw new NotFoundError('Invalid Credentials');
    }

    // Search for the device by userId and deviceIdentifier, if it exists update its refreshTokenHash, if not create a new device with the refreshTokenHash
    const { accessToken, refreshToken } = await generateTokensAndUpsertDevice(
        user,
        dto,
    );

    return { user, accessToken, refreshToken };
}

export async function oauthLogin(
    user: UserEntity,
): Promise<{ accessToken: string; refreshToken: string }> {
    const defaultDto = {
        deviceIdentifier: 'oauth-device',
        platform: 'oauth',
    };

    const { accessToken, refreshToken } = await generateTokensAndUpsertDevice(
        user,
        defaultDto as any,
    );

    return { accessToken, refreshToken };
}

export async function logout(refreshToken: string): Promise<void> {
    const jwtPayload = await jwtService.verifyRefreshToken(refreshToken);

    return devicesRepo.invalidateRefreshToken(jwtPayload.did);
}

export async function refreshToken(
    refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
    const jwtPayload = await jwtService.verifyRefreshToken(refreshToken);

    const payload = { sub: jwtPayload.sub, did: jwtPayload.did };

    const newAccessToken = await jwtService.generateAccessToken(payload);
    const newRefreshToken = await jwtService.generateRefreshToken(payload);

    const newRefreshTokenHash = createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');
    const expiresAt = new Date(
        Date.now() +
            parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS || '2592000') * 1000,
    ); // default to 30 days if not set
    await devicesRepo.updateDeviceRefreshTokenHash(
        jwtPayload.did,
        newRefreshTokenHash,
        expiresAt,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function generateTokensAndUpsertDevice(
    user: UserEntity,
    dto: LogInDto | SignUpDto,
): Promise<{ accessToken: string; refreshToken: string }> {
    const did = await devicesRepo.upsertDevice(
        user.getId(),
        dto.deviceIdentifier,
        dto.platform,
    );
    if (!did) {
        throw new AppError(
            'Failed to create/update device',
            500,
            'DEVICE_UPSERT_FAILED',
        );
    }

    const payload = { sub: user.getId(), did };

    // generate tokens + search if device exists to update its refresh token and if not create new device
    const accessToken = await jwtService.generateAccessToken(payload);
    const refreshToken = await jwtService.generateRefreshToken(payload);

    const refreshTokenHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');
    const expiresAt = new Date(
        Date.now() +
            parseInt(process.env.REFRESH_TOKEN_TTL_SECONDS || '2592000') * 1000,
    ); // default to 30 days if not set
    await devicesRepo.updateDeviceRefreshTokenHash(
        did,
        refreshTokenHash,
        expiresAt,
    );
    return { accessToken, refreshToken };
}

export async function requestPasswordReset(email: string): Promise<void> {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
        return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    passwordResetOtpRepo.createPasswordResetOtp(user.getId(), otp, expiresAt);

    const subject = 'Your Password Reset OTP';
    // TODO: Use a proper email template for the OTP email
    const html = `
        <p>Hello,</p>
        <p>You requested a password reset. Your One-Time Password (OTP) is:</p>
        <h2 style="font-size: 24px; letter-spacing: 2px;">${otp}</h2>
        <p>This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    `;
    await sendMail(email, subject, html);
}

export async function verifyPasswordResetOtp(
    email: string,
    otp: string,
): Promise<{ resetToken: string }> {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const validOtp = await passwordResetOtpRepo.findValidPasswordResetOtp(
        user.getId(),
        otp,
    );

    if (!validOtp) {
        throw new BadRequestError('Invalid or expired OTP');
    }

    passwordResetOtpRepo.deleteValidPasswordResetOtp(validOtp.id);

    const secretKey = process.env.JWT_SECRET as string;
    const resetToken = sign(
        { sub: user.getId(), purpose: 'password_reset' },
        secretKey,
        { expiresIn: '5m' },
    );

    return { resetToken };
}

export async function googleMobileAuth(params: { idToken: string }) {
    const { idToken } = params;
    const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
    );
    if (!response.ok) {
        throw new BadRequestError('Invalid Google idToken');
    }

    const payload = await response.json();
    const email = payload.email;
    const name = payload.name || payload.given_name || 'Google User';

    if (!email) {
        throw new BadRequestError('Google token did not contain an email');
    }

    let user = await authRepo.findUserByEmail(email);
    if (!user) {
        const randomPassword = uuidv7();
        const passwordHash = await passwordService.hashPassword(randomPassword);
        user = await authRepo.createUser(
            UserEntity.create(uuidv7(), email, name, passwordHash, 'EGP'), // TODO: Change default currency to user local currency based on their location.
        );
        // TODO: Create default categories. category repository.createDefaultCategoriesForUser(user.getId());
    }

    if (!user) {
        throw new AppError('Failed to authenticate Google user', 500);
    }

    const { accessToken, refreshToken } = await oauthLogin(user);

    return { accessToken, refreshToken, user };
}

export async function confirmPasswordReset(
    resetToken: string,
    newPassword: string,
): Promise<void> {
    const secretKey = process.env.JWT_SECRET as string;

    let decoded: any;
    try {
        decoded = verify(resetToken, secretKey);
    } catch (err) {
        throw new BadRequestError('Invalid or expired reset token');
    }

    if (!decoded || decoded.purpose !== 'password_reset') {
        throw new BadRequestError('Invalid reset token purpose');
    }

    const userId = decoded.sub as string;
    const passwordHash = await passwordService.hashPassword(newPassword);

    await authRepo.updatePasswordHash(userId, passwordHash);

    await devicesRepo.invalidateAllRefreshTokensForUser(userId);
}
