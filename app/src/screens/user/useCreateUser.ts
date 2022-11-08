import { Address } from 'lib';
import { useCallback } from 'react';
import { Proposable } from '~/gql/proposable';
import { useUpsertUser } from '~/mutations/user/upsert/useUpsertUser';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { useAccount } from '~/queries/account/useAccount.api';
import { CombinedUser } from '~/queries/user/useUser.api';

export const useCreateUser = (accountAddr: Address) => {
  const navigation = useRootNavigation();
  const [account] = useAccount(accountAddr);
  const [upsertUser] = useUpsertUser(accountAddr);

  return useCallback(() => {
    navigation.navigate('Contacts', {
      title: `Create ${account.name} User`,
      disabled: [accountAddr, ...account.users.map((user) => user.addr)],
      onSelect: (contact) => {
        const user: CombinedUser = {
          account: accountAddr,
          addr: contact.addr,
          name: contact.name,
          isActive: false,
          configs: new Proposable({
            proposed: [
              {
                id: NaN,
                approvers: [],
                spendingAllowlisted: false,
                limits: {},
              },
            ],
          }),
        };

        upsertUser(user, () => {
          navigation.push('User', { user });
        });
      },
    });
  }, [navigation, account.name, account.users, accountAddr, upsertUser]);
};
