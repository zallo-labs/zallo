import { StyleProp, ViewStyle } from 'react-native';
import { Updater } from 'use-immer';
import { Box } from '~/components/layout/Box';
import { useAccountIds } from '@api/account';
import SessionAccountItem from './SessionAccountItem';

export interface SessionAccountsProps {
  selected: SessionAccountQuorum;
  setSelected: Updater<SessionAccountQuorum>;
  style?: StyleProp<ViewStyle>;
}

export const SessionAccounts = ({ selected, setSelected, style }: SessionAccountsProps) => {
  const accountIds = useAccountIds();

  return (
    <Box style={style}>
      {accountIds.map((account) => {
        return (
          <SessionAccountItem
            key={account}
            account={account}
            selected={selected[account]}
            onSelect={(q) =>
              setSelected((selected) => {
                if (!q || selected[account] === q) {
                  delete selected[account];
                } else {
                  selected[account] = q;
                }
              })
            }
          />
        );
      })}
    </Box>
  );
};
