import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as authRepo from '../repository/drizzle/auth.repository';
import * as passwordService from '../services/password.service';
import { UserEntity } from '../repository/user.entity';
import { v7 as uuidv7 } from 'uuid';

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

if (clientID && clientSecret && callbackURL) {
    passport.use(
        new GoogleStrategy(
            {
                clientID,
                clientSecret,
                callbackURL,
            },
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const name =
                        profile.displayName ||
                        profile.name?.givenName ||
                        'Google User';

                    if (!email) {
                        return done(
                            new Error('No email found in Google profile'),
                            false,
                        );
                    }

                    let user = await authRepo.findUserByEmail(email);

                    if (!user) {
                        // User doesn't exist, create a new one
                        const randomPassword = uuidv7();
                        const passwordHash =
                            await passwordService.hashPassword(randomPassword);

                        user = await authRepo.createUser(
                            UserEntity.create(
                                uuidv7(),
                                email,
                                name,
                                passwordHash,
                                'EGP', // default currency
                            ),
                        );
                    }

                    if (!user) {
                        return done(
                            new Error('Failed to find or create user'),
                            false,
                        );
                    }

                    done(null, user);
                } catch (error) {
                    done(error as Error, false);
                }
            },
        ),
    );
}
