import { DateTime } from 'luxon';

/** Date and time utilities for test data and assertions. */
export class DateTimeUtil {
  static now(zone: string = 'local'): DateTime { return DateTime.now().setZone(zone); }
  static todayISO(zone?: string): string { return this.now(zone).toISODate() || ''; }
  static addDays(days: number, format = 'yyyy-MM-dd', zone?: string): string {
    return this.now(zone).plus({ days }).toFormat(format);
  }
  static nowISO(): string { return DateTime.now().toISO() || ''; }
  static format(dateInput: string | Date, targetFormat = 'yyyy-MM-dd HH:mm:ss'): string {
    const dt = typeof dateInput === 'string' ? DateTime.fromISO(dateInput) : DateTime.fromJSDate(dateInput);
    return dt.isValid ? dt.toFormat(targetFormat) : '';
  }
  static compactDate(daysOffset = 0): string { return this.now().plus({ days: daysOffset }).toFormat('yyyyMMdd'); }
  static timestampForFileName(): string { return this.now().toFormat('yyyyMMdd_HHmmss'); }
}
