import { Suggestion } from '~/components/home/GettingStarted/suggestions';
import { ListItem } from '~/components/list/ListItem';
import { FragmentType, gql, useFragment } from '~/gql/api';
import { QrCodeIcon } from '~/util/theme/icons';

const Query = gql(/* GraphQL */ `
  fragment useDepositSuggestion_Query on Query
  @argumentDefinitions(account: { type: "UAddress!" }) {
    incomingTransfers: transfers(input: { accounts: [$account], direction: In }) {
      id
    }
  }
`);

export interface UseDepositSuggestionParams {
  query: FragmentType<typeof Query>;
}

export function useDepositSuggestion(params: UseDepositSuggestionParams): Suggestion {
  const { incomingTransfers } = useFragment(Query, params.query);

  return {
    Item: (props) => <ListItem leading={QrCodeIcon} headline="Deposit tokens" {...props} />,
    complete: incomingTransfers.length > 0,
  };
}
