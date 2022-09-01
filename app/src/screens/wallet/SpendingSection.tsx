import { PlusIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import produce from 'immer';
import { address } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, Switch, Text } from 'react-native-paper';
import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { latest } from '~/gql/proposable';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedWallet, Limits } from '~/queries/wallets';
import { useCreateLimit } from '../limit/useCreateLimit';
import { TokenLimitCard } from './TokenLimitCard';

export interface SpendingSectionProps {
  wallet: CombinedWallet;
  limits: Limits;
  setLimits: (limits: Limits) => void;
  style?: StyleProp<ViewStyle>;
}

export const SpendingSection = ({
  wallet,
  limits,
  setLimits,
  style,
}: SpendingSectionProps) => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();
  const createLimit = useCreateLimit(wallet);

  return (
    <Accordion
      title={<Text variant="titleMedium">Spending</Text>}
      initiallyExpanded
      style={style}
    >
      <Container separator={<Box mt={2} />}>
        <Box horizontal justifyContent="space-between" alignItems="center">
          <Text variant="bodyMedium">Allow spending tokens not listed</Text>
          <Switch
            value={latest(limits.allowlisted) ?? false}
            onValueChange={(proposed) =>
              setLimits({
                ...limits,
                allowlisted: {
                  ...limits.allowlisted,
                  proposed,
                },
              })
            }
          />
        </Box>

        {Object.entries(limits.tokens).map(([token, limit]) => (
          <TokenLimitCard
            key={token}
            wallet={wallet}
            token={address(token)}
            limit={limit}
            onPress={() =>
              navigate('Limit', {
                wallet,
                token: address(token),
                limit,
                onChange: (newLimit) => {
                  setLimits(
                    produce(limits, (limits) => {
                      limits.tokens[address(token)].proposed = newLimit;
                    }),
                  );
                },
              })
            }
          />
        ))}

        <Button
          icon={PlusIcon}
          style={styles.end}
          onPress={() =>
            createLimit({
              wallet,
              onChange: (newLimit, token) =>
                setLimits(
                  produce(limits, (limits) => {
                    if (newLimit !== null) {
                      limits.tokens[token] = {
                        proposed: newLimit,
                      };
                    }
                  }),
                ),
            })
          }
        >
          Limit
        </Button>
      </Container>
    </Accordion>
  );
};

const useStyles = makeStyles(({ space }) => ({
  end: {
    alignSelf: 'flex-end',
  },
}));
