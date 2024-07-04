import { materialCommunityIcon } from '@theme/icons';
import { AccountParams } from '~/app/(nav)/[account]/_layout';
import { Button } from '#/Button';
import { QrModal } from '#/QrModal';
import { useLocalParams } from '~/hooks/useLocalParams';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useLazyLoadQuery } from 'react-relay';
import { receive_ReceiveModalQuery } from '~/api/__generated__/receive_ReceiveModalQuery.graphql';

const Query = graphql`
  query receive_ReceiveModalQuery($account: UAddress!) {
    requestableTokens(input: { account: $account })
  }
`;

const RequestTokens = graphql`
  mutation receive_ReceiveModalMutation($account: UAddress!) {
    requestTokens(input: { account: $account })
  }
`;

const FaucetIcon = materialCommunityIcon('water');

const ReceiveModalParams = AccountParams;

export default function ReceiveModal() {
  const { account } = useLocalParams(ReceiveModalParams);
  const requestTokens = useMutation(RequestTokens);

  const { requestableTokens } = useLazyLoadQuery<receive_ReceiveModalQuery>(Query, {
    account,
  });

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
