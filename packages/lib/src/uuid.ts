import { StrictType } from './util/types';

export type UUID = StrictType<string, 'UUID'>;

const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

export function isUUID(v: unknown): v is UUID {
  return typeof v === 'string' && regex.test(v);
}

export function asUUID(v: string): UUID {
  if (!isUUID(v)) throw new Error(`Expected UUID but got "${v}"`);
  return v;
}
