import { FunctionOutlineIcon } from '@theme/icons';
import { Address, isAddress } from 'lib';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { AddressOrLabelIcon } from '~/components/Identicon/AddressOrLabelIcon';
import { AddressLabel } from '~/components/address/AddressLabel';

export interface InteractionsAppbarProps {
  contract: Address | '*';
}

export const InteractionsAppbar = ({ contract }: InteractionsAppbarProps) => {
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
