import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.json');

const config: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['./dist', './dbschema', './generated', './node_modules'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testRegex: '.*\\.spec\\.ts$',
  testTimeout: 30_000,
  globalSetup: './src/setup.jest.ts',

  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),

    // Breaks edgedb import
    //   uuid: require.resolve('uuid'), // https://github.com/uuidjs/uuid/issues/451#issuecomment-1112328417
    //   msgpackr: require.resolve('msgpackr'),
  },
};

export default config;
