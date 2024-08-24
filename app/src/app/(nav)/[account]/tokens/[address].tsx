import { Link, useRouter } from 'expo-router';
import { asAddress, asChain, tryOrIgnore } from 'lib';
import { useForm } from 'react-hook-form';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { Menu } from 'react-native-paper';
import { Appbar } from '#/Appbar/Appbar';
import { withSuspense } from '#/skeleton/withSuspense';
import { z } from 'zod';
import { zHex, zNonEmptyStr, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListItem } from '#/list/ListItem';
import { CHAINS } from 'chains';
import { createStyles, useStyles } from '@theme/styles';
import { Button } from '#/Button';
import { ExternalLinkIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { useUpsertToken } from '~/hooks/mutations/useUpsertToken';
import { Address_TokenScreenQuery } from '~/api/__generated__/Address_TokenScreenQuery.graphql';
import { useRemoveToken } from '~/hooks/mutations/useRemoveToken';
import { Scrollable } from '#/Scrollable';
import { Pane } from '#/layout/Pane';
import { ItemList } from '#/layout/ItemList';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';
import { View } from 'react-native';

const PYTH_PRICE_FEEDS_URL = 'https://pyth.network/developers/price-feed-ids';

const Query = graphql`
  query Address_TokenScreenQuery($token: UAddress!, $chain: Chain!) {
    token(address: $token) {
      id
      address
      userOwned
      name
      symbol
      icon
      pythUsdPriceId
      ...useRemoveToken_token
    }

    metadata: tokenMetadata(address: $token) {
      id
      name
      symbol
      icon
      pythUsdPriceId
    }

    ...useUpsertToken_query @arguments(chain: $chain)
    ...useRemoveToken_query @arguments(chain: $chain)
  }
`;

const scheme = z.object({
  name: zNonEmptyStr(),
  symbol: zNonEmptyStr(),
  icon: z.union([z.string().trim().url().optional(), z.null()]),
  priceId: zHex(32).optional(),
});

const TokenScreenParams = z.object({ address: zUAddress() });

function TokenScreen_() {
  const { address: token } = useLocalParams(TokenScreenParams);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const chain = asChain(token);

  const query = useLazyQuery<Address_TokenScreenQuery>(Query, { token, chain });
  const upsert = useUpsertToken({ query });
  const remove = useRemoveToken({ query });

  const t = query.token ?? query.metadata;
  const { control, handleSubmit, watch, reset } = useForm<z.infer<typeof scheme>>({
    resolver: zodResolver(scheme),
    defaultValues: {
      name: t?.name,
      symbol: t?.symbol,
      icon: t?.icon,
      priceId: t?.pythUsdPriceId ?? undefined,
    },
  });
  const priceId = watch('priceId');

  return (
    <Pane flex>
      <Appbar
        headline="Token"
        {...(query.token?.userOwned && {
          trailing: (props) => (
            <AppbarMore iconProps={props}>
              {({ handle }) => (
                <Menu.Item
                  title="Remove"
                  onPress={handle(async () => {
                    const removed = await remove(query.token!);
                    if (removed) router.back();
                  })}
                />
              )}
            </AppbarMore>
          ),
        })}
      />

      <Scrollable>
        <View style={styles.container}>
          <ItemList>
            <ListItem
              variant="surface"
              leading={<AddressIcon address={token} size={ICON_SIZE.medium} />}
              overline={CHAINS[chain].name}
              headline={asAddress(token)}
              trailing={CHAINS[chain].name}
            />
          </ItemList>

          <FormTextField label="Name" name="name" placeholder="Token name" control={control} />

          <FormTextField label="Symbol" name="symbol" placeholder="TKN" control={control} />

          <FormTextField label="Icon" name="icon" wrap control={control} />

          <FormTextField
            label="Pyth USD Price ID"
            name="priceId"
            wrap
            placeholder="0x..."
            control={control}
          />
        </View>

        <Actions horizontal style={styles.actions}>
          <FormSubmitButton
            mode="contained"
            control={control}
            requireChanges={!!query.token}
            onPress={handleSubmit(async (input) => {
              const { name, symbol, icon, priceId } = input;
              await upsert({
                address: token,
                name,
                symbol,
                icon,
                pythUsdPriceId: priceId,
              });
              reset(input);
            })}
          >
            {query.token ? 'Update' : 'Add'}
          </FormSubmitButton>

          {!priceId && (
            <Link asChild href={PYTH_PRICE_FEEDS_URL}>
              <Button mode="outlined" icon={ExternalLinkIcon}>
                Pyth price feeds
              </Button>
            </Link>
          )}
        </Actions>
      </Scrollable>
    </Pane>
  );
}

const stylesheet = createStyles(() => ({
  container: {
    gap: 8,
  },
  actions: {
    paddingHorizontal: 0,
  },
}));

export default withSuspense(TokenScreen_, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
