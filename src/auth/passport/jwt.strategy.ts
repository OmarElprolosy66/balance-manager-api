import passportJwt from 'passport-jwt';
import passport from 'passport';

import * as authRepo from '../repository/drizzle/auth.repository';
import type { JwtPayload } from '../services/jwt.service';

const jwtStrategy = passportJwt.Strategy;
const secretOrKey = process.env.JWT_SECRET as string;

passport.use(
    new jwtStrategy(
        {
            jwtFromRequest:
                passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secretOrKey,
        },
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        async (payload: JwtPayload, done) => {
            try {
                const user = await authRepo.findUserById(payload.sub);
                done(null, user);
            } catch (error) {
                done(error, false);
            }
        },
    ),
);

export default passport;
