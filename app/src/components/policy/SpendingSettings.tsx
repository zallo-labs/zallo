import { gql } from '@api';
import { AddIcon, GenericTokenIcon, TransferIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { asAddress, asChain, asUAddress } from 'lib';
import { memo, useMemo } from 'react';
import Collapsible from 'react-native-collapsible';
import { Divider, Switch } from 'react-native-paper';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { ListItemHorizontalTrailing } from '#/list/ListItemHorizontalTrailing';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { ListItemTrailingText } from '#/list/ListItemTrailingText';
import { TokenLimitItem } from '#/policy/TokenLimitItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { useToggle } from '~/hooks/useToggle';
import { usePolicyDraft } from '~/lib/policy/draft';
import { useLocalParams } from '~/hooks/useLocalParams';
import { PolicyScreenParams } from '~/app/(drawer)/[account]/policies/[id]';

const Query = gql(/* GraphQL */ `
  query SpendingSettings($input: TokensInput!) {
    tokens(input: $input) {
      id
      address
      ...TokenLimitItem_Token
    }
  }
`);

export interface SpendingSettingsProps {
  initiallyExpanded: boolean;
}

function SpendingSettings_(props: SpendingSettingsProps) {
  const router = useRouter();
  const params = useLocalParams(PolicyScreenParams);
  const selectAddress = useSelectAddress();

  const [policy, update] = usePolicyDraft();
  const [expanded, toggleExpanded] = useToggle(props.initiallyExpanded);

  const { transfers } = policy;
  const chain = asChain(policy.account);
  const tokenAddresses = Object.keys(transfers.limits).map((address) => asUAddress(address, chain));
  const query = useQuery(Query, { input: { address: tokenAddresses } }).data.tokens;

  const tokens = useMemo(
    () =>
      tokenAddresses.map((address) => ({
        address,
        token: query.find((t) => t.address === address),
      })),
    [tokenAddresses, query],
  );

  return (
    <>
      <ListItem
        leading={GenericTokenIcon}
        headline="Spending"
        trailing={(props) => (
          <ListItemHorizontalTrailing>
            <ListItemTrailingText>
              {tokens.length
                ? tokens.length + (transfers.defaultAllow ? '+' : '')
                : transfers.defaultAllow
                  ? 'Allowed'
                  : 'Not allowed'}
            </ListItemTrailingText>
            <Chevron {...props} expanded={expanded} />
          </ListItemHorizontalTrailing>
        )}
        onPress={toggleExpanded}
      />
      <Collapsible collapsed={!expanded}>
        <ListItem
          leading={TransferIcon}
          headline="Allow spending"
          trailing={() => (
            <Switch
              value={transfers.defaultAllow ?? false}
              onValueChange={(v) =>
                update((draft) => {
                  draft.transfers.defaultAllow = v;
                })
              }
            />
          )}
        />
        {tokens.map((t) => (
          <TokenLimitItem key={t.address} address={asAddress(t.address)} token={t.token} />
        ))}
        <ListItem
          leading={AddIcon}
          headline="Add token"
          onPress={async () => {
            const token = asUAddress(await selectAddress({ chain, include: ['tokens'] }), chain);
            if (token)
              router.push({
                pathname: `/(drawer)/[account]/policies/[id]/spending/[token]`,
                params: { ...params, token },
              });
          }}
        />
      </Collapsible>
      <Divider leftInset style={styles.divider} />
    </>
  );
}

const styles = createStyles({
  divider: {
    marginVertical: 8,
  },
});

export const SpendingSettings = withSuspense(
  memo(SpendingSettings_),
  <ListItemSkeleton leading supporting />,
);
