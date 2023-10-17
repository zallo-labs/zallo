import { Address, asHex, ERC20_ABI, Operation } from 'lib';
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
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to, amount],
        }),
      ),
    }));
