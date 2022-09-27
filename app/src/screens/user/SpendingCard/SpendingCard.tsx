import { PlusIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useTokenBalances } from '@token/useTokenBalance';
import { useTotalAvailableValue } from '@token/useTotalAvailableValue';
import produce from 'immer';
import { address, Address, Limit, UserConfig, ZERO } from 'lib';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Button, Switch, Text } from 'react-native-paper';
import { Card } from '~/components/card/Card';
import { Chevron } from '~/components/Chevron';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Box } from '~/components/layout/Box';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useCreateLimit } from '~/screens/limit/useCreateLimit';
import { TokenLimitItem } from './TokenLimitItem';

export interface SpendingCardProps {
  user: CombinedUser;
  config: UserConfig;
  setConfig: Dispatch<SetStateAction<UserConfig>>;
  style?: StyleProp<ViewStyle>;
}

export const SpendingCard = ({
  user,
  config,
  setConfig,
  style,
}: SpendingCardProps) => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();
  const createLimit = useCreateLimit(user, config);
  const balances = useTokenBalances(user);

  const [expanded, setExpanded] = useState(true);

  const tokens: Record<Address, Limit | undefined> = useMemo(() => {
    const tokensWithABalance = balances
      .filter(({ balance }) => balance.gt(ZERO))
      .map(({ token }) => [token.addr, undefined] as const);

    return {
      ...Object.fromEntries(tokensWithABalance),
      ...config.limits,
    };
  }, [balances, config.limits]);

  return (
    <Card
      style={style}
      touchableStyle={styles.container}
      onPress={() => setExpanded((expanded) => !expanded)}
    >
      <Box style={styles.row}>
        <Text variant="titleLarge">Spending</Text>
        <Chevron expanded={expanded} />
      </Box>

      <Box style={[styles.row, styles.section]}>
        <Text variant="bodyLarge">Available</Text>
        <Text variant="titleMedium">
          <FiatValue value={useTotalAvailableValue(user, config)} />
        </Text>
      </Box>

      <Collapsible collapsed={!expanded}>
        <Box style={[styles.row, styles.section]}>
          <Text variant="bodyLarge" style={styles.label}>
            Allow spending tokens not listed
          </Text>

          <Switch
            value={!config.spendingAllowlisted}
            onValueChange={(v) =>
              setConfig((config) =>
                produce(config, (config) => {
                  config.spendingAllowlisted = !v;
                }),
              )
            }
          />
        </Box>

        <Box style={styles.section}>
          {Object.entries(tokens).map(([token, limit]) => (
            <TokenLimitItem
              key={token}
              user={user}
              token={address(token)}
              limit={limit}
              style={styles.item}
              onPress={() =>
                navigate(
                  'Limit',
                  limit
                    ? {
                        user,
                        ...limit,
                        onChange: (newLimit) => {
                          setConfig((config) =>
                            produce(config, (config) => {
                              if (newLimit.token !== limit.token)
                                delete config.limits[limit.token];

                              config.limits[newLimit.token] = newLimit;
                            }),
                          );
                        },
                        onDelete: () => {
                          delete config.limits[limit.token];
                        },
                      }
                    : {
                        user,
                        token: address(token),
                        onChange: (newLimit) => {
                          setConfig((config) =>
                            produce(config, (config) => {
                              config.limits[newLimit.token] = newLimit;
                            }),
                          );
                        },
                      },
                )
              }
            />
          ))}
        </Box>

        <Button
          icon={PlusIcon}
          style={styles.create}
          onPress={() =>
            createLimit((limit) => {
              setConfig((config) =>
                produce(config, (config) => {
                  config.limits[limit.token] = limit;
                }),
              );
            })
          }
        >
          Token limit
        </Button>
      </Collapsible>
    </Card>
  );
};

const useStyles = makeStyles(({ space }) => ({
  container: {
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space(2),
  },
  section: {
    marginTop: space(1),
  },
  item: {
    paddingHorizontal: space(2),
  },
  label: {
    flexShrink: 1,
  },
  create: {
    alignSelf: 'flex-end',
  },
}));
