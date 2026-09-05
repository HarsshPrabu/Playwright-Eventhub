import { expect } from '@playwright/test';

export function validateUIvsDBuniqueValues(uiValues: string[], dbValues: readonly unknown[], columnName: string) {
  const dbValuesAsStrings = dbValues.map(value => String(value));
  const missingInUI = dbValuesAsStrings.filter(dbValue => !uiValues.includes(dbValue));
  const additionalInUI = uiValues.filter(uiValue => !dbValuesAsStrings.includes(uiValue));
  expect(missingInUI, `Missing ${columnName} values in UI: ${missingInUI.join(', ')}`).toHaveLength(0);
  expect(additionalInUI, `Additional ${columnName} values in UI: ${additionalInUI.join(', ')}`).toHaveLength(0);
}

export function normalizeEmpty(str: string): string { return str.replace(/[\s\u00A0]+/g, '').trim(); }

export function validateUIvsDBValuesWithOrder(uiValues: string[], dbValues: readonly unknown[], columnName: string) {
  const dbValuesAsStrings = dbValues.map(value => value === null ? '0' : String(value));
  expect(uiValues.length, `${columnName} count mismatch`).toBe(dbValuesAsStrings.length);
  for (let i = 0; i < dbValuesAsStrings.length; i++) {
    expect(uiValues[i], `${columnName} mismatch at index ${i}`).toBe(dbValuesAsStrings[i]);
  }
}

export function validateNoNegativeUIValues(entries: { label: string; value: string }[]): void {
  for (const { label, value } of entries) {
    if (value === '--' || value === '') continue;
    const num = parseFloat(value);
    expect(isNaN(num), `${label}: "${value}" is not a parseable number`).toBe(false);
    expect(num, `${label}: "${value}" must not be negative`).toBeGreaterThanOrEqual(0);
  }
}

export function validateAllDBValuesAreNull(dbValues: readonly unknown[], columnName: string) {
  for (let i = 0; i < dbValues.length; i++) {
    expect(dbValues[i], `${columnName} at index ${i} should be null`).toBeNull();
  }
}
