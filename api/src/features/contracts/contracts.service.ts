import { Injectable } from '@nestjs/common';
import { Interface } from 'ethers/lib/utils';
import { ACCOUNT_INTERFACE, Address, asSelector } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ExplorerService } from '../explorer/explorer.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { AbiSource } from '../contract-functions/contract-functions.model';
import crypto from 'crypto';

const md5 = (value: crypto.BinaryLike) => crypto.createHash('md5').update(value).digest('hex');

@Injectable()
export class ContractsService {
  constructor(private db: DatabaseService, private explorer: ExplorerService) {}

  async selectUnique(contract: Address, shape?: ShapeFunc<typeof e.Contract>) {
    const stored = await e
      .select(e.Contract, (c) => ({
        ...shape?.(c),
        filter_single: { address: contract },
      }))
      .run(this.db.client);
    if (stored) return stored;

    const id = (await this.tryFetchAbi(contract))?.id;
    if (id) {
      return e
        .select(e.Contract, (c) => ({
          ...shape?.(c),
          filter_single: { id },
        }))
        .run(this.db.client);
    }
  }

  async addAccountAsVerified(account: Address) {
    // In the future this should verify the contract with the zkSync explorer as well
    return this.insert(account, ACCOUNT_INTERFACE, AbiSource.Verified);
  }

  async tryFetchAbi(contract: Address) {
    const resp = await this.explorer.verifiedContract(contract);
    if (!resp) return null;

    const [iface, source] = resp;
    return this.insert(contract, iface, source);
  }

  private async insert(address: Address, iface: Interface, source: AbiSource) {
    const functionsSet = e.set(
      ...Object.values(iface.functions).map((f) => {
        const abi = f.format('json');

        return e.json({
          selector: asSelector(iface.getSighash(f)),
          abi: JSON.parse(abi),
          abiMd5: md5(abi),
        });
      }),
    );

    return e
      .insert(e.Contract, {
        address,
        functions: e.for(e.cast(e.json, functionsSet), (item) =>
          e
            .insert(e.Function, {
              selector: e.cast(e.str, item.selector),
              abi: e.cast(e.json, item.abi),
              abiMd5: e.cast(e.str, item.abiMd5),
              source: e.cast(e.AbiSource, source),
            })
            .unlessConflict((f) => ({
              on: f.abiMd5,
              else: f,
            })),
        ),
      })
      .run(this.db.client);
  }

  // private async tryFetchEtherscanAbi(contract: Address) {
  //   const resp: EtherscanResp | undefined = await fetchJsonWithRetry(
  //     getEtherscanUrl(`module=contract&action=getabi&address=${contract}`),
  //   );

  //   return resp?.message === 'OK'
  //     ? ([Contract.getInterface(JSON.parse(resp.result)), AbiSource.VERIFIED] as const)
  //     : undefined;
  // }

  // private async tryFetchDecompiledAbi(contract: Address) {
  //   const resp = await fetchJsonWithRetry(`https://eveem.org/code/${contract}.json`);

  //   const iface =
  //     resp?.functions?.length &&
  //     Contract.getInterface(
  //       resp.functions.map((frag: { name: string }) => FunctionFragment.from(frag.name)),
  //     );

  //   return iface ? ([iface, AbiSource.DECOMPILED] as const) : undefined;
  // }
}

// const ETHERSCAN_API_URL = `https://api${
//   CONFIG.chain.name === 'testnet' ? '-goerli' : ''
// }.etherscan.io/api`;

// const getEtherscanUrl = (args: string) =>
//   `${ETHERSCAN_API_URL}?apikey=${CONFIG.etherscanApiKey}&${args}`;

// interface EtherscanResp {
//   message: 'OK' | 'NOTOK';
//   result: string;
// }
