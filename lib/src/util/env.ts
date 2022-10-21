const getKey = (strings: TemplateStringsArray, ...expr: string[]) =>
  strings.reduce((acc, str, i) => acc + str + (expr[i] || ''), '');

export const optionalEnv = (...params: Parameters<typeof getKey>) =>
  process.env[getKey(...params)];

export const requiredEnv = (...params: Parameters<typeof getKey>) => {
  const key = getKey(...params);
  const value = process.env[key];
  if (!value) throw new Error(`Missing environmental variable: ${key}`);
  return value!;
};
