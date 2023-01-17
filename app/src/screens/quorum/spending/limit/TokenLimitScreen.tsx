import { useNavigation } from '@react-navigation/native';
import { RemoveIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useToken } from '@token/useToken';
import { Address, DEFAULT_SPENDING, TokenLimit, TokenLimitPeriod, ZERO } from 'lib';
import { Appbar, Menu, SegmentedButtons, Text } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { Box } from '~/components/layout/Box';
import TokenIcon from '~/components/token/TokenIcon/TokenIcon';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useConfirmRemoval } from '~/screens/alert/useConfirm';
import { AmountInput } from '~/screens/amount/AmountInput';
import { useQuorumDraft } from '../../QuorumDraftProvider';
import { BigNumber } from 'ethers';

type LimitState = Omit<TokenLimit, 'amount'> & {
  amount?: BigNumber;
};

const DEFAULTS = {
  amount: ZERO,
  period: TokenLimitPeriod.Month,
};

export interface TokenLimitScreenParams {
  token: Address;
}

export type TokenLimitScreenProps = StackNavigatorScreenProps<'TokenLimit'>;

export const TokenLimitScreen = ({ route: { params } }: TokenLimitScreenProps) => {
  const token = useToken(params.token);
  const styles = useStyles();
  const { goBack } = useNavigation();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove this token limit?',
  });

  const {
    state: { spending },
    updateState,
  } = useQuorumDraft();

  const initLimit: TokenLimit | undefined = spending?.limits[token.addr];
  const limit: LimitState = initLimit ?? { token: token.addr, period: DEFAULTS.period };

  const updateLimit = (update: Partial<TokenLimit>) =>
    updateState((state) => {
      if (!state.spending) state.spending = DEFAULT_SPENDING;
      state.spending.limits[token.addr] = { ...DEFAULTS, ...limit, ...update };
    });

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="" />

        {initLimit && (
          <AppbarMore>
            {({ close }) => (
              <Menu.Item
                leadingIcon={RemoveIcon}
                title="Remove limit"
                onPress={() => {
                  confirmRemove({
                    onConfirm: () => {
                      updateState((state) => {
                        delete state.spending?.limits[token.addr];
                      });
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

      <Box style={styles.tokenContainer}>
        <TokenIcon token={token} size={styles.tokenIcon.fontSize} />

        <Text variant="headlineLarge" style={styles.tokenLabel}>
          {token.name}
        </Text>
      </Box>

      <AmountInput
        token={token}
        amount={limit.amount}
        setAmount={(amount) => updateLimit({ amount })}
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
        value={limit.period ?? DEFAULTS.period}
        onValueChange={(period) => updateLimit({ period: period as TokenLimitPeriod })}
        style={styles.period}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
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
