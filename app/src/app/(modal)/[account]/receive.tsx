import { gql } from '@api';
import { materialCommunityIcon } from '@theme/icons';
import { OperationContext, useMutation } from 'urql';
import { AccountParams } from '~/app/(nav)/[account]/_layout';
import { Button } from '#/Button';
import { QrModal } from '#/QrModal';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';

const Query = gql(/* GraphQL */ `
  query ReceiveModal($account: UAddress!) {
    requestableTokens(input: { account: $account })
  }
`);

const RequestTokens = gql(/* GraphQL */ `
  mutation ReceiveModal_RequestTokens($account: UAddress!) {
    requestTokens(input: { account: $account })
  }
`);

const FaucetIcon = materialCommunityIcon('water');
const queryContext: Partial<OperationContext> = { suspense: false };

const ReceiveModalParams = AccountParams;

export default function ReceiveModal() {
  const { account } = useLocalParams(ReceiveModalParams);
  const requestTokens = useMutation(RequestTokens)[1];

  const { requestableTokens = [] } =
    useQuery(Query, { account }, { context: queryContext }).data ?? {};

  return (
    <QrModal
      address={account}
      actions={
        <>
          {requestableTokens.length > 0 && (
            <Button
              mode="contained-tonal"
              icon={FaucetIcon}
              onPress={() => requestTokens({ account })}
            >
              Request testnet tokens
            </Button>
          )}
        </>
      }
    />
  );
}

export { ErrorBoundary } from '#/ErrorBoundary';
