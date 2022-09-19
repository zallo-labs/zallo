import { CalendarTodayIcon, CheckIcon } from '@theme/icons';
import { useToken } from '@token/useToken';
import { Address, Limit, ZERO } from 'lib';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { TokenBalanceCard } from '~/components/token/TokenBalanceCard';
import { Proposable } from '~/gql/proposable';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { LimitAppbar } from './LimitAppbar';
import { useState } from 'react';
import _ from 'lodash';
import { FAB } from '~/components/FAB';
import { useBigNumberInput } from '~/components/fields/useBigNumberInput';
import { TextField } from '~/components/fields/TextField';
import { Provider, SegmentedButtons, TextInput } from 'react-native-paper';
import { useTheme } from '@theme/paper';
import { LimitPeriod } from '~/gql/generated.api';
import { ETH } from '@token/tokens';

export type LimitScreenParams = {
  onChange: (limit: Limit | null) => void;
} & (
  | {
      limit: Limit;
    }
  | {
      token: Address;
    }
);

const defaultLimit: Limit = {
  token: ETH.addr,
  amount: ZERO,
  period: LimitPeriod.Month,
};

export type LimitScreenProps = RootNavigatorScreenProps<'Limit'>;

export const LimitScreen = withSkeleton(
  ({ route, navigation }: LimitScreenProps) => {
    return null;

    // const { wallet, onChange } = route.params;
    // const token = useToken(route.params.token);
    // const initialLimit = route.params.limit
    //   ? latest(route.params.limit)
    //   : defaultLimit;

    // const [limit, setLimit] = useState(initialLimit ?? defaultLimit);
    // const isModified = !_.isEqual(limit, initialLimit);

    // const amountProps = useBigNumberInput({
    //   value: limit.amount,
    //   onChange: (amount) => setLimit({ ...limit, amount }),
    //   decimals: token.decimals,
    // });

    // return (
    //   <Box flex={1}>
    //     <LimitAppbar
    //       limit={route.params.limit}
    //       remove={() => onChange(null, token.addr)}
    //     />

    //     <Provider theme={useTheme()}>
    //       <Container mx={3} separator={<Box my={2} />}>
    //         <TokenBalanceCard token={token} account={wallet.accountAddr} />

    //         <TextField
    //           label="Amount"
    //           {...amountProps}
    //           right={<TextInput.Affix text={token.symbol} />}
    //         />

    //         <Box horizontal justifyContent="center">
    //           <SegmentedButtons
    //             value={limit.period}
    //             onValueChange={(period) =>
    //               setLimit({ ...limit, period: period as LimitPeriod })
    //             }
    //             buttons={Object.entries(LIMIT_PERIOD_LABEL).map(
    //               ([period, label]) => ({
    //                 value: period as LimitPeriod,
    //                 label,
    //               }),
    //             )}
    //           />
    //         </Box>
    //       </Container>
    //     </Provider>

    //     {isModified && (
    //       <FAB
    //         icon={CheckIcon}
    //         label="Apply"
    //         onPress={() => {
    //           onChange(limit, token.addr);
    //           navigation.goBack();
    //         }}
    //       />
    //     )}
    //   </Box>
    // );
  },
  ScreenSkeleton,
);
