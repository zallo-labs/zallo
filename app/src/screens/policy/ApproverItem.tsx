import { ICON_SIZE } from '@theme/paper';
import { Address } from 'lib';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { AddressLabel } from '~/components/address/AddressLabel';

export interface ApproverItemProps {
  approver: Address;
  remove: () => void;
}

export const ApproverItem = ({ approver, remove }: ApproverItemProps) => {
  return (
    <TouchableOpacity style={styles.container} onLongPress={remove}>
      <AddressIcon address={approver} size={ICON_SIZE.large} />

      <Text numberOfLines={2}>
        <AddressLabel address={approver} />
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 80,
    alignItems: 'center',
    gap: 8,
  },
});
