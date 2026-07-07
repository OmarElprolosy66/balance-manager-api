export function addDays(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
}

export function addMonths(date: Date, months: number): Date {
    const target = new Date(date.getTime());
    const expectedDay = target.getDate();
    target.setMonth(target.getMonth() + months);
    if (target.getDate() !== expectedDay) {
        target.setDate(0);
    }
    return target;
}

export function addYears(date: Date, years: number): Date {
    const target = new Date(date.getTime());
    const expectedMonth = target.getMonth();
    target.setFullYear(target.getFullYear() + years);
    if (target.getMonth() !== expectedMonth) {
        target.setDate(0);
    }
    return target;
}

export function calculateNextOccurrence(
    current: Date,
    recurrence: 'daily' | 'weekly' | 'monthly' | 'yearly',
): Date {
    switch (recurrence) {
        case 'daily':
            return addDays(current, 1);
        case 'weekly':
            return addDays(current, 7);
        case 'monthly':
            return addMonths(current, 1);
        case 'yearly':
            return addYears(current, 1);
        default:
            throw new Error(`Unsupported recurrence type: ${recurrence}`);
    }
}
