import {
    calculateNextOccurrence,
    addDays,
    addMonths,
    addYears,
} from './services/recurring-transaction.service';

describe('Recurring Transaction Date Math', () => {
    describe('addDays', () => {
        it('should add days correctly', () => {
            const start = new Date('2026-06-28T12:00:00.000Z');
            const result = addDays(start, 5);
            expect(result.toISOString()).toBe('2026-07-03T12:00:00.000Z');
        });
    });

    describe('addMonths', () => {
        it('should add months correctly on standard months', () => {
            const start = new Date('2026-06-15T12:00:00.000Z');
            const result = addMonths(start, 2);
            expect(result.toISOString()).toBe('2026-08-15T12:00:00.000Z');
        });

        it('should clamp date when overflowing from 31st to month with fewer days (non-leap year)', () => {
            const start = new Date('2026-01-31T12:00:00.000Z');
            const result = addMonths(start, 1); // February 2026 has 28 days
            expect(result.toISOString()).toBe('2026-02-28T12:00:00.000Z');
        });

        it('should clamp date when overflowing from 31st to month with fewer days (leap year)', () => {
            const start = new Date('2028-01-31T12:00:00.000Z');
            const result = addMonths(start, 1); // February 2028 has 29 days
            expect(result.toISOString()).toBe('2028-02-29T12:00:00.000Z');
        });

        it('should handle standard overflow like August 31 to September 30', () => {
            const start = new Date('2026-08-31T12:00:00.000Z');
            const result = addMonths(start, 1);
            expect(result.toISOString()).toBe('2026-09-30T12:00:00.000Z');
        });
    });

    describe('addYears', () => {
        it('should add years correctly', () => {
            const start = new Date('2026-06-28T12:00:00.000Z');
            const result = addYears(start, 3);
            expect(result.toISOString()).toBe('2029-06-28T12:00:00.000Z');
        });

        it('should clamp leap day Feb 29 to Feb 28 on non-leap years', () => {
            const start = new Date('2024-02-29T12:00:00.000Z'); // Leap year
            const result = addYears(start, 1); // 2025 is non-leap
            expect(result.toISOString()).toBe('2025-02-28T12:00:00.000Z');
        });
    });

    describe('calculateNextOccurrence', () => {
        it('should calculate daily occurrences', () => {
            const start = new Date('2026-06-28T12:00:00.000Z');
            const result = calculateNextOccurrence(start, 'daily');
            expect(result.toISOString()).toBe('2026-06-29T12:00:00.000Z');
        });

        it('should calculate weekly occurrences', () => {
            const start = new Date('2026-06-28T12:00:00.000Z');
            const result = calculateNextOccurrence(start, 'weekly');
            expect(result.toISOString()).toBe('2026-07-05T12:00:00.000Z');
        });

        it('should calculate monthly occurrences', () => {
            const start = new Date('2026-06-28T12:00:00.000Z');
            const result = calculateNextOccurrence(start, 'monthly');
            expect(result.toISOString()).toBe('2026-07-28T12:00:00.000Z');
        });

        it('should calculate yearly occurrences', () => {
            const start = new Date('2026-06-28T12:00:00.000Z');
            const result = calculateNextOccurrence(start, 'yearly');
            expect(result.toISOString()).toBe('2027-06-28T12:00:00.000Z');
        });
    });
});
