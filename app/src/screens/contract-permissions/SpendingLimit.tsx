import { makeStyles } from '@theme/makeStyles';
import { useMaybeToken } from '@token/useToken';
import { useImmerAtom } from 'jotai-immer';
import { Address, TransferLimit } from 'lib';
import { Duration } from 'luxon';
import { View } from 'react-native';
import { BasicTextField } from '~/components/fields/BasicTextField';
import { SelectChip } from '~/components/fields/SelectChip';
import { ListHeader } from '~/components/list/ListHeader';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { useBigIntInput } from '~/components/fields/useBigIntInput';
import { ClockOutlineIcon } from '@theme/icons';

const DEFAULT_DURATION = Duration.fromObject({ day: 1 });

const DURATIONS = [
  ['Hourly', Duration.fromObject({ hour: 1 })],
  ['Daily', DEFAULT_DURATION],
  ['Weekly', Duration.fromObject({ week: 1 })],
  ['30 days', Duration.fromObject({ days: 30 })],
] as const;

export interface SpendingLimitProps {
  contract: Address;
}

export function SpendingLimit({ contract }: SpendingLimitProps) {
  const styles = useStyles();
  const token = useMaybeToken(contract);

  const [policy, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);
  const limit: TransferLimit | undefined = policy.permissions.transfers.limits[contract];

  const inputProps = useBigIntInput({
    value: limit?.amount,
    decimals: token?.decimals ?? 0,
    onChange: (amount) =>
      updatePolicy(({ permissions: { transfers } }) => {
        if (amount !== undefined) {
          transfers.limits[contract] = {
            amount,
            duration: transfers.limits[contract]?.duration ?? DEFAULT_DURATION.as('seconds'),
          };
        } else {
          delete transfers.limits[contract];
        }
      }),
  });

  if (!token) return null;

  return (
    <>
      <ListHeader>Spending limit</ListHeader>

      <View style={styles.container}>
        <BasicTextField
          {...inputProps}
          placeholder="Unlimited"
          style={styles.input}
          placeholderTextColor={styles.inputPlaceholder.color}
        />

        <SelectChip
          entries={DURATIONS}
          value={limit ? Duration.fromObject({ seconds: limit.duration }) : DEFAULT_DURATION}
          onChange={(duration) =>
            updatePolicy(({ permissions: { transfers } }) => {
              transfers.limits[contract] = {
                amount: transfers.limits[contract]?.amount ?? 0n,
                duration: duration.as('seconds'),
              };
            })
          }
          equals={(a, b) => a.as('seconds') === b.as('seconds')}
          chipProps={{ icon: ClockOutlineIcon, disabled: !limit }}
        />
      </View>
    </>
  );
}

const useStyles = makeStyles(({ colors, fonts }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
}));
