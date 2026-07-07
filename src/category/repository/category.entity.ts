export class CategoryEntity {
    constructor(
        private id: string,
        private userId: string,
        private name: string,
        private icon: string | null,
        private color: string | null,
    ) {}

    static create(
        id: string,
        userId: string,
        name: string,
        icon: string | null = null,
        color: string | null = null,
    ): CategoryEntity {
        return new CategoryEntity(id, userId, name, icon, color);
    }

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getName(): string {
        return this.name;
    }

    getIcon(): string | null {
        return this.icon;
    }

    getColor(): string | null {
        return this.color;
    }

    setName(name: string): CategoryEntity {
        this.name = name;
        return this;
    }

    setIcon(icon: string | null): CategoryEntity {
        this.icon = icon;
        return this;
    }

    setColor(color: string | null): CategoryEntity {
        this.color = color;
        return this;
    }
}
