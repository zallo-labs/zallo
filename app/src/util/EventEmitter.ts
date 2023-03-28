import { useEffect, useState } from 'react';

export type Listener<T> = (params: T) => void;

export class EventEmitter<T> {
  readonly listeners: Set<Listener<T>> = new Set();

  constructor(public readonly name: string) {}

  emit(params: T) {
    if (this.listeners.size === 0) console.warn(`Emitting event ${this.name} with no listeners`);

    this.listeners.forEach((listener) => listener(params));
  }

  getEvent() {
    return new Promise<T>((resolve) => {
      const listener = (params: T) => {
        this.listeners.delete(listener);
        resolve(params);
      };

      this.listeners.add(listener);
    });
  }
}

export const useEvent = <T>(emitter: EventEmitter<T>) => {
  const [value, setValue] = useState<T | undefined>();

  useEffect(() => {
    const listener: Listener<T> = (params) => setValue(params);
    emitter.listeners.add(listener);

    return () => {
      emitter.listeners.delete(listener);
    };
  }, []);

  return value;
};
