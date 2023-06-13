import { TokenType } from '@token/token';
import { Address, asHex, ERC20_ABI, Operation } from 'lib';
import { match } from 'ts-pattern';
import { encodeFunctionData } from 'viem';

export const createTransferOp = (
  token: Address,
  type: TokenType,
  to: Address,
  amount: bigint,
): Operation =>
  match(type)
    .with('Native', () => ({ to, value: amount }))
    .with('ERC20', () => ({
      to: token,
      data: asHex(
        encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to, amount],
        }),
      ),
    }))
    .exhaustive();
