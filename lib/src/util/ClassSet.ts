import { KeySet } from './KeySet';

export type Constructor = new (...args: any) => any;

export class ClassSet<
  V extends object & InstanceType<K>,
  K extends Constructor = Constructor,
> extends KeySet<K, V> {
  constructor(values?: V[]) {
    super((v: V): K => v.constructor, values);
  }

  get<Key extends K>(key: Key): InstanceType<Key> | undefined {
    return super.get(key);
  }
}
