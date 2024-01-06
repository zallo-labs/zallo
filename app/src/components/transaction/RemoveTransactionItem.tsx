import { useRouter } from 'expo-router';
import { Menu } from 'react-native-paper';
import { useMutation } from 'urql';

import { UUID } from 'lib';
import { gql } from '~/gql/api';
import { useConfirmRemoval } from '~/hooks/useConfirm';

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
          router.back();
        }
      }}
    />
  );
}
