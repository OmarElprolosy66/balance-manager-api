import { success } from '@/common/utils/std.res';
import * as authService from './services/auth.service';
import { type LogInDto, type SignUpDto, type UserResponseDto } from './dto';
import { UserEntity } from './repository/user.entity';
import { BadRequestError, UnauthorizedError } from '@/common/errors';

import { type CookieOptions, type Request, type Response } from 'express';

const COOKIES_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: process.env.REFRESH_TOKEN_MAX_AGE
        ? parseInt(process.env.REFRESH_TOKEN_MAX_AGE)
        : 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

export async function signUp(req: Request, res: Response) {
    const dto: SignUpDto = req.body as SignUpDto;
    const { user, accessToken, refreshToken } = await authService.signUp(dto);

    const responsePayload: UserResponseDto = {
        email: user.getEmail(),
        name: user.getName(),
        baseCurrency: user.getBaseCurrency() || 'EGP',
        accessToken,
    };

    res.cookie('refreshToken', refreshToken, COOKIES_OPTIONS);

    return res.status(201).json(success(responsePayload));
}

export async function logIn(req: Request, res: Response) {
    const dto: LogInDto = req.body as LogInDto;
    const { user, accessToken, refreshToken } = await authService.login(dto);

    const responsePayload: UserResponseDto = {
        email: user.getEmail(),
        name: user.getName(),
        baseCurrency: user.getBaseCurrency() || 'EGP',
        accessToken,
    };

    res.cookie('refreshToken', refreshToken, COOKIES_OPTIONS);

    return res.status(200).json(success(responsePayload));
}

export async function logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken as string;

    await authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return res
        .status(200)
        .json(success({ message: 'Logged out successfully' }));
}

export async function refreshToken(req: Request, res: Response) {
    const token =
        (req.cookies.refreshToken as string) ||
        (req.body.refreshToken as string);
    if (!token) {
        throw new BadRequestError('Refresh token is required');
    }

    const { accessToken, refreshToken: newRefreshToken } =
        await authService.refreshToken(token);

    res.cookie('refreshToken', newRefreshToken, COOKIES_OPTIONS);

    return res.status(200).json(success({ accessToken }));
}

export async function googleCallback(req: Request, res: Response) {
    const user = req.user as UserEntity;
    if (!user) {
        throw new UnauthorizedError('Google authentication failed');
    }

    const { accessToken, refreshToken } = await authService.oauthLogin(user);

    res.cookie('refreshToken', refreshToken, COOKIES_OPTIONS);

    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth-callback?token=${accessToken}`;
    return res.redirect(redirectUrl);
}

export async function googleMobileAuth(req: Request, res: Response) {
    const { idToken } = req.body as { idToken: string };
    if (!idToken) {
        throw new BadRequestError('Google idToken is required');
    }

    const { accessToken, refreshToken, user } =
        await authService.googleMobileAuth({ idToken });
    res.cookie('refreshToken', refreshToken, COOKIES_OPTIONS);

    return res.status(200).json(
        success({
            email: user.getEmail(),
            name: user.getName(),
            baseCurrency: user.getBaseCurrency() || 'USD',
            accessToken,
            refreshToken,
        } as UserResponseDto),
    );
}

export async function requestPasswordReset(req: Request, res: Response) {
    const { email } = req.body as { email: string };
    if (!email) {
        throw new BadRequestError('Email is required');
    }
    await authService.requestPasswordReset(email);
    return res.json(
        success({ message: 'If the email exists, an OTP has been sent.' }),
    );
}

export async function verifyPasswordResetOtp(req: Request, res: Response) {
    const { email, otp } = req.body as { email: string; otp: string };
    if (!email || !otp) {
        throw new BadRequestError('Email and OTP are required');
    }
    const result = await authService.verifyPasswordResetOtp(email, otp);
    return res.json(success(result));
}

export async function confirmPasswordReset(req: Request, res: Response) {
    const { resetToken, newPassword } = req.body as {
        resetToken: string;
        newPassword: string;
    };
    if (!resetToken || !newPassword) {
        throw new BadRequestError('Reset token and new password are required');
    }
    await authService.confirmPasswordReset(resetToken, newPassword);
    return res.json(
        success({ message: 'Password has been reset successfully' }),
    );
}
