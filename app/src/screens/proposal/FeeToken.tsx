import { NavigateNextIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { useSelectToken } from '../tokens/TokensScreen';
import { TokenAmount } from '~/components/token/TokenAmount';
import { FragmentType, gql, useFragment } from '@api/generated';
import { asBigInt } from 'lib';
import { useMutation } from 'urql';

const FragmentDoc = gql(/* GraphQL */ `
  fragment FeeToken_TransactionProposalFragment on TransactionProposal {
    id
    hash
    feeToken {
      id
      address
      gasPrice
      ...TokenAmount_token
    }
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

const Update = gql(/* GraphQL */ `
  mutation FeeToken_Update($hash: Bytes32!, $feeToken: Address!) {
    updateProposal(input: { hash: $hash, feeToken: $feeToken }) {
      id
      feeToken {
        id
        address
        gasPrice
        ...TokenAmount_token
      }
    }
  }
`);

export interface FeeTokenProps {
  proposal: FragmentType<typeof FragmentDoc>;
}

export function FeeToken(props: FeeTokenProps) {
  const p = useFragment(FragmentDoc, props.proposal);

  const update = useMutation(Update)[1];
  const selectToken = useSelectToken();

  const estimatedFee = asBigInt(p.feeToken.gasPrice ?? 0) * asBigInt(p.gasLimit);
  const actualFee =
    p.transaction?.receipt &&
    asBigInt(p.transaction.receipt.gasUsed) * asBigInt(p.transaction.gasPrice);

  return (
    <ListItem
      leading={p.feeToken.address}
      headline="Network fee"
      supporting={({ Text }) => (
        <Text>
          {actualFee ? (
            <TokenAmount token={p.feeToken} amount={-actualFee} />
          ) : (
            <>
              {'≤ '} <TokenAmount token={p.feeToken} amount={-estimatedFee} />
            </>
          )}
        </Text>
      )}
      trailing={NavigateNextIcon}
      {...(p.updatable && {
        onPress: async () => {
          const token = await selectToken({ account: p.account.address });
          await update({ hash: p.hash, feeToken: token });
        },
      })}
    />
  );
}
