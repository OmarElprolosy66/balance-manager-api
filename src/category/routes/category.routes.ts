import { Router } from 'express';
import Passport from '@/auth/passport/passport';
import { validate } from '@/common/middleware';
import { idSchema } from '@/common/schema';
import * as categoryController from '../controllers/category.controller';
import {
    CreateCategorySchema,
    UpdateCategorySchema,
    CategoryPaginateSchema,
} from '../dto/category.dto';

const router = Router();

// Protect all routes with JWT auth
router.use(Passport.authenticate('jwt', { session: false }));

router.get(
    '/',
    validate({ query: CategoryPaginateSchema }),
    categoryController.getCategories,
);

router.get(
    '/:id',
    validate({ params: idSchema }),
    categoryController.getCategoryById,
);

router.post(
    '/',
    validate({ body: CreateCategorySchema }),
    categoryController.createCategory,
);

router.patch(
    '/:id',
    validate({ params: idSchema, body: UpdateCategorySchema }),
    categoryController.updateCategory,
);

router.delete(
    '/:id',
    validate({ params: idSchema }),
    categoryController.deleteCategory,
);

export default router;
