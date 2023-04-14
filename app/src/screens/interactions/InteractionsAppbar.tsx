import { FunctionOutlineIcon } from '@theme/icons';
import { Address, isAddress } from 'lib';
import { StyleSheet, View } from 'react-native';
import { Menu, Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AppbarMore2 } from '~/components/Appbar/AppbarMore';
import { AddressOrLabelIcon } from '~/components/Identicon/AddressOrLabelIcon';
import { AddressLabel } from '~/components/address/AddressLabel';
import { useConfirmRemoval } from '../alert/useConfirm';
import { useImmerAtom } from 'jotai-immer';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { useNavigation } from '@react-navigation/native';

export interface InteractionsAppbarProps {
  contract: Address | '*';
}

export const InteractionsAppbar = ({ contract }: InteractionsAppbarProps) => {
  const { goBack } = useNavigation();
  const confirmRemove = useConfirmRemoval({
    message: 'Are you sure you want to remove interactions permissons with this contract?',
  });

  const [, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);

  return (
    <Appbar
      mode="large"
      leading="back"
      headline={(props) => (
        <View style={styles.appbarHeadlineContainer}>
          {isAddress(contract) ? (
            <>
              <AddressOrLabelIcon label={contract} />
              <Text {...props}>
                <AddressLabel address={contract} />
              </Text>
            </>
          ) : (
            <>
              <FunctionOutlineIcon />
              <Text {...props}>Contracts not listed</Text>
            </>
          )}
        </View>
      )}
      trailing={(props) =>
        contract !== '*' ? (
          <AppbarMore2>
            {({ close }) => (
              <Menu.Item
                title="Remove"
                onPress={() => {
                  close();
                  confirmRemove({
                    onConfirm: () => {
                      updateDraft(({ permissions: { targets } }) => {
                        delete targets[contract];
                      });
                      goBack();
                    },
                  });
                }}
                {...props}
              />
            )}
          </AppbarMore2>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  appbarHeadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});
