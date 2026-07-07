import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const SignUpDtoSchema = z.object({
    email: z.string().email().openapi({ example: 'user@example.com' }),
    password: z.string().min(6).openapi({ example: 'StrongPassword123' }),
    name: z.string().min(2).openapi({ example: 'John Doe' }),
    deviceIdentifier: z
        .string()
        .min(1)
        .openapi({ example: 'device-uuid-1234' }),
    platform: z.string().min(1).openapi({ example: 'android' }),
    baseCurrency: z.string().length(3).openapi({ example: 'USD' }),
});
export type SignUpDto = z.infer<typeof SignUpDtoSchema>;

export const LogInDtoSchema = SignUpDtoSchema.omit({
    name: true,
    baseCurrency: true,
});
export type LogInDto = z.infer<typeof LogInDtoSchema>;

export const UserResponseDtoSchema = z.object({
    email: z.string().email().openapi({ example: 'user@example.com' }),
    name: z.string().openapi({ example: 'John Doe' }),
    accessToken: z.string().min(1).openapi({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOi...',
    }),
    baseCurrency: z.string().length(3).optional().openapi({ example: 'USD' }),
});
export type UserResponseDto = z.infer<typeof UserResponseDtoSchema>;

export const RequestPasswordResetSchema = z.object({
    email: z
        .string()
        .email()
        .describe(
            'The email address of the user who wants to reset their password.',
        )
        .openapi({ example: 'user@example.com' }),
});
export type RequestPasswordResetDto = z.infer<
    typeof RequestPasswordResetSchema
>;

export const VerifyPasswordResetOtpSchema = z.object({
    email: z
        .string()
        .email()
        .describe('The email address of the user.')
        .openapi({ example: 'user@example.com' }),
    otp: z
        .string()
        .length(6)
        .describe('The 6-digit verification code sent to the email.')
        .openapi({ example: '123456' }),
});
export type VerifyPasswordResetOtpDto = z.infer<
    typeof VerifyPasswordResetOtpSchema
>;

export const ConfirmPasswordResetSchema = z.object({
    resetToken: z
        .string()
        .min(1)
        .describe(
            'The short-lived verification token obtained after verifying OTP.',
        )
        .openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzd...' }),
    newPassword: z
        .string()
        .min(6)
        .describe(
            'The new password for the account, must be at least 6 characters.',
        )
        .openapi({ example: 'NewStrongPassword456' }),
});
export type ConfirmPasswordResetDto = z.infer<
    typeof ConfirmPasswordResetSchema
>;

export const GoogleMobileAuthSchema = z.object({
    idToken: z
        .string()
        .min(1)
        .describe(
            'The Google ID Token (JWT) obtained from the native mobile Google Sign-In SDK.',
        )
        .openapi({ example: 'ya29.a0AfB_byD...' }),
});
export type GoogleMobileAuthDto = z.infer<typeof GoogleMobileAuthSchema>;
