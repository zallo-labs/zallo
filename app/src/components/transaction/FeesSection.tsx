import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { TokenItem } from '~/components/token/TokenItem';
import { useSelectToken } from '~/app/(drawer)/[account]/tokens';
import { createStyles, useStyles } from '@theme/styles';
import { asAddress } from 'lib';
import Decimal from 'decimal.js';
import { Button } from '~/components/Button';
import { GenericTokenIcon } from '@theme/icons';
import { useToggle } from '~/hooks/useToggle';
import Collapsible from 'react-native-collapsible';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { TokenAmount } from '~/components/token/TokenAmount';

const FragmentDoc = gql(/* GraphQL */ `
  fragment FeeToken_TransactionProposalFragment on TransactionProposal {
    id
    account {
      id
      address
    }
    feeToken {
      id
      name
      price {
        id
        eth
      }
      ...TokenItem_Token
      ...TokenAmount_token
    }
    updatable
    gasLimit
    paymasterEthFee
    estimatedFees {
      id
      maxNetworkEthFee
      ethDiscount
    }
    transaction {
      id
      maxNetworkEthFee
      ethDiscount
      ethPerFeeToken
      usdPerFeeToken
      receipt {
        id
        networkEthFee
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation FeeToken_Update($id: UUID!, $feeToken: Address!) {
    updateTransaction(input: { id: $id, feeToken: $feeToken }) {
      ...FeeToken_TransactionProposalFragment
    }
  }
`);

export interface FeeTokenProps {
  proposal: FragmentType<typeof FragmentDoc>;
}

export function FeesSection(props: FeeTokenProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(FragmentDoc, props.proposal);
  const update = useMutation(Update)[1];
  const selectToken = useSelectToken();

  const [expanded, toggleExpanded] = useToggle(false);

  const networkEthFee = new Decimal(
    p.transaction?.receipt?.networkEthFee ??
      p.transaction?.maxNetworkEthFee ??
      p.estimatedFees.maxNetworkEthFee,
  ).neg();
  const paymasterEthFee = new Decimal(p.paymasterEthFee).neg();
  const ethDiscount = new Decimal(p.transaction?.ethDiscount ?? p.estimatedFees.ethDiscount);
  const ethFees = Decimal.min(networkEthFee.add(paymasterEthFee).add(ethDiscount), 0);
  const isEstimated = !p.transaction?.receipt;

  const ethPerFeeToken = new Decimal(p.transaction?.ethPerFeeToken ?? p.feeToken.price?.eth ?? 0);

  return (
    <>
      <TokenItem
        token={p.feeToken}
        amount={ethFees.div(ethPerFeeToken)}
        overline={'Fees' + (isEstimated ? ' (max)' : '')}
        onPress={toggleExpanded}
      />

      <Collapsible collapsed={!expanded} style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text variant="labelLarge">{'Network fee' + (isEstimated ? ' (max)' : '')}</Text>
          <Text variant="bodySmall">
            <TokenAmount token={p.feeToken} amount={networkEthFee.div(ethPerFeeToken)} />
          </Text>
        </View>

        {!paymasterEthFee.eq(0) && (
          <View style={styles.row}>
            <Text variant="labelLarge">Paymaster fee</Text>
            <Text variant="bodySmall">
              <TokenAmount token={p.feeToken} amount={paymasterEthFee.div(ethPerFeeToken)} />
            </Text>
          </View>
        )}

        {!ethDiscount.eq(0) && (
          <View style={styles.row}>
            <Text variant="labelLarge">Discount</Text>
            <Text variant="bodySmall">
              <TokenAmount token={p.feeToken} amount={ethDiscount.div(ethPerFeeToken)} />
            </Text>
          </View>
        )}
      </Collapsible>

      {p.updatable && (
        <Button
          mode="outlined"
          icon={GenericTokenIcon}
          style={styles.button}
          onPress={async () => {
            const token = await selectToken({ account: p.account.address, feeToken: true });
            if (token) await update({ id: p.id, feeToken: asAddress(token) });
          }}
        >
          Pay fees in another token
        </Button>
      )}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  secondary: {
    color: colors.onSurfaceVariant,
  },
  detailsContainer: {
    gap: 8,
    marginLeft: 72,
    marginRight: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 16,
  },
}));
