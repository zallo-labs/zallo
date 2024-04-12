import { Injectable } from '@nestjs/common';
import { ACCOUNT_ABI, Address } from 'lib';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { AbiSource } from '../contract-functions/contract-functions.model';
import { Abi, AbiFunction } from 'abitype';
import { toFunctionSelector, toFunctionSignature } from 'viem';

@Injectable()
export class ContractsService {
  constructor(private db: DatabaseService) {}

  async select(contract: Address, shape?: ShapeFunc<typeof e.Contract>) {
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
    return this.insert(account, ACCOUNT_ABI, AbiSource.Verified);
  }

  private async tryFetchAbi(contract: Address): Promise<null | { id: string }> {
    return null;
    // const resp = await this.explorer.verifiedContract(contract);
    // if (!resp) return null;

    // const [iface, source] = resp;
    // return this.insert(contract, iface, source);
  }

  private async insert(address: Address, abi: Abi, source: AbiSource) {
    const functionsSet = e.set(
      ...abi
        .filter((e): e is AbiFunction => e.type === 'function')
        .map((f) => {
          return e.json({
            selector: toFunctionSelector(f),
            abi: f,
            abiMd5: toFunctionSignature(f), // Not md5 anymore, but this is all going to be removed
          });
        }),
    );

    return this.db.query(
      e.insert(e.Contract, {
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
      }),
    );
  }
}
