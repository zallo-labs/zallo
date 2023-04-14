export class KeySet<K, V> {
  private map: Map<K, V>;

  constructor(public getKey: (v: V) => K, values?: V[]) {
    this.map = new Map(values ? values.map((v) => [getKey(v), v]) : []);
  }

  add(value: V): this {
    this.map.set(this.getKey(value), value);
    return this;
  }

  clear(): void {
    this.map.clear();
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  deleteValue(value: V): boolean {
    return this.delete(this.getKey(value));
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  hasValue(value: V): boolean {
    return this.has(this.getKey(value));
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  get size(): number {
    return this.map.size;
  }

  entries(): IterableIterator<[K, V]> {
    return this.map.entries();
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }

  values(): IterableIterator<V> {
    return this.map.values();
  }

  [Symbol.iterator](): IterableIterator<V> {
    return this.values();
  }

  get [Symbol.toStringTag](): string {
    return [...this.map.entries()].toString();
  }
}
