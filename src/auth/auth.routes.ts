import { Router } from 'express';
import passport from './passport/passport';
import { validate } from '@/common/middleware';
import * as authController from './auth.controller';
import {
    LogInDtoSchema,
    SignUpDtoSchema,
    GoogleMobileAuthSchema,
    RequestPasswordResetSchema,
    VerifyPasswordResetOtpSchema,
    ConfirmPasswordResetSchema,
} from './dto';

const router = Router();

router.post('/login', validate({ body: LogInDtoSchema }), authController.logIn);
router.post(
    '/signup',
    validate({ body: SignUpDtoSchema }),
    authController.signUp,
);

router.get(
    '/logout',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    passport.authenticate('jwt', { session: false }),
    authController.logout,
);

router.post('/refresh-token', authController.refreshToken);

// Google Auth for Web (browser redirects)
// router.get(
//     '/google/web',
//     passport.authenticate('google', { scope: ['profile', 'email'], session: false })
// );

// router.get(
//     '/google/web/callback',
//     passport.authenticate('google', { failureRedirect: '/login', session: false }),
//     authController.googleCallback
// );

// Google Auth for Mobile (direct ID Token exchange)
router.post(
    '/google',
    validate({ body: GoogleMobileAuthSchema }),
    authController.googleMobileAuth,
);

// Password Reset Flow (Mobile-friendly OTP)
router.post(
    '/reset-password/request',
    validate({ body: RequestPasswordResetSchema }),
    authController.requestPasswordReset,
);

router.post(
    '/reset-password/verify',
    validate({ body: VerifyPasswordResetOtpSchema }),
    authController.verifyPasswordResetOtp,
);

router.post(
    '/reset-password/confirm',
    validate({ body: ConfirmPasswordResetSchema }),
    authController.confirmPasswordReset,
);

export default router;
