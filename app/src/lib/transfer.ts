import { Address, asHex, Operation } from 'lib';
import { ERC20 } from 'lib/dapps';
import { match } from 'ts-pattern';
import { encodeFunctionData } from 'viem';
import { ETH_ADDRESS } from 'zksync-web3/build/src/utils';

export interface TransferOpOptions {
  token: Address;
  to: Address;
  amount: bigint;
}

export const createTransferOp = ({ token, to, amount }: TransferOpOptions): Operation =>
  match(token)
    .with(ETH_ADDRESS, () => ({ to, value: amount }))
    .otherwise(() => ({
      to: token,
      data: asHex(
        encodeFunctionData({
          abi: ERC20,
          functionName: 'transfer',
          args: [to, amount],
        }),
      ),
    }));
