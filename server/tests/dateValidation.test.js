import test from 'node:test';
import assert from 'node:assert/strict';

import { isValidDateString } from '../src/utils/dateValidation.js';

// Test 1: A correct date should be accepted.
test('accepts a valid date', () => {
  const result = isValidDateString('2026-11-26');

  assert.equal(result, true);
});

// Test 2: A valid leap-year date should be accepted.
test('accepts February 29 in a leap year', () => {
  const result = isValidDateString('2024-02-29');

  assert.equal(result, true);
});

// Test 3: An impossible date should be rejected.
test('rejects an invalid calendar date', () => {
  const result = isValidDateString('2026-02-30');

  assert.equal(result, false);
});

// Test 4: Incorrect date format should be rejected.
test('rejects an incorrect date format', () => {
  const result = isValidDateString('26-11-2026');

  assert.equal(result, false);
});
