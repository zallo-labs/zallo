import { ReceiveIcon } from '@theme/icons';
import { Address } from 'lib';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useFaucet } from '~/mutations/useFacuet.api';

export interface FaucetButtonProps {
  account: Address;
}

export const FaucetButton = ({ account }: FaucetButtonProps) => {
  const faucet = useFaucet(account);

  if (!faucet) return null;

  return (
    <Button mode="outlined" icon={ReceiveIcon} style={styles.button} onPress={faucet}>
      Testnet funds
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    flexShrink: 1,
  },
});
