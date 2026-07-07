import type { Request, Response } from 'express';
import { UserEntity } from '@/auth/repository/user.entity';
import { success } from '@/common/utils/std.res';
import { NotFoundError } from '@/common/errors';
import type {
    CreateTransactionDto,
    UpdateTransactionDto,
    TransactionPaginateDto,
} from '../dto';
import * as transactionService from '../services/transaction.service';

export async function createTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const transactionData = req.body as CreateTransactionDto;
    const newTransaction = await transactionService.createTransaction(
        userId,
        transactionData,
    );
    res.status(201).json(success(newTransaction));
}

export async function getTransactions(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const paginate = req.query as unknown as TransactionPaginateDto;
    const result = await transactionService.getTransactions(userId, paginate);
    res.json(success(result));
}

export async function getTransactionById(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const transactionId = req.params.id as string;
    const transaction = await transactionService.getTransactionById(
        userId,
        transactionId,
    );
    if (!transaction) {
        throw new NotFoundError('Transaction not found');
    }
    res.json(success(transaction));
}

export async function updateTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const transactionId = req.params.id as string;
    const transactionData = req.body as UpdateTransactionDto;
    const updatedTransaction = await transactionService.updateTransaction(
        userId,
        transactionId,
        transactionData,
    );
    if (!updatedTransaction) {
        throw new NotFoundError('Transaction not found');
    }
    res.json(success(updatedTransaction));
}

export async function deleteTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const transactionId = req.params.id as string;
    const deleted = await transactionService.deleteTransaction(
        userId,
        transactionId,
    );
    if (!deleted) {
        throw new NotFoundError('Transaction not found');
    }
    res.status(204).send();
}
