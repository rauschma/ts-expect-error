/**
 * Useful whenever you don’t want to use Node’s built-in `assert()` or
 * `assert.ok()` – e.g. in browsers.
 */
export function assertTrue(value: boolean, message=''): asserts value {
  if (!value) {
    throw new TypeError(message);
  }
}

export function assertNonNullable<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new TypeError('Value must not be undefined or null');
  }
}
