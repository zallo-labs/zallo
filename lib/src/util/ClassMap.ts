type Constructor = new (...args: any) => any;

export class ClassMap<
  Value extends object & InstanceType<Key>,
  Key extends Constructor = Constructor,
> {
  private map: Map<Key, Value>;

  constructor(...values: Value[]) {
    this.map = new Map(values.map((v) => [v.constructor, v]));
  }

  set(value: Value): this {
    this.map.set(value.constructor as Key, value);
    return this;
  }

  get<K extends Key>(key: K): InstanceType<K> | undefined {
    return this.map.get(key);
  }

  clear(): void {
    this.map.clear();
  }

  delete(key: Key): boolean {
    return this.map.delete(key);
  }

  has(key: Key): boolean {
    return this.map.has(key);
  }

  get size() {
    return this.map.size;
  }

  get keys() {
    return this.map.keys();
  }

  get values() {
    return this.map.values();
  }

  *[Symbol.iterator]() {
    for (const value of this.values) {
      yield value;
    }
  }
}
