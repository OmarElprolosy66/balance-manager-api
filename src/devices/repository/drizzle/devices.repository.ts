import { eq } from 'drizzle-orm';

import { db } from '@/database/drizzle';
import { devicesTable } from '@/database/drizzle/schema';

export async function upsertDevice(
    userId: string,
    deviceIdentifier: string,
    platform: string,
): Promise<string | undefined> {
    return (
        await db
            .insert(devicesTable)
            .values({
                userId,
                deviceIdentifier,
                refreshTokenHash: null, // Set refreshTokenHash to null initially
                platform,
            })
            .onConflictDoUpdate({
                target: [devicesTable.userId, devicesTable.deviceIdentifier],
                set: { deviceIdentifier, platform },
            })
            .returning({ id: devicesTable.id })
    )[0]?.id;
}

export async function updateDeviceRefreshTokenHash(
    deviceId: string,
    refreshTokenHash: string,
    expiresAt: Date,
): Promise<void> {
    await db
        .update(devicesTable)
        .set({ refreshTokenHash, expiresAt })
        .where(eq(devicesTable.id, deviceId));
}

export async function findRefreshTokenHashById(id: string): Promise<{
    storedToken: string | null;
    isRevoked: boolean | null;
    expiresAt: Date | null;
} | null> {
    const [device] = await db
        .select({
            refreshTokenHash: devicesTable.refreshTokenHash,
            isRevoked: devicesTable.isRevoked,
            expiresAt: devicesTable.expiresAt,
        })
        .from(devicesTable)
        .where(eq(devicesTable.id, id))
        .limit(1);
    return device
        ? {
              storedToken: device.refreshTokenHash,
              isRevoked: device.isRevoked,
              expiresAt: device.expiresAt,
          }
        : null;
}

export async function invalidateRefreshToken(deviceId: string): Promise<void> {
    await db
        .update(devicesTable)
        .set({ refreshTokenHash: null, isRevoked: true })
        .where(eq(devicesTable.id, deviceId));
}

export async function findDeviceById(id: string): Promise<{
    id: string;
    refreshTokenHash: string | null;
    deviceIdentifier: string;
} | null> {
    return await db
        .select({
            id: devicesTable.id,
            refreshTokenHash: devicesTable.refreshTokenHash,
            deviceIdentifier: devicesTable.deviceIdentifier,
        })
        .from(devicesTable)
        .where(eq(devicesTable.id, id))
        .limit(1)
        .then(([device]) => device || null);
}

export async function invalidateAllRefreshTokensForUser(
    userId: string,
): Promise<void> {
    await db
        .update(devicesTable)
        .set({ refreshTokenHash: null, isRevoked: true })
        .where(eq(devicesTable.userId, userId));
}

export async function isExists(id: string): Promise<boolean> {
    const [device] = await db
        .select({ id: devicesTable.id })
        .from(devicesTable)
        .where(eq(devicesTable.id, id))
        .limit(1);
    return !!device;
}
