import { ListItem } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { useTransfer } from '~/hooks/useTransfer';
import { TransferIcon } from '~/util/theme/icons';
import { Suggestion } from './suggestions';

const Query = gql(/* GraphQL */ `
  fragment useTransferSuggestion_Query on Query
  @argumentDefinitions(account: { type: "UAddress!" }) {
    transfers(input: { accounts: [$account], direction: Out }) {
      id
    }
  }
`);

const Account = gql(/* GraphQL */ `
  fragment useTransferSuggestion_Account on Account {
    id
    address
  }
`);

export interface useTransferSuggestionParams {
  query: FragmentType<typeof Query>;
  account: FragmentType<typeof Account>;
}

export function useTransferSuggestion(params: useTransferSuggestionParams): Suggestion {
  const { transfers } = useFragment(Query, params.query);
  const account = useFragment(Account, params.account);
  const transfer = useTransfer();

  return {
    Item: (props) => (
      <ListItem
        leading={TransferIcon}
        headline="Transfer a token"
        onPress={() => transfer({ account: account.address })}
        {...props}
      />
    ),
    complete: transfers.length > 0,
  };
}
