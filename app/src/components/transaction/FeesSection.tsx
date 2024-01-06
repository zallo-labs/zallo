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

const TransactionProposal = gql(/* GraphQL */ `
  fragment FeesSection_TransactionProposal on TransactionProposal
  @argumentDefinitions(account: { type: "UAddress!" }, includeAccount: { type: "Boolean!" }) {
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
      balance(input: { account: $account }) @include(if: $includeAccount)
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
  mutation FeeToken_Update(
    $id: UUID!
    $feeToken: Address!
    $account: UAddress!
    $includeAccount: Boolean!
  ) {
    updateTransaction(input: { id: $id, feeToken: $feeToken }) {
      ...FeesSection_TransactionProposal
        @arguments(account: $account, includeAccount: $includeAccount)
    }
  }
`);

export interface FeeTokenProps {
  proposal: FragmentType<typeof TransactionProposal>;
}

export function FeesSection(props: FeeTokenProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(TransactionProposal, props.proposal);
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
  const amount = ethFees.div(ethPerFeeToken);
  const insufficient =
    p.status === 'Pending' && p.feeToken.balance && amount.plus(p.feeToken.balance).isNeg();

  return (
    <>
      <TokenItem
        token={p.feeToken}
        amount={amount}
        overline={'Fees' + (isEstimated ? ' (max)' : '')}
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
            if (token)
              await update({
                id: p.id,
                feeToken: asAddress(token),
                account: p.account.address,
                includeAccount: true,
              });
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
