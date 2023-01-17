import { useNavigation } from '@react-navigation/native';
import { CheckIcon, RemoveIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useToken } from '@token/useToken';
import { TokenLimit, TokenLimitPeriod, ZERO } from 'lib';
import { ScrollView } from 'react-native';
import { Appbar, Button, Menu, SegmentedButtons, Text } from 'react-native-paper';
import { Updater, useImmer } from 'use-immer';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Box } from '~/components/layout/Box';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useConfirmRemoval } from '~/screens/alert/useConfirm';
import { AmountInput } from '~/screens/amount/AmountInput';

export interface TokenLimitScreenParams {
  limit: TokenLimit;
  updateLimit: Updater<TokenLimit>;
  removeLimit?: () => void;
}

export type TokenLimitScreenProps = StackNavigatorScreenProps<'TokenLimit'>;

export const TokenLimitScreen = ({ route: { params } }: TokenLimitScreenProps) => {
  const { limit: initialLimit, updateLimit: saveLimit, removeLimit } = params;
  const token = useToken(initialLimit.token);
  const styles = useStyles();
  const { goBack } = useNavigation();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this token limit?',
  });

  const [limit, updateLimit] = useImmer(initialLimit);

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="" />

        {removeLimit && (
          <AppbarMore>
            {({ close }) => (
              <Menu.Item
                leadingIcon={RemoveIcon}
                title="Remove limit"
                onPress={() => {
                  confirmRemove({
                    onConfirm: () => {
                      removeLimit();
                      goBack();
                    },
                  });
                  close();
                }}
              />
            )}
          </AppbarMore>
        )}
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.container}>
        <Box style={styles.tokenContainer}>
          <TokenIcon token={token} size={styles.tokenIcon.fontSize} />

          <Text variant="headlineLarge" style={styles.tokenLabel}>
            {token.name}
          </Text>
        </Box>

        <AmountInput
          token={token}
          amount={limit.amount}
          setAmount={(amount) =>
            updateLimit((limit) => {
              limit.amount = amount ?? ZERO;
            })
          }
          style={styles.amountInput}
        />

        <SegmentedButtons
          buttons={[
            {
              label: 'Daily',
              value: TokenLimitPeriod.Day,
              showSelectedCheck: true,
            },
            {
              label: 'Weekly',
              value: TokenLimitPeriod.Week,
              showSelectedCheck: true,
            },
            {
              label: 'Monthly',
              value: TokenLimitPeriod.Month,
              showSelectedCheck: true,
            },
          ]}
          value={limit.period}
          onValueChange={(period) =>
            updateLimit((limit) => {
              limit.period = period as TokenLimitPeriod;
            })
          }
          style={styles.period}
        />

        <Box flex={1} />

        <Button
          mode="contained"
          icon={CheckIcon}
          style={styles.save}
          onPress={() => {
            saveLimit(limit);
            goBack();
          }}
        >
          Accept
        </Button>
      </ScrollView>
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
  container: {
    flex: 1,
  },
  tokenContainer: {
    alignItems: 'center',
  },
  tokenIcon: {
    fontSize: s(100),
  },
  tokenLabel: {
    marginTop: s(8),
    marginBottom: s(32),
  },
  amountInput: {
    marginBottom: s(32),
    marginHorizontal: s(16),
  },
  period: {
    alignSelf: 'center',
    marginHorizontal: s(16),
  },
  save: {
    alignSelf: 'center',
    marginBottom: s(24),
  },
}));
