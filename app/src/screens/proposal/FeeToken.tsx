import { NavigateNextIcon } from '@theme/icons';
import { useToken } from '@token/useToken';
import { ListItem } from '~/components/list/ListItem';
import { useSelectToken } from '../tokens/TokensScreen';
import { useGasPrice } from '@network/useGasPrice';
import { TokenAmount, useFormattedTokenAmount } from '~/components/token/TokenAmount';
import { FragmentType, gql, useFragment } from '@api/gen';
import { asBigInt } from 'lib';
import { useFeeTokenUpdateProposalMutation } from '@api/generated';

const FragmentDoc = gql(/* GraphQL */ `
  fragment FeeToken_TransactionProposalFragment on TransactionProposal {
    id
    hash
    feeToken
    updatable
    gasLimit
    account {
      id
      address
    }
    transaction {
      id
      gasPrice
      receipt {
        id
        gasUsed
      }
    }
  }
`);

gql(/* GraphQL */ `
  mutation FeeTokenUpdateProposal($hash: Bytes32!, $feeToken: Address!) {
    updateProposal(input: { hash: $hash, feeToken: $feeToken }) {
      id
      feeToken
    }
  }
`);

export interface FeeTokenProps {
  proposal: FragmentType<typeof FragmentDoc>;
}

export function FeeToken(props: FeeTokenProps) {
  const p = useFragment(FragmentDoc, props.proposal);

  const token = useToken(p.feeToken);
  const [update] = useFeeTokenUpdateProposalMutation();
  const selectToken = useSelectToken();

  const estimatedFee = useGasPrice(token) * asBigInt(p.gasLimit);
  const actualFee =
    p.transaction?.receipt &&
    asBigInt(p.transaction.receipt.gasUsed) * asBigInt(p.transaction.gasPrice);

  return (
    <ListItem
      leading={p.feeToken}
      headline="Network fee"
      supporting={({ Text }) => (
        <Text>
          {actualFee ? (
            <TokenAmount token={token} amount={-actualFee} />
          ) : (
            `≤ ${useFormattedTokenAmount({ token, amount: -estimatedFee })}`
          )}
        </Text>
      )}
      trailing={NavigateNextIcon}
      {...(p.updatable && {
        onPress: async () => {
          const token = await selectToken({ account: p.account.address });
          await update({ variables: { hash: p.hash, feeToken: token } });
        },
      })}
    />
  );
}
