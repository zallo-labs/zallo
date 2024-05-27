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
      paymasterEthFees {
        total
        activation
      }
    }
    systx {
      id
      maxNetworkEthFee
      ethPerFeeToken
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

  const ethPerFeeToken = new Decimal(p.systx?.ethPerFeeToken ?? p.feeToken.price?.eth ?? 0);
  const estNetworkEthFee = new Decimal(p.estimatedFees.maxNetworkEthFee);
  const actNetworkEthFee =
    p.result?.__typename === 'Successful' || p.result?.__typename === 'Failed'
      ? new Decimal(p.result.networkEthFee)
      : undefined;

  const paymasterEthFees = actNetworkEthFee ? p.paymasterEthFees : p.estimatedFees.paymasterEthFees;
  const activationFee = new Decimal(paymasterEthFees.activation);

  const totalFeeAmount = (actNetworkEthFee ?? estNetworkEthFee)
    .plus(paymasterEthFees.total)
    .div(ethPerFeeToken);

  return (
    <>
      <TokenItem
        token={p.feeToken}
        amount={(actNetworkEthFee ?? estNetworkEthFee)
          .plus(paymasterEthFees.total)
          .div(ethPerFeeToken)
          .neg()}
        overline={actNetworkEthFee ? 'Fees' : 'Estimated fees'}
        onPress={toggleExpanded}
        trailing={({ Trailing }) => (
          <View style={styles.totalTrailingContainer}>
            <Trailing />

            {p.status === 'Pending' &&
              p.feeToken.balance &&
              totalFeeAmount.gt(p.feeToken.balance) && (
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
          <Text variant="labelLarge">
            {actNetworkEthFee ? 'Network fee' : 'Network fee (estimated)'}
          </Text>
          <Text variant="bodySmall">
            <TokenAmount
              token={p.feeToken}
              amount={(actNetworkEthFee ?? estNetworkEthFee).div(ethPerFeeToken)}
            />
          </Text>
        </View>

        {!activationFee.eq(0) && (
          <View style={styles.row}>
            <Text variant="labelLarge">Activation fee</Text>
            <Text variant="bodySmall">
              <TokenAmount token={p.feeToken} amount={activationFee.div(ethPerFeeToken)} />
            </Text>
          </View>
        )}

        {!actNetworkEthFee && (
          <View style={styles.row}>
            <Text variant="labelLarge">{'(Max total fee)'}</Text>
            <Text variant="bodySmall">
              <TokenAmount token={p.feeToken} amount={p.maxAmount} />
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
