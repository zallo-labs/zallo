import { Address, Limit, UserId, ZERO } from 'lib';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { LimitPeriod } from '~/gql/generated.api';
import { BigNumber } from 'ethers';
import { useMemo, useState } from 'react';
import { Box } from '~/components/layout/Box';
import { LimitAppbar } from './LimitAppbar';
import { ScrollView } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { useToken } from '@token/useToken';
import { Text } from 'react-native-paper';
import { LimitFields } from './LimitFields';
import { LimitAvailable } from './LimitAvailable';
import _ from 'lodash';
import { FAB } from '~/components/FAB';
import { CheckIcon } from '@theme/icons';

export interface LimitScreenParams {
  user: UserId;
  token: Address;
  amount?: BigNumber;
  period?: LimitPeriod;
  onChange: (limit: Limit) => void;
  onDelete?: () => void;
}

export type LimitScreenProps = RootNavigatorScreenProps<'Limit'>;

const LimitScreen = ({ route, navigation }: LimitScreenProps) => {
  const { user, onChange, onDelete } = route.params;
  const styles = useStyles();
  const token = useToken(route.params.token);

  const initial = useMemo(
    () => ({
      token: route.params.token,
      amount: route.params.amount ?? ZERO,
      period: route.params.period ?? LimitPeriod.Month,
    }),
    [route.params],
  );
  const [limit, setLimit] = useState<Limit>(initial);
  const isModified = !_.isEqual(limit, initial);

  return (
    <Box flex={1}>
      <LimitAppbar onDelete={onDelete} />

      <ScrollView contentContainerStyle={styles.container}>
        <Box vertical alignItems="center">
          <TokenIcon token={token} size={styles.tokenIcon.fontSize} />
          <Text variant="headlineSmall">{token.name}</Text>
        </Box>

        <LimitAvailable
          user={user}
          token={token.addr}
          style={[styles.section, styles.available]}
        />

        <LimitFields style={styles.section} limit={limit} setLimit={setLimit} />
      </ScrollView>

      {isModified && (
        <FAB
          icon={CheckIcon}
          label="Accept"
          onPress={() => {
            onChange(limit);
            navigation.goBack();
          }}
        />
      )}
    </Box>
  );
};

const useStyles = makeStyles(({ space, iconSize }) => ({
  container: {
    paddingHorizontal: space(2),
  },
  section: {
    marginTop: space(4),
  },
  tokenIcon: {
    fontSize: iconSize.large,
  },
  available: {
    marginHorizontal: space(2),
  },
}));

export default withSkeleton(LimitScreen, ScreenSkeleton);
