import { AccountId } from '@api/account';
import { ReceiveIcon } from '@theme/icons';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useFaucet } from '@api/faucet';

export interface FaucetButtonProps {
  account: AccountId;
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
