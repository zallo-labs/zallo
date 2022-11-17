import { Config } from '@jest/types';
import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.json');

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
};

export default config;
