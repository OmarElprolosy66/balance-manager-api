import type { Request, Response } from 'express';
import { UserEntity } from '@/auth/repository/user.entity';
import { success } from '@/common/utils/std.res';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryPaginateDto,
} from '../dto/category.dto';
import * as categoryService from '../services/category.service';

export async function createCategory(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const data = req.body as CreateCategoryDto;
    const category = await categoryService.createCategory(userId, data);
    res.status(201).json(success(category));
}

export async function getCategories(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const paginate = req.query as unknown as CategoryPaginateDto;
    const result = await categoryService.getCategories(userId, paginate);
    res.json(success(result));
}

export async function getCategoryById(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const categoryId = req.params.id as string;
    const category = await categoryService.getCategoryById(userId, categoryId);
    res.json(success(category));
}

export async function updateCategory(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const categoryId = req.params.id as string;
    const data = req.body as UpdateCategoryDto;
    const category = await categoryService.updateCategory(
        userId,
        categoryId,
        data,
    );
    res.json(success(category));
}

export async function deleteCategory(req: Request, res: Response) {
    const userId = (req.user as UserEntity).getId();
    const categoryId = req.params.id as string;
    await categoryService.deleteCategory(userId, categoryId);
    res.status(204).send();
}
