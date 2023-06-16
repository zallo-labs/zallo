import { Injectable } from '@nestjs/common';
import {
  Address,
  Hex,
  PolicyKey,
  SYNCSWAP_CLASSIC_POOL_ABI,
  SYNCSWAP_ROUTER_ABI,
  Selector,
  asSelector,
  isPresent,
  tryOrIgnore,
} from 'lib';
import { ContractsService } from '../contracts/contracts.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { AbiFunction } from 'abitype';
import { decodeFunctionData, size } from 'viem';
import {
  GenericOp,
  OperationFunction,
  TransferOp,
  TransferApprovalOp,
  TransferFromOp,
  AddPolicyOp,
  RemovePolicyOp,
  SwapOp,
} from './operations.model';
import { ACCOUNT_ABI, ERC20_ABI } from 'lib';
import { match } from 'ts-pattern';
import { ProviderService } from '../util/provider/provider.service';

@Injectable()
export class OperationsService {
  constructor(
    private db: DatabaseService,
    private provider: ProviderService,
    private contracts: ContractsService,
  ) {}

  async decode(to: Address, data: Hex | undefined): Promise<typeof OperationFunction | undefined> {
    if (!data || size(data) < 4) return undefined;

    return (await this.decodeCustom(to, data)) || (await this.decodeGeneric(to, data));
  }

  private async decodeGeneric(to: Address, data: Hex): Promise<GenericOp | undefined> {
    const selector = asSelector(data);
    const funcAbi = await this.getFunctionAbi(to, selector);
    if (!funcAbi) return undefined;

    const decoded = decodeFunctionData({ abi: [funcAbi], data });

    return Object.assign(new GenericOp(), {
      _name: decoded.functionName,
      _args: decoded.args ?? [],
    } satisfies GenericOp);
  }

  private async getFunctionAbi(to: Address, selector: Selector) {
    const c = await this.contracts.select(to, () => ({
      functions: (f) => ({
        filter: e.op(f.selector, '=', selector),
        limit: 1,
        abi: true,
      }),
    }));
    const exactMatch = c?.functions[0];
    if (exactMatch) return (exactMatch as any).abi as AbiFunction;

    // Fallback to finding the selector from any contract
    const selectorMatches = await this.db.query(
      e.select(e.Function, (f) => ({
        filter: e.op(f.selector, '=', selector),
        limit: 1,
        abi: true,
      })),
    );

    return selectorMatches[0]?.abi as AbiFunction | undefined;
  }

  async decodeCustom(to: Address, data: Hex): Promise<typeof OperationFunction | undefined> {
    const f = tryOrIgnore(() =>
      decodeFunctionData({ abi: [...ACCOUNT_ABI, ...ERC20_ABI, ...SYNCSWAP_ROUTER_ABI], data }),
    );
    if (!f) return undefined;

    const base: GenericOp = { _name: f.functionName, _args: f.args ?? [] };

    return (
      match(f)
        /* Account */
        .with({ functionName: 'addPolicy' }, (f) =>
          Object.assign(new AddPolicyOp(), {
            // TODO: include policy object and policyState object (the actual one being added)
            ...base,
            account: to,
            key: f.args[0].key as PolicyKey,
            threshold: f.args[0].threshold,
            approvers: f.args[0].approvers,
            targets: [],
          } satisfies AddPolicyOp),
        )
        .with({ functionName: 'removePolicy' }, (f) =>
          Object.assign(new RemovePolicyOp(), {
            ...base,
            account: to,
            key: f.args[0] as PolicyKey,
          } satisfies RemovePolicyOp),
        )
        /* ERC20 */
        .with({ functionName: 'transfer' }, (f) =>
          Object.assign(new TransferOp(), {
            ...base,
            token: to,
            to: f.args[0],
            amount: f.args[1],
          } satisfies TransferOp),
        )
        .with({ functionName: 'transferFrom' }, (f) =>
          Object.assign(new TransferFromOp(), {
            ...base,
            token: to,
            from: f.args[0],
            to: f.args[1],
            amount: f.args[2],
          } satisfies TransferFromOp),
        )
        .with({ functionName: 'approve' }, (f) =>
          Object.assign(new TransferApprovalOp(), {
            ...base,
            token: to,
            spender: f.args[0],
            amount: f.args[1],
          } satisfies TransferApprovalOp),
        )
        /* SyncSwap */
        .with({ functionName: 'swap' }, async (f) => {
          const path = f.args[0][0];

          // Figure out the toToken by querying the pool
          const tokenCalls = await this.provider.client.multicall({
            contracts: [
              {
                address: path.steps[0].pool,
                abi: SYNCSWAP_CLASSIC_POOL_ABI,
                functionName: 'token0',
              },
              {
                address: path.steps[0].pool,
                abi: SYNCSWAP_CLASSIC_POOL_ABI,
                functionName: 'token1',
              },
            ],
          });

          const pair = tokenCalls.map((c) => c.result).filter(isPresent);
          if (pair.length !== 2) return Object.assign(new GenericOp(), base);

          return Object.assign(new SwapOp(), {
            ...base,
            fromToken: path.tokenIn,
            fromAmount: path.amountIn,
            toToken: pair[0] === path.tokenIn ? pair[1] : pair[0],
            minimumToAmount: f.args[1],
            deadline: new Date(Number(f.args[2]) * 1000),
          } satisfies SwapOp);
        })
        .otherwise(() => Object.assign(new GenericOp(), base))
    );
  }
}
