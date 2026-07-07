import { Router } from 'express';
import Passport from '@/auth/passport/passport';
import { validate } from '@/common/middleware';
import { idSchema } from '@/common/schema';
import * as recurringController from '../controllers/recurring-transaction.controller';
import {
    CreateRecurringTransactionSchema,
    UpdateRecurringTransactionSchema,
    RecurringTransactionPaginateSchema,
} from '../dto';

const router = Router();

// Protect all routes with JWT auth
router.use(Passport.authenticate('jwt', { session: false }));

router.get(
    '/',
    validate({ query: RecurringTransactionPaginateSchema }),
    recurringController.getRecurringTransactions,
);
router.get(
    '/:id',
    validate({ params: idSchema }),
    recurringController.getRecurringTransactionById,
);
router.post(
    '/',
    validate({ body: CreateRecurringTransactionSchema }),
    recurringController.createRecurringTransaction,
);
router.patch(
    '/:id',
    validate({ params: idSchema, body: UpdateRecurringTransactionSchema }),
    recurringController.updateRecurringTransaction,
);
router.delete(
    '/:id',
    validate({ params: idSchema }),
    recurringController.deleteRecurringTransaction,
);

router.post(
    '/:id/pause',
    validate({ params: idSchema }),
    recurringController.pauseRecurringTransaction,
);
router.post(
    '/:id/resume',
    validate({ params: idSchema }),
    recurringController.resumeRecurringTransaction,
);

export default router;
