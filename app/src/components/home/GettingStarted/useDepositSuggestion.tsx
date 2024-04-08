import { FragmentType, gql, useFragment } from '@api';
import { QrCodeIcon } from '@theme/icons';
import { Suggestion } from '#/home/GettingStarted/suggestions';
import { ListItem } from '#/list/ListItem';

const Account = gql(/* GraphQL */ `
  fragment useDepositSuggestion_Account on Account {
    incomingTransfers: transfers(input: { direction: In }) {
      id
    }
  }
`);

export interface UseDepositSuggestionParams {
  account: FragmentType<typeof Account> | null | undefined;
}

export function useDepositSuggestion(params: UseDepositSuggestionParams): Suggestion | null {
  const incomingTransfers = useFragment(Account, params.account)?.incomingTransfers;

  return {
    Item: (props) => <ListItem leading={QrCodeIcon} headline="Deposit tokens" {...props} />,
    complete: !!incomingTransfers?.length,
  };
}
