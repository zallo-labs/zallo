import { AddIcon, SpendingIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Address, DEFAULT_SPENDING } from 'lib';
import { FlatList } from 'react-native';
import { Divider, Switch } from 'react-native-paper';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { Fab } from '~/components/buttons/Fab';
import { Box } from '~/components/layout/Box';
import { ListItem } from '~/components/list/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useSelectToken } from '~/screens/tokens/useSelectToken';
import { useQuorumDraft } from '../QuorumDraftProvider';
import { TokenLimitItem } from './TokenLimitItem';

export interface QuorumSpendingScreenParams {}

export type QuorumSpendingScreenProps = StackNavigatorScreenProps<'QuorumSpending'>;

export const QuorumSpendingScreen = ({ navigation }: QuorumSpendingScreenProps) => {
  const styles = useStyles();
  const selectToken = useSelectToken();
  const { quorum, state, updateState } = useQuorumDraft();
  const spending = state.spending ?? DEFAULT_SPENDING;

  const limits = Object.values(spending.limits);

  return (
    <Box flex={1}>
      <AppbarLarge leading="back" headline={`${quorum.name} spending`} />

      <FlatList
        data={limits}
        ListHeaderComponent={
          <>
            <ListItem
              leading={SpendingIcon}
              headline="Allow fallback spending"
              supporting="Applied to tokens that aren't limited"
              trailing={({ disabled }) => (
                <Switch
                  value={spending.fallback === 'allow'}
                  onValueChange={(v) => {
                    updateState((state) => {
                      state.spending = {
                        ...DEFAULT_SPENDING,
                        fallback: v ? 'allow' : 'deny',
                      };
                    });
                  }}
                  disabled={disabled}
                />
              )}
            />

            {limits.length > 0 && <Divider />}
          </>
        }
        renderItem={({ item }) => <TokenLimitItem token={item.token} />}
        ListHeaderComponentStyle={styles.header}
      />

      <Fab
        icon={AddIcon}
        label="Token limit"
        onPress={async () => {
          const token = await selectToken({
            account: quorum,
            disabled: new Set(Object.keys(spending.limits) as Address[]),
          });
          navigation.replace('TokenLimit', { token: token.addr });
        }}
      />
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
  limitsHeader: {
    marginTop: s(24),
    marginBottom: s(8),
    marginHorizontal: s(16),
  },
  header: {
    marginBottom: s(8),
  },
}));
