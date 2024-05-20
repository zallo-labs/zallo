import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { TokenItem } from '#/token/TokenItem';
import { useSelectToken } from '~/app/(drawer)/[account]/tokens';
import { createStyles, useStyles } from '@theme/styles';
import { asAddress } from 'lib';
import Decimal from 'decimal.js';
import { Button } from '#/Button';
import { GenericTokenIcon } from '@theme/icons';
import { useToggle } from '~/hooks/useToggle';
import Collapsible from 'react-native-collapsible';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { TokenAmount } from '#/token/TokenAmount';
import { getOptimizedDocument } from '~/gql';

const Transaction = gql(/* GraphQL */ `
  fragment FeesSection_Transaction on Transaction
  @argumentDefinitions(transaction: { type: "ID!" }) {
    id
    status
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
      balance(input: { transaction: $transaction })
      ...TokenItem_Token
      ...TokenAmount_token
    }
    updatable
    gasLimit
    maxAmount
    paymasterEthFees {
      total
      activation
    }
    estimatedFees {
      id
      maxNetworkEthFee
    }
    systx {
      id
      maxNetworkEthFee
      ethPerFeeToken
      usdPerFeeToken
    }
    result {
      id
      ... on ReceiptResult {
        networkEthFee
      }
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation FeeToken_Update($transaction: ID!, $feeToken: Address!) {
    updateTransaction(input: { id: $transaction, feeToken: $feeToken }) {
      ...FeesSection_Transaction @arguments(transaction: $transaction)
    }
  }
`);
const OptimizedUpdate = getOptimizedDocument(Update);

export interface FeeTokenProps {
  proposal: FragmentType<typeof Transaction>;
}

export function FeesSection(props: FeeTokenProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.proposal);
  const update = useMutation(OptimizedUpdate)[1];
  const selectToken = useSelectToken();

  const [expanded, toggleExpanded] = useToggle(false);

  const networkEthFee = new Decimal(
    (((p.result?.__typename === 'Successful' || p.result?.__typename === 'Failed') &&
      p.result.networkEthFee) ||
      p.systx?.maxNetworkEthFee) ??
      p.estimatedFees.maxNetworkEthFee,
  ).neg();
  const activationFee = new Decimal(p.paymasterEthFees.activation).neg();
  const totalEthFee = networkEthFee.sub(p.paymasterEthFees.total);

  const ethPerFeeToken = new Decimal(p.systx?.ethPerFeeToken ?? p.feeToken.price?.eth ?? 0);
  const amount = totalEthFee.div(ethPerFeeToken);
  const insufficient =
    p.status === 'Pending' && p.feeToken.balance && amount.plus(p.feeToken.balance).isNeg();

  const paymasterFeesEstimatedLabel = !p.systx ? ' (estimate)' : '';
  const networkFeeEstimatedLabel = !p.systx ? ' (max)' : '';

  return (
    <>
      <TokenItem
        token={p.feeToken}
        amount={amount}
        overline={'Fees' + networkFeeEstimatedLabel}
        onPress={toggleExpanded}
        trailing={({ Trailing }) => (
          <View style={styles.totalTrailingContainer}>
            <Trailing />

            {insufficient && p.feeToken.balance && (
              <Text style={styles.insufficient}>
                <TokenAmount token={p.feeToken} amount={p.feeToken.balance} />
                {' available'}
              </Text>
            )}
          </View>
        )}
      />

      <Collapsible collapsed={!expanded} style={styles.detailsContainer}>
        <View style={styles.row}>
          <Text variant="labelLarge">{'Network fee' + networkFeeEstimatedLabel}</Text>
          <Text variant="bodySmall">
            <TokenAmount token={p.feeToken} amount={networkEthFee.div(ethPerFeeToken)} />
          </Text>
        </View>

        {!activationFee.eq(0) && (
          <View style={styles.row}>
            <Text variant="labelLarge">Activation fee{paymasterFeesEstimatedLabel}</Text>
            <Text variant="bodySmall">
              <TokenAmount token={p.feeToken} amount={activationFee.div(ethPerFeeToken)} />
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <Text variant="labelLarge">{'Max total fee' + networkFeeEstimatedLabel}</Text>
          <Text variant="bodySmall">
            <TokenAmount token={p.feeToken} amount={p.maxAmount} />
          </Text>
        </View>
      </Collapsible>

      {p.updatable && (
        <Button
          mode="outlined"
          icon={GenericTokenIcon}
          style={styles.button}
          onPress={async () => {
            const token = await selectToken({ account: p.account.address, feeToken: true });
            if (token) await update({ transaction: p.id, feeToken: asAddress(token) });
          }}
        >
          Pay fees in another token
        </Button>
      )}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  totalTrailingContainer: {
    alignItems: 'flex-end',
  },
  insufficient: {
    color: colors.error,
  },
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
