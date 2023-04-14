export const spreadAsyncGenerator = async <T>(
  generator: AsyncGenerator<T, void, unknown>,
): Promise<T[]> => {
  const values: T[] = [];
  for await (const v of generator) {
    values.push(v);
  }
  return values;
};
