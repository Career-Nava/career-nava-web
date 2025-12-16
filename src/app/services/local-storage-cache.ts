export class LocalStorageCache<T> {
  constructor(
    private readonly storageKey: string,
    private readonly ttlMs: number
  ) {
  }

  get(): T[] | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const isStale = Date.now() - parsed.timestamp > this.ttlMs;

      if (isStale || !Array.isArray(parsed.data)) {
        this.clear();
        return null;
      }

      return parsed.data as T[];
    } catch {
      this.clear();
      return null;
    }
  }

  set(data: T[]): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}
