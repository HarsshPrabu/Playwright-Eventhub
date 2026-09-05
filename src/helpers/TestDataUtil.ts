import { randomBytes, randomInt, randomUUID } from 'crypto';

/** Utility for generating dynamic synthetic test data. */
export class TestDataUtil {
  static randomEmail(prefix = 'testuser'): string {
    const timestamp = Date.now().toString().slice(-6);
    const suffix = randomBytes(3).toString('hex');
    return `${prefix}_${timestamp}_${suffix}@example.com`;
  }

  static randomString(length = 8): string {
    return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  static randomFirstName(): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Casey', 'Riley', 'Avery', 'Cameron', 'Dakota'];
    return `${firstNames[randomInt(firstNames.length)]}_${this.randomString(4)}`;
  }

  static randomLastName(): string {
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return `${lastNames[randomInt(lastNames.length)]}_${this.randomString(4)}`;
  }

  static randomInteger(min = 1, max = 10000): number { return randomInt(min, max + 1); }
  static randomUuid(): string { return randomUUID(); }
}
