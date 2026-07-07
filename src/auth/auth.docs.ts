import {
    registry,
    zSuccessResponse,
    zFailedResponse,
} from '@/common/utils/swagger';
import {
    SignUpDtoSchema,
    LogInDtoSchema,
    GoogleMobileAuthSchema,
    RequestPasswordResetSchema,
    VerifyPasswordResetOtpSchema,
    ConfirmPasswordResetSchema,
    UserResponseDtoSchema,
} from './dto/auth.dto';
import { z } from 'zod';

// POST /auth/signup
registry.registerPath({
    method: 'post',
    path: '/auth/signup',
    summary: 'Sign up a new user',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: SignUpDtoSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User created successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(UserResponseDtoSchema),
                },
            },
        },
        400: {
            description: 'Validation errors',
            content: {
                'application/json': {
                    schema: zFailedResponse('VALIDATION_ERROR'),
                },
            },
        },
        409: {
            description: 'Email already exists',
            content: {
                'application/json': { schema: zFailedResponse('CONFLICT') },
            },
        },
    },
});

// POST /auth/login
registry.registerPath({
    method: 'post',
    path: '/auth/login',
    summary: 'Login user',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: LogInDtoSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Logged in successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(UserResponseDtoSchema),
                },
            },
        },
        400: {
            description: 'Validation errors',
            content: {
                'application/json': {
                    schema: zFailedResponse('VALIDATION_ERROR'),
                },
            },
        },
        404: {
            description: 'Invalid Credentials',
            content: {
                'application/json': { schema: zFailedResponse('NOT_FOUND') },
            },
        },
    },
});

// GET /auth/logout
registry.registerPath({
    method: 'get',
    path: '/auth/logout',
    summary: 'Log out user',
    tags: ['Auth'],
    security: [{ bearerAuth: [] }],
    responses: {
        200: {
            description: 'Logged out successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(z.object({ message: z.string() })),
                },
            },
        },
        401: {
            description: 'Unauthorized',
            content: {
                'application/json': { schema: zFailedResponse('UNAUTHORIZED') },
            },
        },
    },
});

// POST /auth/refresh-token
registry.registerPath({
    method: 'post',
    path: '/auth/refresh-token',
    summary: 'Rotate and refresh JWT access token',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        refreshToken: z
                            .string()
                            .optional()
                            .describe(
                                'Refresh token (optional if provided in cookies).',
                            ),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Access token rotated successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        z.object({ accessToken: z.string() }),
                    ),
                },
            },
        },
        400: {
            description: 'Refresh token required',
            content: {
                'application/json': {
                    schema: zFailedResponse('REFRESH_TOKEN_REQUIRED'),
                },
            },
        },
        401: {
            description: 'Invalid or revoked refresh token',
            content: {
                'application/json': {
                    schema: zFailedResponse('INVALID_REFRESH_TOKEN'),
                },
            },
        },
    },
});

// POST /auth/google
registry.registerPath({
    method: 'post',
    path: '/auth/google',
    summary: 'Google Mobile Sign-In (Direct Token Exchange)',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: GoogleMobileAuthSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Authenticated successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        z.object({
                            email: z.string(),
                            name: z.string(),
                            baseCurrency: z.string(),
                            accessToken: z.string(),
                            refreshToken: z.string(),
                        }),
                    ),
                },
            },
        },
        400: {
            description: 'Invalid ID Token',
            content: {
                'application/json': {
                    schema: zFailedResponse('INVALID_GOOGLE_TOKEN'),
                },
            },
        },
    },
});

// POST /auth/reset-password/request
registry.registerPath({
    method: 'post',
    path: '/auth/reset-password/request',
    summary: 'Request password reset verification OTP code',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: RequestPasswordResetSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OTP code sent (if account exists)',
            content: {
                'application/json': {
                    schema: zSuccessResponse(z.object({ message: z.string() })),
                },
            },
        },
    },
});

// POST /auth/reset-password/verify
registry.registerPath({
    method: 'post',
    path: '/auth/reset-password/verify',
    summary: 'Verify 6-digit OTP to get reset token',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: VerifyPasswordResetOtpSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'OTP verified, reset token generated',
            content: {
                'application/json': {
                    schema: zSuccessResponse(
                        z.object({ resetToken: z.string() }),
                    ),
                },
            },
        },
        400: {
            description: 'Invalid or expired OTP',
            content: {
                'application/json': { schema: zFailedResponse('INVALID_OTP') },
            },
        },
    },
});

// POST /auth/reset-password/confirm
registry.registerPath({
    method: 'post',
    path: '/auth/reset-password/confirm',
    summary: 'Confirm password reset with JWT token',
    tags: ['Auth'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: ConfirmPasswordResetSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Password reset successfully',
            content: {
                'application/json': {
                    schema: zSuccessResponse(z.object({ message: z.string() })),
                },
            },
        },
        400: {
            description: 'Invalid or expired reset token',
            content: {
                'application/json': {
                    schema: zFailedResponse('INVALID_RESET_TOKEN'),
                },
            },
        },
    },
});
