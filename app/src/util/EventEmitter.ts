import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { StackNavigatorParamList } from '~/navigation/StackNavigator';

export type Listener<T> = (params: T) => void;

export class EventEmitter<T> {
  readonly listeners: Set<Listener<T>> = new Set();

  constructor(public readonly name: string) {}

  emit(params: T) {
    const n = this.listeners.size;
    this.listeners.forEach((listener) => listener(params));
    return n;
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

  createUseSelect<RouteName extends keyof StackNavigatorParamList>(
    route: RouteName,
    defaults?: Partial<StackNavigatorParamList[RouteName]>,
  ) {
    const emitter = this;
    return () => {
      const { navigate, goBack } = useNavigation();

      return useCallback(
        async (
          ...args: StackNavigatorParamList[RouteName] extends undefined
            ? []
            : [StackNavigatorParamList[RouteName]]
        ) => {
          const p = emitter.getEvent();
          (navigate as any)(route, { ...(defaults ?? {}), ...(args[0] ?? {}) });

          await p;
          goBack();

          return p;
        },
        [navigate],
      );
    };
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
