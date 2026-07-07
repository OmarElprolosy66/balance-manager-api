import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import pinoHttp from 'pino-http';

import { logger } from '@/config';
import { errorHandler } from '@/common/middleware';
import router from './router';

export const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') {
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        }),
    );
}
app.use(passport.initialize());
app.use(
    pinoHttp({
        logger,
    }),
);
app.disable('x-powered-by');

app.use('/api/v1', router);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
}

/**
 * TODO: Make Transactions CRUD.
 * TODO: Make Obligations CRUD.
 * TODO: Add Auto creation of default categories on user registration.
 * TODO: Create e2e tests.
 * TODO: Create unit tests.
 * TODO: Continue Auth system(refresh rooute, google auth, reset password (requires mailing service)).
 * TODO: Add Swagger documentation.
 * TODO: Create CI/CD pipeline.
 * TODO: Create README.md file with documentations.
 * TODO: On passing tests, auto deploy to production server.
 */
