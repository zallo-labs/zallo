import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.json');

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    uuid: require.resolve('uuid'), // https://github.com/uuidjs/uuid/issues/451#issuecomment-1112328417
    msgpackr: require.resolve('msgpackr'),
  },
  testTimeout: 30_000,
};

export default config;
