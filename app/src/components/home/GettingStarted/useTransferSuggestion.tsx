import { FragmentType, gql, useFragment } from '@api';
import { Suggestion } from './suggestions';
import { ListItem } from '#/list/ListItem';
import { TransferIcon } from '@theme/icons';
import { useTransfer } from '~/hooks/useTransfer';

const Account = gql(/* GraphQL */ `
  fragment useTransferSuggestion_Account on Account {
    id
    address
    transfers(input: { direction: Out }) {
      id
    }
  }
`);

export interface useTransferSuggestionParams {
  account: FragmentType<typeof Account> | null | undefined;
}

export function useTransferSuggestion(params: useTransferSuggestionParams): Suggestion | null {
  const account = useFragment(Account, params.account);
  const transfer = useTransfer();

  if (!account) return null;

  return {
    Item: (props) => (
      <ListItem
        leading={TransferIcon}
        headline="Transfer a token"
        onPress={() => transfer({ account: account.address })}
        {...props}
      />
    ),
    complete: account.transfers.length > 0,
  };
}
