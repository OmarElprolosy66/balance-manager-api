import { and, eq, gt } from 'drizzle-orm';
import { db, emailVerificationOtpsTable } from '@/database/drizzle';

export async function createEmailVerificationOtp(
    email: string,
    otp: string,
    expiresAt: Date,
): Promise<void> {
    await db
        .delete(emailVerificationOtpsTable)
        .where(eq(emailVerificationOtpsTable.email, email));
    await db.insert(emailVerificationOtpsTable).values({
        email,
        otp,
        expiresAt,
    });
}

export async function findValidEmailVerificationOtp(
    email: string,
    otp: string,
) {
    const [validOtp] = await db
        .select()
        .from(emailVerificationOtpsTable)
        .where(
            and(
                eq(emailVerificationOtpsTable.email, email),
                eq(emailVerificationOtpsTable.otp, otp),
                gt(emailVerificationOtpsTable.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return validOtp;
}

export async function deleteEmailVerificationOtp(id: string): Promise<void> {
    await db
        .delete(emailVerificationOtpsTable)
        .where(eq(emailVerificationOtpsTable.id, id));
}

export async function isExists(id: string): Promise<boolean> {
    const [otp] = await db
        .select({ id: emailVerificationOtpsTable.id })
        .from(emailVerificationOtpsTable)
        .where(eq(emailVerificationOtpsTable.id, id))
        .limit(1);
    return !!otp;
}
