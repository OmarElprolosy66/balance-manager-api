import type { Request, Response } from 'express';
import { UserEntity } from '@/auth/repository/user.entity';
import { success } from '@/common/utils/std.res';
import { NotFoundError } from '@/common/errors';
import type {
    CreateRecurringTransactionDto,
    UpdateRecurringTransactionDto,
    RecurringTransactionPaginateDto,
} from '../dto';
import * as recurringService from '../services/recurring-transaction.service';

export async function createRecurringTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const data = req.body as CreateRecurringTransactionDto;
    const template = await recurringService.createRecurringTransaction(
        userId,
        data,
    );
    res.status(201).json(success(template));
}

export async function getRecurringTransactions(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const paginate = req.query as unknown as RecurringTransactionPaginateDto;
    const result = await recurringService.getRecurringTransactions(
        userId,
        paginate,
    );
    res.json(success(result));
}

export async function getRecurringTransactionById(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const templateId = req.params.id as string;
    const template = await recurringService.getRecurringTransactionById(
        userId,
        templateId,
    );
    if (!template) {
        throw new NotFoundError('Recurring transaction template not found');
    }
    res.json(success(template));
}

export async function updateRecurringTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const templateId = req.params.id as string;
    const data = req.body as UpdateRecurringTransactionDto;
    const template = await recurringService.updateRecurringTransaction(
        userId,
        templateId,
        data,
    );
    if (!template) {
        throw new NotFoundError('Recurring transaction template not found');
    }
    res.json(success(template));
}

export async function deleteRecurringTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const templateId = req.params.id as string;
    const deleted = await recurringService.deleteRecurringTransaction(
        userId,
        templateId,
    );
    if (!deleted) {
        throw new NotFoundError('Recurring transaction template not found');
    }
    res.status(204).send();
}

export async function pauseRecurringTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const templateId = req.params.id as string;
    const template = await recurringService.pauseRecurringTransaction(
        userId,
        templateId,
    );
    if (!template) {
        throw new NotFoundError('Recurring transaction template not found');
    }
    res.json(success(template));
}

export async function resumeRecurringTransaction(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const templateId = req.params.id as string;
    const template = await recurringService.resumeRecurringTransaction(
        userId,
        templateId,
    );
    if (!template) {
        throw new NotFoundError('Recurring transaction template not found');
    }
    res.json(success(template));
}
