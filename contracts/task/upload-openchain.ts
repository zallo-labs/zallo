import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { task } from 'hardhat/config';
import { Abi, AbiError, AbiEvent, AbiFunction } from 'abitype';
import { toEventSignature, toFunctionSignature } from 'viem';

const IMPORT_ENDPOINT = 'https://api.openchain.xyz/signature-database/v1/import';

task(TASK_COMPILE).setAction(async (_taskArgs: unknown, hre, runSuper) => {
  await runSuper();
  await main(hre);
});

task('upload-openchain')
  .setDescription('Upload selectors to https://openchain.xyz')
  .setAction(async (_taskArgs: unknown, hre) => {
    await main(hre, true);
  });

async function main(hre: HardhatRuntimeEnvironment, verbose?: boolean) {
  const completeAbi = (
    await Promise.all(
      (await hre.artifacts.getAllFullyQualifiedNames()).map(
        async (fullName) => (await hre.artifacts.readArtifact(fullName)).abi as Abi,
      ),
    )
  ).flat();

  const functions = completeAbi
    .filter((e): e is AbiFunction => e.type === 'function')
    .map(toFunctionSignature);

  const errors = completeAbi
    .filter((e): e is AbiError => e.type === 'error')
    .map((e) => {
      const f: AbiFunction = { ...e, type: 'function', outputs: [], stateMutability: 'pure' };
      return toFunctionSignature(f);
    });

  const events = completeAbi.filter((e): e is AbiEvent => e.type === 'event').map(toEventSignature);

  const resp = await fetch(IMPORT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      function: [...new Set([...functions, ...errors])],
      event: [...new Set(events)],
    }),
  });

  if (verbose) {
    console.log(JSON.stringify(await resp.json(), null, 2));
  }
}
