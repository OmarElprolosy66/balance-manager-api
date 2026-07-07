import { and, eq, gt } from 'drizzle-orm';
import { db, passwordResetOtpsTable } from '@/database/drizzle';

export async function createPasswordResetOtp(
    userId: string,
    otp: string,
    expiresAt: Date,
) {
    await db
        .delete(passwordResetOtpsTable)
        .where(eq(passwordResetOtpsTable.userId, userId));
    await db.insert(passwordResetOtpsTable).values({
        userId,
        otp,
        expiresAt,
    });
}

export async function findValidPasswordResetOtp(userId: string, otp: string) {
    const [validOtp] = await db
        .select()
        .from(passwordResetOtpsTable)
        .where(
            and(
                eq(passwordResetOtpsTable.userId, userId),
                eq(passwordResetOtpsTable.otp, otp),
                gt(passwordResetOtpsTable.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return validOtp;
}

export async function deletePasswordResetOtp(id: string) {
    await db
        .delete(passwordResetOtpsTable)
        .where(eq(passwordResetOtpsTable.id, id));
}

export async function deleteValidPasswordResetOtp(id: string) {
    await db
        .delete(passwordResetOtpsTable)
        .where(eq(passwordResetOtpsTable.id, id));
}

export async function isExists(id: string): Promise<boolean> {
    const [otp] = await db
        .select({ id: passwordResetOtpsTable.id })
        .from(passwordResetOtpsTable)
        .where(eq(passwordResetOtpsTable.id, id))
        .limit(1);
    return !!otp;
}
