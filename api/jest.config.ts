import { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.json');

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    uuid: require.resolve('uuid'), // https://github.com/uuidjs/uuid/issues/451#issuecomment-1112328417
    msgpackr: require.resolve('msgpackr'),
  },
};

export default config;
