import { gql } from '@api';
import { AddIcon, GenericTokenIcon, OutboundIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { asAddress, asChain, asUAddress } from 'lib';
import { useMemo } from 'react';
import { Switch } from 'react-native-paper';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { ListItemHorizontalTrailing } from '#/list/ListItemHorizontalTrailing';
import { ListItemSkeleton } from '#/list/ListItemSkeleton';
import { ListItemTrailingText } from '#/list/ListItemTrailingText';
import { TokenLimitItem } from '#/policy/TokenLimitItem';
import { withSuspense } from '#/skeleton/withSuspense';
import { useQuery } from '~/gql';
import { useToggle } from '~/hooks/useToggle';
import { usePolicyDraft } from '~/lib/policy/draft';
import { CollapsibleItemList } from '#/layout/CollapsibleItemList';
import { DEFAULT_LIMIT } from './TokenSpending';
import { useSelectToken } from '~/hooks/useSelectToken';

const Query = gql(/* GraphQL */ `
  query SpendingSettings($input: TokensInput!) {
    tokens(input: $input) {
      id
      address
      ...TokenLimitItem_Token
    }
  }
`);

function SpendingSettings_() {
  const { styles } = useStyles(stylesheet);
  const selectToken = useSelectToken();

  const [policy, update] = usePolicyDraft();
  const [expanded, toggleExpanded] = useToggle(false);

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
    <CollapsibleItemList expanded={expanded}>
      <ListItem
        leading={GenericTokenIcon}
        headline="Spending"
        supporting="Tokens that can be spent"
        trailing={
          <ListItemHorizontalTrailing>
            <ListItemTrailingText>
              {tokens.length
                ? tokens.length + (transfers.defaultAllow ? '+' : '')
                : transfers.defaultAllow
                  ? 'Allowed'
                  : 'Not allowed'}
            </ListItemTrailingText>
            <Chevron expanded={expanded} />
          </ListItemHorizontalTrailing>
        }
        onPress={toggleExpanded}
        containerStyle={styles.item}
      />

      <ListItem
        leading={OutboundIcon}
        headline="Allow other spending"
        supporting="Applies to tokens without limits"
        trailing={
          <Switch
            value={transfers.defaultAllow ?? false}
            onValueChange={(v) =>
              update((draft) => {
                draft.transfers.defaultAllow = v;
              })
            }
          />
        }
        containerStyle={styles.item}
      />

      {tokens.map((t) => (
        <TokenLimitItem key={t.address} address={asAddress(t.address)} token={t.token} />
      ))}

      <ListItem
        lines={2}
        leading={AddIcon}
        headline="Add token"
        containerStyle={styles.item}
        onPress={async () => {
          const token = await selectToken({ account: policy.account, disabled: tokenAddresses });
          if (token)
            update(({ transfers }) => {
              transfers.limits[asAddress(token)] ??= DEFAULT_LIMIT;
            });
        }}
      />
    </CollapsibleItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
}));

export const SpendingSettings = withSuspense(
  SpendingSettings_,
  <ListItemSkeleton leading supporting />,
);
