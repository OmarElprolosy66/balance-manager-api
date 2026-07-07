import { db } from '@/database/drizzle/db';
import { categoriesTable } from '@/database/drizzle/schema';
import { and, eq, count, asc, desc } from 'drizzle-orm';
import { CategoryEntity } from '../category.entity';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryPaginateDto,
} from '../../dto/category.dto';

function mapToEntity(row: any): CategoryEntity {
    return CategoryEntity.create(
        row.id,
        row.userId,
        row.name,
        row.icon,
        row.color,
    );
}

export async function create(
    userId: string,
    data: CreateCategoryDto,
): Promise<CategoryEntity> {
    const [row] = await db
        .insert(categoriesTable)
        .values({
            userId,
            name: data.name,
            icon: data.icon ?? null,
            color: data.color ?? null,
        })
        .returning();

    return mapToEntity(row);
}

export async function findAll(
    userId: string,
    paginate: CategoryPaginateDto,
): Promise<{
    data: CategoryEntity[];
    total: number;
    page: number;
    limit: number;
}> {
    const conditions = [eq(categoriesTable.userId, userId)];

    const sortOrder = paginate.sortOrder || 'asc';
    const orderColumn = categoriesTable.name;
    const orderFn = sortOrder === 'desc' ? desc(orderColumn) : asc(orderColumn);

    const limitVal = paginate.limit ?? 10;
    const offsetVal = ((paginate.page ?? 1) - 1) * limitVal;

    const data = await db
        .select()
        .from(categoriesTable)
        .where(and(...conditions))
        .orderBy(orderFn)
        .limit(limitVal)
        .offset(offsetVal);

    const [countResult] = await db
        .select({ value: count() })
        .from(categoriesTable)
        .where(and(...conditions));

    const total = countResult ? Number(countResult.value) : 0;

    return {
        data: data.map(mapToEntity),
        total,
        page: paginate.page ?? 1,
        limit: limitVal,
    };
}

export async function findById(
    userId: string,
    id: string,
): Promise<CategoryEntity | null> {
    const [row] = await db
        .select()
        .from(categoriesTable)
        .where(
            and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)),
        )
        .limit(1);

    return row ? mapToEntity(row) : null;
}

export async function update(
    userId: string,
    id: string,
    data: UpdateCategoryDto,
): Promise<CategoryEntity | null> {
    const updateValues: any = {};
    if (data.name !== undefined) updateValues.name = data.name;
    if (data.icon !== undefined) updateValues.icon = data.icon;
    if (data.color !== undefined) updateValues.color = data.color;

    const [row] = await db
        .update(categoriesTable)
        .set(updateValues)
        .where(
            and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)),
        )
        .returning();

    return row ? mapToEntity(row) : null;
}

export async function remove(
    userId: string,
    id: string,
): Promise<CategoryEntity | null> {
    const [row] = await db
        .delete(categoriesTable)
        .where(
            and(eq(categoriesTable.id, id), eq(categoriesTable.userId, userId)),
        )
        .returning();

    return row ? mapToEntity(row) : null;
}

export async function isExists(
    userId: string,
    categoryId: string,
): Promise<boolean> {
    const [category] = await db
        .select({ id: categoriesTable.id })
        .from(categoriesTable)
        .where(
            and(
                eq(categoriesTable.id, categoryId),
                eq(categoriesTable.userId, userId),
            ),
        )
        .limit(1);
    return !!category;
}
