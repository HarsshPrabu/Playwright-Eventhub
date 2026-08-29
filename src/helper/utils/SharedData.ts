import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility class for persisting and sharing test data between test specs/runs
 */
export class SharedData {
  private static dataFilePath = path.join(process.cwd(), 'test-data', 'shared-test-data.json');

  /**
   * Save key-value data to JSON file
   */
  static saveData<T = any>(key: string, value: T): void {
    const dir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let data: Record<string, any> = {};
    if (fs.existsSync(this.dataFilePath)) {
      try {
        const fileContent = fs.readFileSync(this.dataFilePath, 'utf8');
        data = JSON.parse(fileContent);
      } catch (e) {
        data = {};
      }
    }

    data[key] = value;
    fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  }

  /**
   * Load key-value data from JSON file
   */
  static loadData<T = any>(key: string, defaultValue?: T): T | undefined {
    if (!fs.existsSync(this.dataFilePath)) {
      return defaultValue;
    }

    try {
      const fileContent = fs.readFileSync(this.dataFilePath, 'utf8');
      const data = JSON.parse(fileContent);
      return key in data ? data[key] : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  /**
   * Clear shared test data file
   */
  static clearData(): void {
    if (fs.existsSync(this.dataFilePath)) {
      fs.unlinkSync(this.dataFilePath);
    }
  }
}
