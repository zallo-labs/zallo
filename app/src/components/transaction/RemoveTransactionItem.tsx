import { gql } from '@api';
import { useRouter } from 'expo-router';
import { UUID } from 'lib';
import { Menu } from 'react-native-paper';
import { useMutation } from 'urql';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { useSelectedAccount } from '~/hooks/useSelectedAccount';

const Remove = gql(/* GraphQL */ `
  mutation RemoveTransactionItem_Remove($proposal: UUID!) {
    removeTransaction(input: { id: $proposal })
  }
`);

export interface RemoveTransactionItemProps {
  proposal: UUID;
  close: () => void;
}

export function RemoveTransactionItem({ proposal, close }: RemoveTransactionItemProps) {
  const router = useRouter();
  const account = useSelectedAccount()!;
  const remove = useMutation(Remove)[1];
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this proposal?',
  });

  return (
    <Menu.Item
      title="Remove proposal"
      onPress={async () => {
        close();
        if (await confirmRemoval()) {
          await remove({ proposal });
          router.push({ pathname: '/(drawer)/[account]/(home)/activity', params: { account } });
        }
      }}
    />
  );
}
