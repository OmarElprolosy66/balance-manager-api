export class DeviceEntity {
    constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly deviceIdentifier: string,
        private refreshTokenHash: string | null,
    ) {}

    public static create(
        id: string,
        userId: string,
        deviceIdentifier: string,
        refreshTokenHash: string | null,
    ): DeviceEntity {
        return new DeviceEntity(id, userId, deviceIdentifier, refreshTokenHash);
    }

    public getId(): string {
        return this.id;
    }

    public getUserId(): string {
        return this.userId;
    }

    public getDeviceIdentifier(): string {
        return this.deviceIdentifier;
    }

    public getRefreshTokenHash(): string | null {
        return this.refreshTokenHash;
    }

    public setRefreshTokenHash(refreshTokenHash: string | null): void {
        this.refreshTokenHash = refreshTokenHash;
    }
}
