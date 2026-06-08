// Store Data in the Browser

export type StoredValue<T> = {
  value: T;
  expiresAt?: number;
};

export class StorageLib {
  static set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

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

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clear(): void {
    localStorage.clear();
  }

  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Gesamten Storage als JSON exportieren
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
   * JSON in den Storage importieren
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
