import { asAddress, asFp, isEthToken, UAddress } from 'lib';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { graphql } from 'relay-runtime';
import { TransferMode_account$key } from '~/api/__generated__/TransferMode_account.graphql';
import { useFragment } from 'react-relay';
import { TransferMode_token$key } from '~/api/__generated__/TransferMode_token.graphql';
import { encodeFunctionData } from 'viem';
import { ERC20 } from 'lib/dapps';
import Decimal from 'decimal.js';
import { CheckAllIcon } from '@theme/icons';
import { useRouter } from 'expo-router';
import { ampli } from '~/lib/ampli';
import { usePreparedTransaction } from '~/hooks/mutations/usePreparedTransaction';

const Account = graphql`
  fragment TransferMode_account on Account {
    address
    ...usePreparedTransaction_account
  }
`;

const Token = graphql`
  fragment TransferMode_token on Token {
    address
    decimals
  }
`;

export interface TransferModeProps {
  account: TransferMode_account$key;
  token: TransferMode_token$key;
  to: UAddress | undefined;
  amount: Decimal;
}

export function TransferMode({ to, amount, ...props }: TransferModeProps) {
  const account = useFragment(Account, props.account);
  const token = useFragment(Token, props.token);
  const router = useRouter();

  const amountFp = asFp(amount, token.decimals, Decimal.ROUND_DOWN);
  const operations = to && [
    isEthToken(asAddress(token.address))
      ? {
          to: asAddress(to),
          value: amountFp,
        }
      : {
          to: asAddress(token.address),
          data: encodeFunctionData({
            abi: ERC20,
            functionName: 'transfer',
            args: [asAddress(to), amountFp],
          }),
        },
  ];
  const propose = usePreparedTransaction({
    account,
    input: operations ? { operations } : undefined,
  });

  const proposeTransfer =
    operations &&
    (async () => {
      const transaction = await propose({ operations });
      router.push({
        pathname: `/(nav)/[account]/(home)/activity/transaction/[id]`,
        params: { account: account.address, id: transaction },
      });
      ampli.transferProposal({ token: token.address });
    });

  return (
    <>
      <Actions horizontal>
        <Button
          mode="contained"
          icon={CheckAllIcon}
          onPress={proposeTransfer}
          disabled={!proposeTransfer || amount.lte(0)}
        >
          Review transfer
        </Button>
      </Actions>
    </>
  );
}
