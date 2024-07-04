import { Link, useRouter } from 'expo-router';
import { Image } from '#/Image';
import { asAddress, asChain, tryOrIgnore } from 'lib';
import { useForm } from 'react-hook-form';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { AppbarMore } from '#/Appbar/AppbarMore';
import { Menu } from 'react-native-paper';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { AppbarOptions } from '#/Appbar/AppbarOptions';
import { withSuspense } from '#/skeleton/withSuspense';
import { ScreenSkeleton } from '#/skeleton/ScreenSkeleton';
import { ScrollableScreenSurface } from '#/layout/ScrollableScreenSurface';
import { z } from 'zod';
import { zHex, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zodResolver } from '@hookform/resolvers/zod';
import { ListItem } from '#/list/ListItem';
import { CHAINS } from 'chains';
import { View } from 'react-native';
import { createStyles } from '@theme/styles';
import { Button } from '#/Button';
import { ExternalLinkIcon, GenericTokenIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useLazyLoadQuery } from 'react-relay';
import { TokenScreenQuery } from '~/api/__generated__/TokenScreenQuery.graphql';

const PYTH_PRICE_FEEDS_URL = 'https://pyth.network/developers/price-feed-ids';

const Query = graphql`
  query TokenScreenQuery($token: UAddress!) {
    token(address: $token) {
      id
      address
      userOwned
      name
      symbol
      icon
      pythUsdPriceId
    }

    metadata: tokenMetadata(address: $token) {
      id
      name
      symbol
      icon
      pythUsdPriceId
    }
  }
`;

const UpsertToken = graphql`
  mutation TokenScreen_upsertMutation($input: UpsertTokenInput!) {
    upsertToken(input: $input) {
      id
      name
      symbol
      icon
      pythUsdPriceId
    }
  }
`;

const RemoveToken = graphql`
  mutation TokenScreen_removeMutation($token: UAddress!) {
    removeToken(address: $token)
  }
`;

const scheme = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1),
  icon: z.union([z.string().trim().url().optional(), z.null()]),
  priceId: zHex(32).optional(),
});

const TokenScreenParams = z.object({ token: zUAddress() });

function TokenScreen_() {
  const { token } = useLocalParams(TokenScreenParams);
  const router = useRouter();
  const upsert = useMutation(UpsertToken);
  const remove = useMutation(RemoveToken);
  const confirmRemoval = useConfirmRemoval({
    message: 'Are you sure you want to remove this token?',
  });

  const query = useLazyLoadQuery<TokenScreenQuery>(Query, { token });

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
  const [name, symbol, icon, priceId] = watch(['name', 'symbol', 'icon', 'priceId']);
  const iconValid = !!tryOrIgnore(() => icon && new URL(icon));

  return (
    <>
      <AppbarOptions
        headline="Token"
        {...(query?.token?.userOwned && {
          trailing: (props) => (
            <AppbarMore iconProps={props}>
              {({ handle }) => (
                <Menu.Item
                  title="Remove"
                  onPress={handle(async () => {
                    if (await confirmRemoval()) {
                      await remove({ token: query.token!.address });
                      router.back();
                    }
                  })}
                />
              )}
            </AppbarMore>
          ),
        })}
      />

      <ScrollableScreenSurface contentContainerStyle={styles.sheet}>
        <ListItem
          leading={
            icon && iconValid ? (
              <Image source={[{ uri: icon }]} style={styles.icon} />
            ) : (
              GenericTokenIcon
            )
          }
          headline={`${name || 'Token'} (${symbol || 'TKN'})`}
          supporting={asAddress(token)}
          trailing={CHAINS[asChain(token)].name}
        />
        <View style={styles.fields}>
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

          {!priceId && (
            <Link asChild href={PYTH_PRICE_FEEDS_URL}>
              <Button mode="outlined" icon={ExternalLinkIcon}>
                Pyth price feeds
              </Button>
            </Link>
          )}
        </View>

        <Actions>
          <FormSubmitButton
            mode="contained"
            control={control}
            requireChanges={!!query.token}
            onPress={handleSubmit(async (input) => {
              const { name, symbol, icon, priceId } = input;
              await upsert({
                input: {
                  address: token,
                  name,
                  symbol,
                  icon,
                  pythUsdPriceId: priceId,
                },
              });
              reset(input);
            })}
          >
            {query.token ? 'Update' : 'Add'}
          </FormSubmitButton>
        </Actions>
      </ScrollableScreenSurface>
    </>
  );
}

const styles = createStyles({
  sheet: {
    paddingTop: 8,
  },
  fields: {
    marginVertical: 16,
    marginHorizontal: 16,
    gap: 8,
  },
  icon: {
    width: ICON_SIZE.medium,
    height: ICON_SIZE.medium,
  },
});

export default withSuspense(TokenScreen_, <ScreenSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
