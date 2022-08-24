import assert from 'assert';

export const assertUnreachable = (_: never) => {
  // https://github.com/microsoft/TypeScript/issues/38881
  assert(false, 'Unreachable code reached');
};
