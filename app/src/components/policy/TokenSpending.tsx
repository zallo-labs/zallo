import { useEffect } from 'react';
import { Address, TransferLimit, asChain, asUAddress } from 'lib';
import { DateTime, Duration } from 'luxon';
import { View } from 'react-native';
import { BasicTextField } from '#/fields/BasicTextField';
import { SelectChip } from '#/fields/SelectChip';
import { ListHeader } from '#/list/ListHeader';
import { useBigIntInput } from '#/fields/useBigIntInput';
import { ClockOutlineIcon } from '@theme/icons';
import { gql } from '@api/generated';
import { usePolicyDraft } from '~/lib/policy/draft';
import { useQuery } from '~/gql';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { truncateAddr } from '~/util/format';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { ProgressBar, Text } from 'react-native-paper';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { useRouter } from 'expo-router';
import { createStyles, useStyles } from '@theme/styles';
import { Timestamp } from '#/format/Timestamp';
import Decimal from 'decimal.js';
import { IncomingTransferItem } from '#/activity/IncomingTransferItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { RectSkeleton } from '#/skeleton/RectSkeleton';

const Query = gql(/* GraphQL */ `
  query TokenSpending($token: UAddress!, $spending: SpendingInput!, $includeSpending: Boolean!) {
    token(address: $token) {
      id
      name
      decimals
      spending(input: $spending) @include(if: $includeSpending) {
        since
        spent
        limit
        transfers {
          __typename
          id
          ...IncomingTransferItem_Transfer
        }
      }
    }
  }
`);

const DEFAULT_DURATION = Duration.fromObject({ day: 1 });

export const DEFAULT_LIMIT: TransferLimit = { amount: 0n, duration: DEFAULT_DURATION.as('seconds') };

export const SPENDING_LIMIT_DURATIONS = [
  { title: 'Hour', value: Duration.fromObject({ hours: 1 }) },
  { title: 'Day', value: DEFAULT_DURATION },
  { title: 'Week', value: Duration.fromObject({ weeks: 1 }) },
  { title: 'Month (4 weeks)', value: Duration.fromObject({ weeks: 4 }) },
  { title: 'Quarter (12 weeks)', value: Duration.fromObject({ weeks: 12 }) },
  { title: 'Year (52 weeks)', value: Duration.fromObject({ days: 364 }) },
] as const;

export interface TokenSpendingProps {
  token: Address;
}

function TokenSpending_({ token: address }: TokenSpendingProps) {
  const { styles } = useStyles(stylesheet);

  const [policy, update] = usePolicyDraft();
  const { account } = policy;

  const { token: t } = useQuery(Query, {
    token: asUAddress(address, asChain(account)),
    spending: { account, policyKey: policy.key },
    includeSpending: policy.key !== undefined,
  }).data;

  const currentLimit: TransferLimit | undefined = policy.transfers.limits[address];
  const limit = currentLimit ?? DEFAULT_LIMIT;

  const inputProps = useBigIntInput({
    value: limit.amount > 0n ? limit.amount : undefined,
    decimals: t?.decimals,
    onChange: (amount) =>
      update(({ transfers }) => {
        if (amount !== undefined) {
          transfers.limits[address] = {
            amount,
            duration: transfers.limits[address]?.duration ?? DEFAULT_DURATION.as('seconds'),
          };
        } else {
          delete transfers.limits[address];
        }
      }),
  });

  return (
    <>
      <AppbarOptions
        mode="large"
        leading="back"
        headline={`${t?.name ?? truncateAddr(address)} Spending`}
      />

      <ScrollableScreenSurface style={styles.surface}>
        <ListHeader>Spending limit</ListHeader>

        <View style={styles.limitContainer}>
          <BasicTextField
            {...inputProps}
            placeholder="0"
            style={styles.input}
            placeholderTextColor={styles.inputPlaceholder.color}
          />

          <Text variant="labelMedium">per</Text>

          <SelectChip
            entries={SPENDING_LIMIT_DURATIONS}
            value={Duration.fromObject({ seconds: limit.duration })}
            onChange={(duration) =>
              update(({ transfers }) => {
                transfers.limits[address] = {
                  amount: transfers.limits[address]?.amount ?? 0n,
                  duration: duration.as('seconds'),
                };
              })
            }
            equals={(a, b) => a.as('seconds') === b.as('seconds')}
            chipProps={{ icon: ClockOutlineIcon, disabled: !limit.amount }}
          />
        </View>

        {t?.spending && t.spending.limit && (
          <View>
            <View style={styles.periodContainer}>
              <Text variant="bodyLarge">
                <Timestamp timestamp={t.spending.since} />
                {' - '}
                <Timestamp
                  timestamp={DateTime.fromISO(t.spending.since).plus({ seconds: limit.duration })}
                />
              </Text>

              <ProgressBar
                progress={new Decimal(t.spending.spent).div(t.spending.limit).toNumber()}
              />
            </View>

            {t.spending.transfers
              .filter(
                (t): t is Extract<typeof t, { __typename: 'Transfer' }> =>
                  t.__typename === 'Transfer',
              )
              .map((t) => (
                <IncomingTransferItem key={t.id} transfer={t} />
              ))}
          </View>
        )}

        <Actions style={styles.actions}>
          <Button
            mode="contained"
            contentStyle={styles.removeContainer}
            labelStyle={styles.removeLabel}
            onPress={() => {
              update(({ transfers }) => {
                delete transfers.limits[address];
              });
            }}
          >
            Remove
          </Button>
        </Actions>
      </ScrollableScreenSurface>
    </>
  );
}

const stylesheet = createStyles(({ colors, fonts }) => ({
  surface: {
    paddingTop: 8,
  },
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 24,
  },
  input: {
    flex: 1,
    color: colors.primary,
    ...fonts.headlineMedium,
  },
  inputPlaceholder: {
    color: colors.tertiary,
  },
  periodContainer: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  actions: {
    alignItems: 'flex-end',
  },
  removeContainer: {
    backgroundColor: colors.errorContainer,
  },
  removeLabel: {
    color: colors.onErrorContainer,
  },
}));

export const TokenSpending = withSuspense(TokenSpending_, <RectSkeleton height={200} />);
