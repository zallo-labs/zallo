import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectToken } from '~/app/(drawer)/[account]/tokens';
import { createStyles, useStyles } from '@theme/styles';
import { asAddress } from 'lib';
import Decimal from 'decimal.js';

const FragmentDoc = gql(/* GraphQL */ `
  fragment FeeToken_TransactionProposalFragment on TransactionProposal {
    id
    hash
    feeToken {
      id
      name
      estimatedFeesPerGas {
        id
        maxFeePerGas
      }
      ...TokenItem_Token
    }
    updatable
    gasLimit
    account {
      id
      address
    }
    transaction {
      id
      maxFeePerGas
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
  const { styles } = useStyles(stylesheet);
  const p = useFragment(FragmentDoc, props.proposal);

  const update = useMutation(Update)[1];
  const selectToken = useSelectToken();

  const estimatedFee = new Decimal(p.gasLimit.toString()).mul(
    p.feeToken.estimatedFeesPerGas?.maxFeePerGas ?? 0,
  );
  const actualFee =
    p.transaction?.receipt &&
    new Decimal(p.transaction.receipt.gasUsed.toString()).mul(p.transaction.maxFeePerGas);

  return (
    <TokenItem
      token={p.feeToken}
      amount={(actualFee ?? estimatedFee).neg()}
      headline={({ Text }) => (
        <Text>
          {p.feeToken.name}
          <Text style={styles.secondary}> ({typeof actualFee !== 'bigint' && 'max '}fee)</Text>
        </Text>
      )}
      {...(p.updatable && {
        onPress: async () => {
          const token = await selectToken({ account: p.account.address, feeToken: true });
          if (token) await update({ hash: p.hash, feeToken: asAddress(token) });
        },
      })}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  secondary: {
    color: colors.onSurfaceVariant,
  },
}));
