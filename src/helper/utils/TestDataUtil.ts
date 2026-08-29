import { randomBytes, randomInt, randomUUID } from 'crypto';

/**
 * Utility for generating dynamic synthetic test data
 */
export class TestDataUtil {
  /**
   * Generates a unique random email
   */
  static randomEmail(prefix: string = 'testuser'): string {
    const timestamp = Date.now().toString().slice(-6);
    const suffix = randomBytes(3).toString('hex');
    return `${prefix}_${timestamp}_${suffix}@example.com`;
  }

  /**
   * Generates a random alphanumeric string
   */
  static randomString(length: number = 8): string {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Generates a random first name
   */
  static randomFirstName(): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Casey', 'Riley', 'Avery', 'Cameron', 'Dakota'];
    return `${firstNames[randomInt(firstNames.length)]}_${this.randomString(4)}`;
  }

  /**
   * Generates a random last name
   */
  static randomLastName(): string {
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${lastNames[randomInt(lastNames.length)]}_${this.randomString(4)}`;
  }

  /**
   * Generates a random integer within a range [min, max]
   */
  static randomInteger(min: number = 1, max: number = 10000): number {
    return randomInt(min, max + 1);
  }

  /**
   * Generates a random UUID v4
   */
  static randomUuid(): string {
    return randomUUID();
  }
}
