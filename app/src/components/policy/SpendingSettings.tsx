import { gql } from '@api';
import { AddIcon, GenericTokenIcon, TransferIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { Address, asAddress, asChain, asUAddress } from 'lib';
import { useMemo } from 'react';
import Collapsible from 'react-native-collapsible';
import { Divider, Switch } from 'react-native-paper';
import { Chevron } from '~/components/Chevron';
import { ListItem } from '~/components/list/ListItem';
import { ListItemHorizontalTrailing } from '~/components/list/ListItemHorizontalTrailing';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';
import { ListItemTrailingText } from '~/components/list/ListItemTrailingText';
import { TokenLimitItem } from '~/components/policy/TokenLimitItem';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { useSelectAddress } from '~/hooks/useSelectAddress';
import { useToggle } from '~/hooks/useToggle';
import { usePolicyDraftState } from '~/lib/policy/draft';

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
  const selectAddress = useSelectAddress();

  const [policy, update] = usePolicyDraftState();
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
            const token = asUAddress(await selectAddress({ include: ['tokens'] }), chain);
            if (token)
              router.push({
                pathname: `/(drawer)/[account]/policies/[key]/spending/[token]`,
                params: { account: policy.account, key: policy.key ?? 'add', token },
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
  SpendingSettings_,
  <ListItemSkeleton leading supporting />,
);
