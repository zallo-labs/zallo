import { useSelectToken } from '../tokens/TokensScreen';
import { FragmentType, gql, useFragment } from '@api/generated';
import { asBigInt } from 'lib';
import { useMutation } from 'urql';
import { TokenItem } from '~/components/token/TokenItem';
import { makeStyles } from '@theme/makeStyles';

const FragmentDoc = gql(/* GraphQL */ `
  fragment FeeToken_TransactionProposalFragment on TransactionProposal {
    id
    hash
    feeToken {
      id
      name
      gasPrice
      ...TokenItem_token
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
    updateTransaction(input: { hash: $hash, feeToken: $feeToken }) {
      ...FeeToken_TransactionProposalFragment
    }
  }
`);

export interface FeeTokenProps {
  proposal: FragmentType<typeof FragmentDoc>;
}

export function FeeToken(props: FeeTokenProps) {
  const styles = useStyles();
  const p = useFragment(FragmentDoc, props.proposal);

  const update = useMutation(Update)[1];
  const selectToken = useSelectToken();

  const estimatedFee = asBigInt(p.feeToken.gasPrice ?? 0) * asBigInt(p.gasLimit);
  const actualFee =
    p.transaction?.receipt &&
    asBigInt(p.transaction.receipt.gasUsed) * asBigInt(p.transaction.gasPrice);

  return (
    <TokenItem
      token={p.feeToken}
      amount={-(actualFee ?? estimatedFee)}
      headline={({ Text }) => (
        <Text>
          {p.feeToken.name}
          <Text style={styles.secondary}> ({typeof actualFee !== 'bigint' && 'max '}fee)</Text>
        </Text>
      )}
      {...(p.updatable && {
        onPress: async () =>
          await update({
            hash: p.hash,
            feeToken: await selectToken({ account: p.account.address, feeToken: true }),
          }),
      })}
    />
  );
}

const useStyles = makeStyles(({ colors }) => ({
  secondary: {
    color: colors.onSurfaceVariant,
  },
}));
