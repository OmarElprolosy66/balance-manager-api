import * as categoryRepo from '../repository/drizzle/category.repository';
import { CategoryEntity } from '../repository/category.entity';
import { NotFoundError } from '@/common/errors';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryResponseDto,
    CategoryPaginateDto,
} from '../dto/category.dto';

function mapToDto(entity: CategoryEntity): CategoryResponseDto {
    return {
        id: entity.getId(),
        name: entity.getName(),
        icon: entity.getIcon(),
        color: entity.getColor(),
    };
}

export async function createCategory(
    userId: string,
    data: CreateCategoryDto,
): Promise<CategoryResponseDto> {
    const entity = await categoryRepo.create(userId, data);
    return mapToDto(entity);
}

export async function getCategories(
    userId: string,
    paginate: CategoryPaginateDto,
) {
    const result = await categoryRepo.findAll(userId, paginate);
    return {
        data: result.data.map(mapToDto),
        total: result.total,
        page: result.page,
        limit: result.limit,
    };
}

export async function getCategoryById(
    userId: string,
    id: string,
): Promise<CategoryResponseDto> {
    const entity = await categoryRepo.findById(userId, id);
    if (!entity) {
        throw new NotFoundError('Category not found');
    }
    return mapToDto(entity);
}

export async function updateCategory(
    userId: string,
    id: string,
    data: UpdateCategoryDto,
): Promise<CategoryResponseDto> {
    const entity = await categoryRepo.update(userId, id, data);
    if (!entity) {
        throw new NotFoundError('Category not found');
    }
    return mapToDto(entity);
}

export async function deleteCategory(
    userId: string,
    id: string,
): Promise<void> {
    const entity = await categoryRepo.remove(userId, id);
    if (!entity) {
        throw new NotFoundError('Category not found');
    }
}
