import { AddIcon, SpendingIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { produce } from 'immer';
import {
  Address,
  DEFAULT_SPENDING,
  Quorum,
  Spending,
  TokenLimit,
  TokenLimitPeriod,
  ZERO,
} from 'lib';
import { useCallback } from 'react';
import { FlatList } from 'react-native';
import { Divider, Switch } from 'react-native-paper';
import { Updater } from 'use-immer';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { Fab } from '~/components/Fab/Fab';
import { Box } from '~/components/layout/Box';
import { ListItem } from '~/components/ListItem/ListItem';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useSelectToken } from '~/screens/tokens/useSelectToken';
import { useQuorumDraft } from '../QuorumDraftProvider';
import { LimitItem } from './LimitItem';

export interface QuorumSpendingScreenParams {}

export type QuorumSpendingScreenProps = StackNavigatorScreenProps<'QuorumSpending'>;

export const QuorumSpendingScreen = ({ navigation }: QuorumSpendingScreenProps) => {
  const styles = useStyles();
  const selectToken = useSelectToken();
  const { quorum, state, updateState } = useQuorumDraft();
  const spending = state.spending ?? DEFAULT_SPENDING;

  const limits = Object.values(spending.limit);

  const updateSpending: Updater<Spending> = useCallback(
    (valOrUpdater) =>
      updateState((state) => {
        typeof valOrUpdater === 'function'
          ? valOrUpdater(state.spending ?? DEFAULT_SPENDING)
          : (state.spending = valOrUpdater);
      }),
    [updateState],
  );

  const getUpdateLimit =
    (token: Address): Updater<TokenLimit> =>
    (limit) =>
      updateSpending((spending) => {
        typeof limit === 'function'
          ? limit(spending.limit[token])
          : (spending.limit[token] = limit);
      });

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
                    updateSpending((spending) => {
                      spending.fallback = v ? 'allow' : 'deny';
                    });
                  }}
                  disabled={disabled}
                />
              )}
            />

            {limits.length > 0 && <Divider />}
          </>
        }
        renderItem={({ item }) => (
          <LimitItem
            limit={item}
            updateLimit={getUpdateLimit(item.token)}
            removeLimit={() =>
              updateSpending((spending) => {
                delete spending.limit[item.token];
              })
            }
          />
        )}
        ListHeaderComponentStyle={styles.header}
      />

      <Fab
        icon={AddIcon}
        label="Add token limit"
        onPress={() =>
          selectToken({
            quorum,
            disabled: new Set(Object.keys(spending.limit) as Address[]),
            onSelect: (token) =>
              navigation.replace('TokenLimit', {
                limit: {
                  token: token.addr,
                  amount: ZERO,
                  period: TokenLimitPeriod.Month,
                },
                updateLimit: getUpdateLimit(token.addr),
              }),
          })
        }
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
