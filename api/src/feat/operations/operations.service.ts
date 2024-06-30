import { Injectable } from '@nestjs/common';
import {
  Address,
  Operation,
  PolicyKey,
  Selector,
  asSelector,
  tryOrIgnore,
  ETH_ADDRESS,
  asUAddress,
  isEthToken,
  asDecimal,
} from 'lib';
import { ContractsService } from '../contracts/contracts.service';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';
import { AbiFunction } from 'abitype';
import { decodeFunctionData, size } from 'viem';
import {
  GenericOp,
  OperationFunction,
  TransferOp,
  TransferApprovalOp,
  TransferFromOp,
  UpdatePolicyOp,
  RemovePolicyOp,
  SwapOp,
} from './operations.model';
import { ACCOUNT_ABI } from 'lib';
import { ERC20, ETH, SYNCSWAP, WETH } from 'lib/dapps';
import { match } from 'ts-pattern';
import { NetworksService } from '~/core/networks/networks.service';
import { Chain } from 'chains';
import { TokensService } from '~/feat/tokens/tokens.service';

@Injectable()
export class OperationsService {
  constructor(
    private db: DatabaseService,
    private networks: NetworksService,
    private contracts: ContractsService,
    private tokens: TokensService,
  ) {}

  async decode(op: Operation, chain: Chain): Promise<OperationFunction | undefined> {
    return (await this.decodeCustom(op, chain)) || (await this.decodeGeneric(op));
  }

  private async decodeGeneric({ to, data }: Operation): Promise<GenericOp | undefined> {
    if (!data || size(data) < 4) return undefined;

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

  async decodeCustom(
    { to, value, data }: Operation,
    chain: Chain,
  ): Promise<OperationFunction | undefined> {
    if ((!data || size(data) === 0) && value) {
      // ETH transfer
      return Object.assign(new TransferOp(), {
        _name: 'transfer',
        _args: [to, value],
        token: ETH_ADDRESS,
        to,
        amount: asDecimal(value, ETH),
      } satisfies TransferOp);
    }

    const f = tryOrIgnore(
      () =>
        data &&
        size(data) >= 4 &&
        decodeFunctionData({ abi: [...ACCOUNT_ABI, ...ERC20, ...SYNCSWAP.router.abi], data }),
    );
    if (!f) return undefined;

    const base: GenericOp = { _name: f.functionName, _args: f.args ?? [] };

    switch (f.functionName) {
      case 'addPolicy':
        return Object.assign(new UpdatePolicyOp(), {
          // TODO: include policy object and policyState object (the actual one being added)
          ...base,
          account: to,
          key: f.args[0].key as PolicyKey,
          threshold: f.args[0].threshold,
          approvers: f.args[0].approvers,
        } satisfies UpdatePolicyOp);
      case 'removePolicy':
        return Object.assign(new RemovePolicyOp(), {
          ...base,
          account: to,
          key: f.args[0] as PolicyKey,
        } satisfies RemovePolicyOp);
      /* ERC20 */
      case 'transfer':
        return Object.assign(new TransferOp(), {
          ...base,
          token: to,
          to: f.args[0],
          amount: await this.tokens.asDecimal(asUAddress(to, chain), f.args[1]),
        } satisfies TransferOp);
      case 'transferFrom':
        return Object.assign(new TransferFromOp(), {
          ...base,
          token: to,
          from: f.args[0],
          to: f.args[1],
          amount: await this.tokens.asDecimal(asUAddress(to, chain), f.args[2]),
        } satisfies TransferFromOp);
      case 'approve':
        return Object.assign(new TransferApprovalOp(), {
          ...base,
          token: to,
          to: f.args[0],
          amount: await this.tokens.asDecimal(asUAddress(to, chain), f.args[1]),
        } satisfies TransferApprovalOp);
      /* SyncSwap */
      case 'swap': {
        const path = f.args[0][0];

        // Figure out the toToken by querying the pool
        // TODO: find a better way to do this
        const tokenCalls = await this.networks.get(chain).multicall({
          contracts: [
            {
              address: path.steps[0].pool,
              abi: SYNCSWAP.poolAbi,
              functionName: 'token0',
            },
            {
              address: path.steps[0].pool,
              abi: SYNCSWAP.poolAbi,
              functionName: 'token1',
            },
          ],
        });

        const pair = tokenCalls.map((c) => c.result).filter(Boolean);
        if (pair.length !== 2) return Object.assign(new GenericOp(), base);

        // ETH can be used as tokenIn, but uses the WETH pool
        const fromToken = path.tokenIn;
        const toToken =
          (isEthToken(fromToken) ? WETH.address[chain] : fromToken) === pair[0] ? pair[1] : pair[0];

        const [fromAmount, minimumToAmount] = await Promise.all([
          this.tokens.asDecimal(asUAddress(fromToken, chain), path.amountIn),
          this.tokens.asDecimal(asUAddress(toToken, chain), f.args[1]),
        ]);

        return Object.assign(new SwapOp(), {
          ...base,
          fromToken,
          fromAmount,
          toToken,
          minimumToAmount,
          deadline: new Date(Number(f.args[2]) * 1000),
        } satisfies SwapOp);
      }
      default:
        return Object.assign(new GenericOp(), base);
    }
  }
}
