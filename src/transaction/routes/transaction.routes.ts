import { Router } from 'express';

import Passport from '@/auth/passport/passport';
import { validate } from '@/common/middleware';
import { idSchema } from '@/common/schema';

import * as transactionController from '../controllers/transaction.controller';
import {
    CreateTransactionSchema,
    UpdateTransactionSchema,
    TransactionPaginateSchema,
} from '../dto';

const router = Router();

router.use(Passport.authenticate('jwt', { session: false }));

router.get(
    '/',
    validate({ query: TransactionPaginateSchema }),
    transactionController.getTransactions,
);
router.get(
    '/:id',
    validate({ params: idSchema }),
    transactionController.getTransactionById,
);
router.post(
    '/',
    validate({ body: CreateTransactionSchema }),
    transactionController.createTransaction,
);
router.patch(
    '/:id',
    validate({ params: idSchema, body: UpdateTransactionSchema }),
    transactionController.updateTransaction,
);
router.delete(
    '/:id',
    validate({ params: idSchema }),
    transactionController.deleteTransaction,
);

export default router;
