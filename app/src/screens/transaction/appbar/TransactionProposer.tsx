import { Addr } from '~/components/addr/Addr';
import { Box } from '~/components/layout/Box';
import { ChevronRight } from '~/util/theme/icons';
import { Address, UserId } from 'lib';
import { useCallback } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { assert } from 'console';
import { useTxContext } from '../TransactionProvider';

export interface TransactionProposerProps {
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
}

export const TransactionProposer = ({
  textStyle,
  iconColor,
}: TransactionProposerProps) => {
  const navigation = useRootNavigation();
  const { proposal, proposer } = useTxContext();

  const setProposer = (user: UserId) => {
    // TODO: useSetProposer()
  };

  const canSelect = proposal.status === 'proposed';
  const selectNewProposer = useCallback(() => {
    assert(canSelect);

    navigation.navigate('Account', {
      id: proposer.account,
      title: 'Select executing wallet',
      inactiveOpacity: true,
      onSelectUser: (user) => {
        setProposer(user);
        navigation.goBack();
      },
    });
  }, [canSelect, navigation, proposer.account]);

  // Select another wallet from the same account if it's inactive
  // A timeout is required as navigation fails if it occurs too quickly upon mount - https://github.com/react-navigation/react-navigation/issues/9182
  // useFocusEffect(
  //   useCallback(() => {
  //     if (canSelect) {
  //       const timer = setTimeout(() => {
  //         if (wallet && wallet.state.status !== 'active' && accountIsDeployed)
  //           selectWallet(wallet.accountAddr);
  //       });

  //       return () => clearTimeout(timer);
  //     }
  //   }, [accountIsDeployed, canSelect, selectWallet, wallet]),
  // );

  return (
    <Box
      horizontal
      justifyContent="space-between"
      alignItems="center"
      mx={3}
      mb={2}
    >
      <Box vertical justifyContent="space-around">
        <Text variant="titleMedium" style={textStyle}>
          {proposer.name}
        </Text>
        <Text variant="bodySmall" style={textStyle}>
          <Addr addr={proposer.account} />
        </Text>
      </Box>

      <Box>
        {canSelect && (
          <IconButton
            icon={ChevronRight}
            iconColor={iconColor}
            onPress={selectNewProposer}
          />
        )}
      </Box>
    </Box>
  );
};
