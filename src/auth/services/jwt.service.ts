import * as devicesRepo from '@/devices/repository/drizzle';
import ms from 'ms';

import { sign, verify } from 'jsonwebtoken';
import { AppError } from '@/common/errors';
import { createHash } from 'crypto';

export type JwtPayload = {
    sub: string;
    did: string;
};

export async function generateAccessToken(
    payload: JwtPayload,
): Promise<string> {
    const secretKey = process.env.JWT_SECRET as string;
    const expiresIn = (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ||
        '15m') as ms.StringValue;
    if (!secretKey) {
        throw new AppError(
            'JWT secret key is not defined',
            500,
            'JWT_SECRET_KEY_NOT_DEFINED',
        );
    }

    return new Promise((resolve, reject) => {
        sign(payload, secretKey, { expiresIn: expiresIn }, (err, token) => {
            if (err || !token) {
                reject(
                    new AppError(
                        'Failed to generate access token',
                        500,
                        'ACCESS_TOKEN_GENERATION_FAILED',
                    ),
                );
            } else {
                resolve(token);
            }
        });
    });
}

export async function generateRefreshToken(
    payload: JwtPayload,
): Promise<string> {
    const secretKey = process.env.JWT_REFRESH_SECRET as string;
    const expiresIn = (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ||
        '30d') as ms.StringValue;
    if (!secretKey) {
        throw new AppError(
            'JWT secret key is not defined',
            500,
            'JWT_SECRET_KEY_NOT_DEFINED',
        );
    }

    return new Promise((resolve, reject) => {
        sign(payload, secretKey, { expiresIn: expiresIn }, (err, token) => {
            if (err || !token) {
                reject(
                    new AppError(
                        'Failed to generate refresh token',
                        500,
                        'REFRESH_TOKEN_GENERATION_FAILED',
                    ),
                );
            } else {
                resolve(token);
            }
        });
    });
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
        throw new AppError(
            'JWT secret key is not defined',
            500,
            'JWT_SECRET_KEY_NOT_DEFINED',
        );
    }

    return new Promise((resolve, reject) => {
        verify(token, secretKey, (err, decoded) => {
            if (err || !decoded) {
                reject(
                    new AppError(
                        'Invalid access token',
                        401,
                        'INVALID_ACCESS_TOKEN',
                    ),
                );
            } else {
                resolve(decoded as JwtPayload);
            }
        });
    });
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
    const secretKey = process.env.JWT_REFRESH_SECRET;
    if (!secretKey) {
        throw new AppError(
            'JWT secret key is not defined',
            500,
            'JWT_SECRET_KEY_NOT_DEFINED',
        );
    }

    return new Promise((resolve, reject) => {
        verify(
            token,
            secretKey,
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (err, decoded) => {
                if (err || !decoded) {
                    reject(
                        new AppError(
                            'Invalid refresh token',
                            401,
                            'INVALID_REFRESH_TOKEN',
                        ),
                    );
                } else {
                    // check if the refresh token hash exists in the database
                    const { storedToken, isRevoked, expiresAt } =
                        (await devicesRepo.findRefreshTokenHashById(
                            (decoded as JwtPayload).did,
                        )) ?? {
                            storedToken: null,
                            isRevoked: null,
                            expiresAt: null,
                        };
                    const refreshTokenHash = createHash('sha256')
                        .update(token)
                        .digest('hex');
                    if (
                        !storedToken ||
                        refreshTokenHash !== storedToken ||
                        isRevoked ||
                        !expiresAt ||
                        expiresAt < new Date()
                    ) {
                        reject(
                            new AppError(
                                'Refresh token has been revoked',
                                401,
                                'REFRESH_TOKEN_REVOKED',
                            ),
                        );
                    }
                    resolve(decoded as JwtPayload);
                }
            },
        );
    });
}
