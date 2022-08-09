import { Box, BoxProps } from '@components/Box';
import { space } from '@util/theme/styledComponents';
import { useMemo, useState } from 'react';
import { Button, Dialog, useTheme } from 'react-native-paper';
import { useWallets } from '~/queries/wallets/useWallets';
import { useAccount, useAccountsContext } from '../AccountProvider';
import { AccountItem } from './AccountItem';
import { SelectedAccountItem } from './SelectedAccountItem';

const itemPadding: Partial<BoxProps> = {
  px: 2,
  py: 2,
  mx: 2,
  my: 1,
};

export interface AccountSelectorDialogProps {
  visible: boolean;
  hide: () => void;
}

export const AccountSelectorDialog = ({
  visible,
  hide,
}: AccountSelectorDialogProps) => {
  const { colors, iconSize } = useTheme();
  const { select, createAccount } = useAccountsContext();
  const { accounts: allAccounts } = useWallets();
  const account = useAccount();

  const [creatingAccount, setCreatingAccount] = useState(false);

  const otherAccounts = useMemo(
    () =>
      allAccounts.filter(
        (s) => s.contract.address !== account.contract.address,
      ),
    [allAccounts, account],
  );

  return (
    <Dialog
      visible={visible}
      onDismiss={hide}
      style={{
        position: 'absolute',
        top: 20,
        width: '100%',
        backgroundColor: undefined,
        marginHorizontal: 0,
      }}
    >
      <Box surface rounded mx={1} py={2}>
        <SelectedAccountItem account={account} {...itemPadding} />

        {otherAccounts.map((account) => (
          <AccountItem
            key={account.contract.address}
            account={account}
            onPress={() => {
              select(account.contract.address);
              hide();
            }}
            {...itemPadding}
          />
        ))}

        <Button
          mode="text"
          labelStyle={{ color: colors.accent }}
          onPress={() => {
            setCreatingAccount(true);
            createAccount();
            // Component unmounts, no need to hide dialog
          }}
          disabled={creatingAccount}
          style={{
            flex: 1,
          }}
          contentStyle={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingHorizontal: space(3),
            paddingVertical: space(2),
          }}
        >
          <Box width={iconSize.medium} ml={1} />
          {creatingAccount ? 'Creating account...' : 'Create'}
        </Button>
      </Box>
    </Dialog>
  );
};
