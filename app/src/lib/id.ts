import { UUID } from 'lib';
import { v4 as uuid } from 'uuid';

export function randomUUID() {
  return uuid() as UUID;
}
