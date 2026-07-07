import { eq } from 'drizzle-orm';

import { db, usersTable } from '@/database/drizzle';
export { usersTable } from '@/database/drizzle'; // Temp solution Untill find better way to give select options without service lyer see impl details of data lyer
import { UserEntity } from '../user.entity';

const userSelectOptions = {
    id: usersTable.id,
    email: usersTable.email,
    name: usersTable.name,
    passwordHash: usersTable.passwordHash,
    baseCurrency: usersTable.baseCurrency,
    createdAt: usersTable.createdAt,
    updatedAt: usersTable.updatedAt,
} as const;

// TODO: Test And if it works useit
export async function isExists(id: string): Promise<boolean> {
    const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);
    return !!user;
}

export async function isExistsByEmail(email: string): Promise<boolean> {
    const [user] = await db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
    return !!user;
}

export async function findUserByEmail(
    email: string,
    selectOptions = userSelectOptions,
): Promise<UserEntity | null> {
    const [user] = await db
        .select(selectOptions)
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);
    return user
        ? UserEntity.create(
              user.id,
              user.email,
              user.name,
              user.passwordHash,
              user.baseCurrency,
              user.createdAt,
              user.updatedAt,
          )
        : null;
}

export async function createUser(
    user: UserEntity,
    selectOptions = userSelectOptions,
): Promise<UserEntity | null> {
    const [savedUser] = await db
        .insert(usersTable)
        .values({
            email: user.getEmail(),
            name: user.getName(),
            passwordHash: user.getPasswordHash(),
            baseCurrency: user.getBaseCurrency(),
        })
        .returning(selectOptions);
    return savedUser
        ? UserEntity.create(
              savedUser.id,
              savedUser.email,
              savedUser.name,
              savedUser.passwordHash,
              savedUser.baseCurrency,
              savedUser.createdAt,
              savedUser.updatedAt,
          )
        : null;
}

export async function findUserById(
    id: string,
    selectOptions = userSelectOptions,
): Promise<UserEntity | null> {
    const [user] = await db
        .select(selectOptions)
        .from(usersTable)
        .where(eq(usersTable.id, id))
        .limit(1);
    return user
        ? UserEntity.create(
              user.id,
              user.email,
              user.name,
              user.passwordHash,
              user.baseCurrency,
              user.createdAt,
              user.updatedAt,
          )
        : null;
}

export async function updatePasswordHash(
    userId: string,
    newPasswordHash: string,
): Promise<void> {
    await db
        .update(usersTable)
        .set({ passwordHash: newPasswordHash })
        .where(eq(usersTable.id, userId));
}
