import { PlusIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import produce from 'immer';
import { address, LimitsConfig } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, Switch, Text } from 'react-native-paper';
import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { ProposableIcon } from '~/components/proposable/ProposableIcon';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { CombinedUser } from '~/queries/user/useUser.api';
import { useCreateLimit } from '../../limit/useCreateLimit';

export interface SpendingSectionProps {
  user: CombinedUser;
  limits: LimitsConfig;
  setLimits: (f: (limits: LimitsConfig) => LimitsConfig) => void;
  style?: StyleProp<ViewStyle>;
}

export const SpendingSection = ({
  user,
  limits,
  setLimits,
  style,
}: SpendingSectionProps) => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();
  // const createLimit = useCreateLimit(user);

  return null;

  // return (
  //   <Accordion
  //     title={<Text variant="titleMedium">Spending</Text>}
  //     initiallyExpanded
  //     style={style}
  //   >
  //     <Container separator={<Box mt={2} />}>
  //       <Box horizontal alignItems="center">
  //         <Text variant="bodyMedium" style={{ flex: 1 }}>
  //           Restrict spending to tokens listed
  //         </Text>
  //         <ProposableIcon proposable={limits.allowlisted} />
  //         <Switch
  //           value={latest(limits.allowlisted) ?? false}
  //           onValueChange={(proposed) =>
  //             setLimits((limits) => ({
  //               ...limits,
  //               allowlisted: setProposed(limits.allowlisted, proposed),
  //             }))
  //           }
  //         />
  //       </Box>

  //       {Object.entries(limits.tokens).map(([token, limit]) => (
  //         <TokenLimitCard
  //           key={token}
  //           wallet={user}
  //           token={address(token)}
  //           limit={limit}
  //           onPress={() =>
  //             navigate('Limit', {
  //               wallet: user,
  //               token: address(token),
  //               limit,
  //               onChange: (newLimit) => {
  //                 setLimits((limits) =>
  //                   produce(limits, (limits) => {
  //                     limits.tokens[address(token)] = setProposed(
  //                       limits.tokens[address(token)],
  //                       newLimit,
  //                     );
  //                   }),
  //                 );
  //               },
  //             })
  //           }
  //         />
  //       ))}

  //       <Button
  //         icon={PlusIcon}
  //         style={styles.end}
  //         onPress={() =>
  //           createLimit({
  //             wallet: user,
  //             onChange: (newLimit, token) =>
  //               setLimits((limits) =>
  //                 produce(limits, (limits) => {
  //                   if (newLimit !== null) {
  //                     limits.tokens[token] = {
  //                       proposed: newLimit,
  //                     };
  //                   }
  //                 }),
  //               ),
  //           })
  //         }
  //       >
  //         Limit
  //       </Button>
  //     </Container>
  //   </Accordion>
  // );
};

const useStyles = makeStyles(({ space }) => ({
  end: {
    alignSelf: 'flex-end',
  },
}));
