import 'hardhat/types/config';
import { task } from 'hardhat/config';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import fs from 'fs/promises';
import path from 'path';
import { Artifact, HardhatRuntimeEnvironment } from 'hardhat/types';
import { ZkSyncArtifact } from '@matterlabs/hardhat-zksync-solc/dist/src/types';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    export?: ExportConfig | ExportConfig[];
  }
}

interface ExportConfig {
  path: string;
  contracts?: string[];
  include: (keyof Artifact | keyof ZkSyncArtifact)[];
}

task(TASK_COMPILE).setAction(async (_taskArgs: unknown, hre, runSuper) => {
  await runSuper();
  await main(hre);
});

task('export')
  .setDescription('Export contract artifacts')
  .setAction(async (_taskArgs: unknown, hre) => {
    await main(hre);
  });

async function main(hre: HardhatRuntimeEnvironment) {
  if (!hre.userConfig.export) return;

  const configs = Array.isArray(hre.userConfig.export)
    ? hre.userConfig.export
    : [hre.userConfig.export];

  await Promise.all(configs.map((config) => clean(hre, config)));
  await Promise.all(configs.map((config) => generate(hre, config)));
}

async function clean(hre: HardhatRuntimeEnvironment, config: ExportConfig) {
  const outputDirectory = path.resolve(hre.config.paths.root, config.path);
  await fs.rm(outputDirectory, { recursive: true, force: true });
}

async function generate(hre: HardhatRuntimeEnvironment, config: ExportConfig) {
  const outputDirectory = path.resolve(hre.config.paths.root, config.path);
  await fs.mkdir(outputDirectory, { recursive: true });

  const results = (await hre.artifacts.getAllFullyQualifiedNames())
    .filter((name) => !config.contracts || config.contracts.some((matcher) => name.match(matcher)))
    .map(async (name) => {
      const artifact = await hre.artifacts.readArtifact(name);

      const fields = Object.keys(artifact).filter((key) =>
        config.include.includes(key as keyof Artifact),
      ) as (keyof Artifact)[];

      const fieldExports = fields
        .map((field) => {
          const value = JSON.stringify(artifact[field], null, 2);
          return `export const ${field} = ${value} as const;\n`;
        })
        .join('\n');

      const defaultExport = `export default { ${fields.join(', ')} };\n`;

      const data = [fieldExports, defaultExport].join('\n');

      const outputPath = path.resolve(outputDirectory, `${artifact.contractName}.ts`);
      await fs.writeFile(outputPath, data, { flag: 'w' });
    });

  await Promise.all(results);
}
