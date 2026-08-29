import { expect } from '@playwright/test';

export function validateUIvsDBuniqueValues(uiValues: string[], dbValues: any[], columnName: string) {
  // Convert DB values to strings for comparison
  const dbValuesAsStrings = dbValues.map(value => String(value));
  
  const missingInUI = dbValuesAsStrings.filter(dbValue => !uiValues.includes(dbValue));
  const additionalInUI = uiValues.filter(uiValue => !dbValuesAsStrings.includes(uiValue));
  
  console.log(`${columnName} - DB count: ${dbValuesAsStrings.length}, UI count: ${uiValues.length}`);
  console.log(`${columnName} - Missing in UI:`, missingInUI);
  console.log(`${columnName} - Additional in UI:`, additionalInUI);
  
  expect(missingInUI, `Missing ${columnName} values in UI: ${missingInUI.join(', ')}`).toHaveLength(0);
  expect(additionalInUI, `Additional ${columnName} values in UI: ${additionalInUI.join(', ')}`).toHaveLength(0);
}

export function normalizeEmpty(str: string): string {
  return str.replace(/[\s\u00A0]+/g, '').trim();
}

// export function validateUIvsDBValuesWithOrder(uiValues: string[], dbValues: any[], columnName: string) {
//   const dbValuesAsStrings = dbValues.map(value => String(value));
  
//   console.log(`${columnName} - DB values:`, dbValuesAsStrings);
//   console.log(`${columnName} - UI values:`, uiValues);
  
//   expect(uiValues.length, `${columnName} count mismatch`).toBe(dbValuesAsStrings.length);
  
//   for (let i = 0; i < dbValuesAsStrings.length; i++) {
//     expect(uiValues[i], `${columnName} mismatch at index ${i}`).toBe(dbValuesAsStrings[i]);
//   }

//   console.log(`${columnName} validation successful - All values match in the UI and DB`);

// }

// export function validateUIvsDBValuesWithOrder(uiValues: string[], dbValues: any[], columnName: string) {
//   const dbValuesAsStrings = dbValues.map(value => String(value));
  
//   console.log(`\n=== ${columnName} Validation ===`);
//   console.log(`DB values: [${dbValuesAsStrings.join(', ')}]`);
//   console.log(`UI values: [${uiValues.join(', ')}]`);
  
//   expect(uiValues.length, `${columnName} count mismatch`).toBe(dbValuesAsStrings.length);
  
//   for (let i = 0; i < dbValuesAsStrings.length; i++) {
//     const match = uiValues[i] === dbValuesAsStrings[i];
//     console.log(`Index ${i}: DB="${dbValuesAsStrings[i]}" | UI="${uiValues[i]}" | ${match ? '✓' : '✗'}`);
//     expect(uiValues[i], `${columnName} mismatch at index ${i}`).toBe(dbValuesAsStrings[i]);
//   }

//   console.log(`✓ ${columnName} validation successful - All ${dbValuesAsStrings.length} values match\n`);
// }


export function validateUIvsDBValuesWithOrder(uiValues: string[], dbValues: any[], columnName: string) {
  const dbValuesAsStrings = dbValues.map(value => value === null ? '0' : String(value));
  
  console.log(`\n=== ${columnName} Validation ===`);
  console.log(`DB values: [${dbValuesAsStrings.join(', ')}]`);
  console.log(`UI values: [${uiValues.join(', ')}]`);
  
  expect(uiValues.length, `${columnName} count mismatch`).toBe(dbValuesAsStrings.length);
  
  for (let i = 0; i < dbValuesAsStrings.length; i++) {
    const match = uiValues[i] === dbValuesAsStrings[i];
    console.log(`Index ${i}: DB="${dbValuesAsStrings[i]}" | UI="${uiValues[i]}" | ${match ? '✓' : '✗'}`);
    expect(uiValues[i], `${columnName} mismatch at index ${i}`).toBe(dbValuesAsStrings[i]);
  }

  console.log(`✓ ${columnName} validation successful - All ${dbValuesAsStrings.length} values match\n`);
}





/**
 * Validates that all provided UI string values are non-negative numbers.
 * Skips '--' and empty strings (placeholder display for no data).
 */
export function validateNoNegativeUIValues(
  entries: { label: string; value: string }[]
): void {
  console.log(`\n=== Non-Negative Value Validation ===`);
  for (const { label, value } of entries) {
    if (value === '--' || value === '') {
      console.log(`  ${label}: "${value}" — skipped (no data placeholder)`);
      continue;
    }
    const num = parseFloat(value);
    expect(isNaN(num), `${label}: "${value}" is not a parseable number`).toBe(false);
    expect(num, `${label}: "${value}" must not be negative`).toBeGreaterThanOrEqual(0);
    console.log(`  ${label}: ${value} ✓`);
  }
  console.log(`✓ All values are non-negative\n`);
}

export function validateAllDBValuesAreNull(dbValues: any[], columnName: string) {
  console.log(`\n=== ${columnName} Null Validation ===`);
  console.log(`DB values: [${dbValues.join(', ')}]`);
  
  for (let i = 0; i < dbValues.length; i++) {
    const isNull = dbValues[i] === null || dbValues[i] === undefined;
    console.log(`Index ${i}: DB="${dbValues[i]}" | ${isNull ? '✓ null' : '✗ not null'}`);
    expect(dbValues[i], `${columnName} at index ${i} should be null`).toBeNull();
  }
  
  console.log(`✓ ${columnName} validation successful - All ${dbValues.length} values are null\n`);
}




