export const SKIP_ENV_CHECK_KEY = 'SKIP_ENV_CHECK';

const getKey = (strings: TemplateStringsArray, ...expr: string[]) =>
  strings.reduce((acc, str, i) => acc + str + (expr[i] || ''), '');

export const optionalEnv = (...params: Parameters<typeof getKey>) => process.env[getKey(...params)];

export const requiredEnv = (...params: Parameters<typeof getKey>) => {
  const key = getKey(...params);
  const value = process.env[key];

  const skip = process.env[SKIP_ENV_CHECK_KEY]?.toLocaleLowerCase();
  if (!value && skip !== 'true' && skip !== '1')
    throw new Error(`Missing environmental variable: ${key}`);

  return value!;
};

export const makeRequiredEnv = (skip: boolean) =>
  skip ? (optionalEnv as typeof requiredEnv) : requiredEnv;
