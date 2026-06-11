/**
 * Wrapper shape for values that may receive expiration metadata in the future.
 *
 * The current `StorageLib` methods store raw values directly, so this type is
 * mainly useful when callers want to manage their own `expiresAt` convention.
 */
export type StoredValue<T> = {
  value: T;
  expiresAt?: number;
};

/**
 * Small typed wrapper around `localStorage`.
 *
 * Values are serialized with `JSON.stringify` and read with `JSON.parse`. If a
 * value cannot be parsed, `get` returns `null` instead of throwing.
 */
export class StorageLib {
  /**
   * Stores a JSON-serializable value under a key.
   */
  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Reads and parses a value from localStorage.
   *
   * @returns The parsed value or `null` when the key is missing or invalid JSON.
   */
  static get<T>(key: string): T | null {
    const item = localStorage.getItem(key);

    if (!item) {
      return null;
    }

    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  }

  /**
   * Removes a single key from localStorage.
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears the complete browser localStorage for the current origin.
   *
   * Be careful: this affects all keys on the same domain, not only samengine
   * keys.
   */
  static clear(): void {
    localStorage.clear();
  }

  /**
   * Checks whether a key exists in localStorage.
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Exports the complete localStorage content as a JSON string.
   *
   * Existing JSON values are parsed back into objects; non-JSON values are kept
   * as strings.
   */
  static exportToJson(pretty = true): string {
    const data: Record<string, unknown> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key) continue;

      const value = localStorage.getItem(key);

      try {
        data[key] = value ? JSON.parse(value) : null;
      } catch {
        data[key] = value;
      }
    }

    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  /**
   * Imports a JSON object into localStorage.
   *
   * @param json JSON object string, usually created by `exportToJson`.
   * @param overwrite If false, existing keys are preserved.
   */
  static importFromJson(
    json: string,
    overwrite = true
  ): void {
    const data = JSON.parse(json) as Record<string, unknown>;

    for (const [key, value] of Object.entries(data)) {
      if (!overwrite && localStorage.getItem(key) !== null) {
        continue;
      }

      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
