import { DateTime } from 'luxon';

/**
 * Modern date and time utility using Luxon for test frameworks.
 */
export class DateTimeUtil {
  /**
   * Get current DateTime in specified timezone (default: local)
   */
  static now(zone: string = 'local'): DateTime {
    return DateTime.now().setZone(zone);
  }

  /**
   * Current date formatted as YYYY-MM-DD
   */
  static todayISO(zone?: string): string {
    return this.now(zone).toISODate() || '';
  }

  /**
   * Future/Past date relative to today (e.g. addDays(7))
   */
  static addDays(days: number, format: string = 'yyyy-MM-dd', zone?: string): string {
    return this.now(zone).plus({ days }).toFormat(format);
  }

  /**
   * Current timestamp in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  static nowISO(): string {
    return DateTime.now().toISO() || '';
  }

  /**
   * Format any Date or ISO string into a target format
   */
  static format(dateInput: string | Date, targetFormat: string = 'yyyy-MM-dd HH:mm:ss'): string {
    const dt = typeof dateInput === 'string' ? DateTime.fromISO(dateInput) : DateTime.fromJSDate(dateInput);
    return dt.isValid ? dt.toFormat(targetFormat) : '';
  }

  /**
   * Format compact date string (e.g., YYYYMMDD)
   */
  static compactDate(daysOffset: number = 0): string {
    return this.now().plus({ days: daysOffset }).toFormat('yyyyMMdd');
  }

  /**
   * Current timestamp formatted for filenames (e.g., YYYYMMDD_HHmmss)
   */
  static timestampForFileName(): string {
    return this.now().toFormat('yyyyMMdd_HHmmss');
  }
}
