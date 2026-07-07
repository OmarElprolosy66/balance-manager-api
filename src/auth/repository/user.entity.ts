export class UserEntity {
    constructor(
        private id: string,
        private email: string,
        private name: string,
        private passwordHash: string,
        private createdAt: Date,
        private updatedAt: Date,
        private baseCurrency?: string | null,
    ) {}

    static create(
        id: string,
        email: string,
        name: string,
        passwordHash: string,
        baseCurrency: string | null,
        createdAt: Date = new Date(),
        updatedAt: Date = new Date(),
    ): UserEntity {
        return new UserEntity(
            id,
            email,
            name,
            passwordHash,
            createdAt,
            updatedAt,
            baseCurrency,
        );
    }

    // Getters and setters for each property
    getId(): string {
        return this.id;
    }

    getEmail(): string {
        return this.email;
    }

    getName(): string {
        return this.name;
    }

    getPasswordHash(): string {
        return this.passwordHash;
    }

    getBaseCurrency(): string | null | undefined {
        return this.baseCurrency;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }

    getUpdatedAt(): Date {
        return this.updatedAt;
    }

    setEmail(email: string): UserEntity {
        this.email = email;
        return this;
    }

    setName(name: string): UserEntity {
        this.name = name;
        return this;
    }

    setPasswordHash(passwordHash: string): UserEntity {
        this.passwordHash = passwordHash;
        return this;
    }

    setBaseCurrency(baseCurrency: string): UserEntity {
        this.baseCurrency = baseCurrency;
        return this;
    }
}
