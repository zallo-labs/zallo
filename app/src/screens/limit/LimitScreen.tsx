import { CalendarIcon, CheckIcon } from '@theme/icons';
import { useToken } from '@token/useToken';
import { Address, ZERO } from 'lib';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { TokenBalanceCard } from '~/components/token/TokenBalanceCard';
import { latest, Proposable } from '~/gql/proposable';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import {
  CombinedWallet,
  LIMIT_PERIOD_LABEL,
  TokenLimit,
} from '~/queries/wallets';
import { LimitAppbar } from './LimitAppbar';
import { useState } from 'react';
import _ from 'lodash';
import { FAB } from '~/components/FAB';
import { useBigNumberInput } from '~/components/fields/useBigNumberInput';
import { TextField } from '~/components/fields/TextField';
import { Provider, TextInput } from 'react-native-paper';
import { SelectField } from '~/components/fields/SelectField';
import { useTheme } from '@theme/paper';
import { LimitPeriod } from '~/gql/generated.api';

const PERIOD_ENTIRES = Object.entries(LIMIT_PERIOD_LABEL).map(
  ([period, label]): [string, LimitPeriod] => [label, period as LimitPeriod],
);

export interface LimitScreenParams {
  wallet: CombinedWallet;
  token: Address;
  limit?: Proposable<TokenLimit>;
  onChange: (limit: TokenLimit | null, token: Address) => void;
}

const defaultLimit: TokenLimit = {
  amount: ZERO,
  period: LimitPeriod.Month,
};

export type LimitScreenProps = RootNavigatorScreenProps<'Limit'>;

export const LimitScreen = withSkeleton(
  ({ route, navigation }: LimitScreenProps) => {
    const { wallet, onChange } = route.params;
    const token = useToken(route.params.token);
    const initialLimit = route.params.limit
      ? latest(route.params.limit)
      : defaultLimit;

    const [limit, setLimit] = useState(initialLimit ?? defaultLimit);
    const isModified = !_.isEqual(limit, initialLimit);

    const amountProps = useBigNumberInput({
      value: limit.amount,
      onChange: (amount) => setLimit({ ...limit, amount }),
      decimals: token.decimals,
    });

    return (
      <Box flex={1}>
        <LimitAppbar
          proposable={route.params.limit}
          remove={() => onChange(null, token.addr)}
        />

        <Provider theme={useTheme()}>
          <Container mx={3} separator={<Box my={2} />}>
            <TokenBalanceCard token={token} account={wallet.accountAddr} />

            <TextField
              label="Amount"
              {...amountProps}
              right={<TextInput.Affix text={token.symbol} />}
            />

            <Box horizontal justifyContent="flex-end">
              <SelectField
                value={limit.period}
                onChange={(period) => setLimit({ ...limit, period })}
                entries={PERIOD_ENTIRES}
                chipProps={{
                  icon: CalendarIcon,
                }}
              />
            </Box>
          </Container>
        </Provider>

        {isModified && (
          <FAB
            icon={CheckIcon}
            label="Apply"
            onPress={() => {
              onChange(limit, token.addr);
              navigation.goBack();
            }}
          />
        )}
      </Box>
    );
  },
  ScreenSkeleton,
);
