import { PolicyScreenParams } from '~/app/(drawer)/[account]/policies/[key]';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zAddress } from '~/lib/zod';
import { TransferLimit, asChain, asUAddress } from 'lib';
import { Duration } from 'luxon';
import { View } from 'react-native';
import { BasicTextField } from '~/components/fields/BasicTextField';
import { SelectChip } from '~/components/fields/SelectChip';
import { ListHeader } from '~/components/list/ListHeader';
import { useBigIntInput } from '~/components/fields/useBigIntInput';
import { ClockOutlineIcon } from '@theme/icons';
import { gql } from '@api/generated';
import { usePolicyDraftState } from '~/lib/policy/draft';
import { useQuery } from '~/gql';
import { AppbarOptions } from '~/components/Appbar/AppbarOptions';
import { truncateAddr } from '~/util/format';
import { ScreenSurface } from '~/components/layout/ScreenSurface';
import { Text } from 'react-native-paper';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { createStyles, useStyles } from '@theme/styles';

const Query = gql(/* GraphQL */ `
  query TokenLimitScreen($token: UAddress!) {
    token(input: { address: $token }) {
      id
      name
      decimals
    }
  }
`);

const DEFAULT_DURATION = Duration.fromObject({ day: 1 });

const DEFAULT_LIMIT: TransferLimit = { amount: 0n, duration: DEFAULT_DURATION.as('seconds') };

export const SPENDING_LIMIT_DURATIONS = [
  ['Hour', Duration.fromObject({ hours: 1 })],
  ['Day', DEFAULT_DURATION],
  ['Week', Duration.fromObject({ weeks: 1 })],
  ['Month (4 weeks)', Duration.fromObject({ weeks: 4 })],
  ['Quarter (12 weeks)', Duration.fromObject({ weeks: 12 })],
  ['Year (52 weeks)', Duration.fromObject({ days: 364 })],
] as const;

export const TokenLimitScreenParams = PolicyScreenParams.extend({ token: zAddress });

export default function TokenLimitScreen() {
  const { token: address, account } = useLocalParams(TokenLimitScreenParams);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();

  const { token: t } = useQuery(Query, { token: asUAddress(address, asChain(account)) }).data;

  const [policy, update] = usePolicyDraftState();

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

  useEffect(() => {
    update(({ transfers }) => {
      transfers.limits[address] ??= DEFAULT_LIMIT;
    });
  }, [address, update]);

  return (
    <>
      <AppbarOptions
        mode="large"
        leading="back"
        headline={`${t?.name ?? truncateAddr(address)} Spending`}
      />

      <ScreenSurface style={styles.surface}>
        <ListHeader>Spending limit</ListHeader>

        <View style={styles.container}>
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

        <Actions>
          <Button
            mode="contained"
            contentStyle={styles.removeContainer}
            labelStyle={styles.removeLabel}
            onPress={() => {
              update(({ transfers }) => {
                delete transfers.limits[address];
              });
              router.back();
            }}
          >
            Remove
          </Button>
        </Actions>
      </ScreenSurface>
    </>
  );
}

const stylesheet = createStyles(({ colors, fonts }) => ({
  surface: {
    paddingTop: 8,
  },
  container: {
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
  removeContainer: {
    backgroundColor: colors.errorContainer,
  },
  removeLabel: {
    color: colors.onErrorContainer,
  },
  input2Container: {
    backgroundColor: colors.surface,
  },
}));
