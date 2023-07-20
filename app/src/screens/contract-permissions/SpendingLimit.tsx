import { makeStyles } from '@theme/makeStyles';
import { useImmerAtom } from 'jotai-immer';
import { TransferLimit } from 'lib';
import { Duration } from 'luxon';
import { View } from 'react-native';
import { BasicTextField } from '~/components/fields/BasicTextField';
import { SelectChip } from '~/components/fields/SelectChip';
import { ListHeader } from '~/components/list/ListHeader';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { useBigIntInput } from '~/components/fields/useBigIntInput';
import { ClockOutlineIcon } from '@theme/icons';
import { FragmentType, gql, useFragment } from '@api/gen';

const Fragment = gql(/* GraphQL */ `
  fragment SpendingLimit_token on Token {
    id
    address
    decimals
  }
`);

const DEFAULT_DURATION = Duration.fromObject({ day: 1 });

const DURATIONS = [
  ['Hourly', Duration.fromObject({ hour: 1 })],
  ['Daily', DEFAULT_DURATION],
  ['Weekly', Duration.fromObject({ week: 1 })],
  ['Montly (30 days)', Duration.fromObject({ days: 30 })],
  ['Quarterly (90 days)', Duration.fromObject({ days: 90 })],
  ['Yearly (365 days)', Duration.fromObject({ days: 365 })],
] as const;

export interface SpendingLimitProps {
  token: FragmentType<typeof Fragment>;
}

export function SpendingLimit(props: SpendingLimitProps) {
  const styles = useStyles();
  const t = useFragment(Fragment, props.token);

  const [policy, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);
  const limit: TransferLimit | undefined = policy.permissions.transfers.limits[t.address];

  const inputProps = useBigIntInput({
    value: limit?.amount,
    decimals: t.decimals,
    onChange: (amount) =>
      updatePolicy(({ permissions: { transfers } }) => {
        if (amount !== undefined) {
          transfers.limits[t.address] = {
            amount,
            duration: transfers.limits[t.address]?.duration ?? DEFAULT_DURATION.as('seconds'),
          };
        } else {
          delete transfers.limits[t.address];
        }
      }),
  });

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
              transfers.limits[t.address] = {
                amount: transfers.limits[t.address]?.amount ?? 0n,
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
