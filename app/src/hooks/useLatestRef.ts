import { MutableRefObject, useRef } from 'react';

export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
