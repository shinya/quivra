// Node 25 の実験的な localStorage が有効だと setItem 等が未実装のまま globalThis を占有する。
// テスト用に in-memory の単純な Storage 実装で強制上書きする。
class InMemoryStorage implements Storage {
  private store = new Map<string, string>()
  get length(): number {
    return this.store.size
  }
  key(i: number): string | null {
    return Array.from(this.store.keys())[i] ?? null
  }
  getItem(k: string): string | null {
    return this.store.has(k) ? (this.store.get(k) as string) : null
  }
  setItem(k: string, v: string): void {
    this.store.set(k, String(v))
  }
  removeItem(k: string): void {
    this.store.delete(k)
  }
  clear(): void {
    this.store.clear()
  }
}

const storage = new InMemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: storage })
}
