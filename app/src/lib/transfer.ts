import { Address, asHex, Operation, ETH_ADDRESS } from 'lib';
import { ERC20 } from 'lib/dapps';
import { match } from 'ts-pattern';
import { encodeFunctionData } from 'viem';

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
