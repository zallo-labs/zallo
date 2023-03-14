import { StyleProp, ViewStyle } from 'react-native';
import { Updater } from 'use-immer';
import { Box } from '~/components/layout/Box';
import { AccountId, useAccountIds } from '@api/account';
import SessionAccountItem from './SessionAccountItem';

export interface SessionAccountsProps {
  selected: Set<AccountId>;
  setSelected: Updater<Set<AccountId>>;
  style?: StyleProp<ViewStyle>;
}

export const SessionAccounts = ({ selected, setSelected, style }: SessionAccountsProps) => {
  const accountIds = useAccountIds();

  return (
    <Box style={style}>
      {accountIds.map((account) => (
        <SessionAccountItem
          key={account}
          account={account}
          selected={selected.has(account)}
          onSelect={() =>
            setSelected((selected) => {
              selected.has(account) ? selected.delete(account) : selected.add(account);
            })
          }
        />
      ))}
    </Box>
  );
};
