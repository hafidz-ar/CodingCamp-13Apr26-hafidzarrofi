/**
 * @fileoverview Pure input validation functions.
 * No DOM access, no side effects.
 */

/**
 * Returns false for blank or whitespace-only strings.
 * @param {string} value
 * @returns {boolean}
 */
export function isNonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns false for non-positive, non-finite, or non-numeric values.
 * @param {*} value
 * @returns {boolean}
 */
export function isValidAmount(value) {
  const num = Number(value);
  return isFinite(num) && num > 0;
}

/**
 * Validates a new custom category name against an existing list.
 * Rejects blank/whitespace names and case-insensitive duplicates.
 * @param {string} name
 * @param {string[]} existingList
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCategoryName(name, existingList) {
  if (!isNonEmpty(name)) {
    return { valid: false, error: 'Category name cannot be blank.' };
  }
  const lower = name.trim().toLowerCase();
  const isDuplicate = existingList.some(c => c.toLowerCase() === lower);
  if (isDuplicate) {
    return { valid: false, error: 'Category already exists.' };
  }
  return { valid: true };
}

/**
 * Validates all form fields and returns a result object.
 * @param {string} name
 * @param {*} amount
 * @param {string} category
 * @returns {{ valid: boolean, errors: { name?: string, amount?: string, category?: string } }}
 */
export function validateForm(name, amount, category) {
  const errors = {};

  if (!isNonEmpty(name)) {
    errors.name = 'Item name is required.';
  }

  if (!isValidAmount(amount)) {
    errors.amount = 'Amount must be a positive number.';
  }

  if (!isNonEmpty(category)) {
    errors.category = 'Please select a category.';
  }

  const valid = Object.keys(errors).length === 0;
  return { valid, errors };
}
