import { withSuspense } from '#/skeleton/withSuspense';
import { zUuid } from '~/lib/zod';
import { AccountParams } from '../../../_layout';
import { useLocalParams } from '~/hooks/useLocalParams';
import { Pane } from '#/layout/Pane';
import { graphql } from 'relay-runtime';
import { useLazyQuery } from '~/api';
import { Id_TransferScreenQuery } from '~/api/__generated__/Id_TransferScreenQuery.graphql';
import { Scrollable } from '#/Scrollable';
import { TokenIcon } from '#/token/TokenIcon';
import { OverlayIcon } from '#/layout/OverlayIcon';
import { ContactsOutlineIcon, ReceiveIcon, ShareIcon, WebIcon } from '@theme/icons';
import { View } from 'react-native';
import { ICON_SIZE } from '@theme/paper';
import { Text } from 'react-native-paper';
import { createStyles, useStyles } from '@theme/styles';
import { Timestamp } from '#/format/Timestamp';
import { Appbar } from '#/Appbar/Appbar';
import { TokenAmount } from '#/token/TokenAmount';
import { FiatValue } from '#/FiatValue';
import { ItemList } from '#/layout/ItemList';
import { ListItem } from '#/list/ListItem';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { Chip } from '#/Chip';
import { SelectableAddress } from '#/address/SelectableAddress';
import { asChain, asUAddress } from 'lib';
import { Link, useRouter } from 'expo-router';
import Decimal from 'decimal.js';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { share } from '~/lib/share';
import { CHAINS } from 'chains';
import { PaneSkeleton } from '#/skeleton/PaneSkeleton';

const Query = graphql`
  query Id_TransferScreenQuery($id: ID!, $account: UAddress!) {
    transfer(id: $id) @required(action: THROW) {
      id
      tokenAddress
      timestamp
      from
      amount
      value
      systxHash
      token {
        ...TokenIcon_token
        ...TokenAmount_token
        balance(input: { account: $account })
        price {
          id
          usd
        }
      }
      account {
        id
        address
      }
    }
  }
`;

const TransferScreenParams = AccountParams.extend({ id: zUuid() });

function TransferScreen() {
  const { id, account } = useLocalParams(TransferScreenParams);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();

  const { transfer: t } = useLazyQuery<Id_TransferScreenQuery>(Query, { id, account });
  const chain = asChain(t.tokenAddress);
  const from = asUAddress(t.from, chain);

  const blockExplorer = CHAINS[chain].blockExplorers?.default;
  const explorerUrl = blockExplorer && `${blockExplorer.url}tx/${t.systxHash}` as const;

  return (
    <Pane flex>
      <Scrollable>
        <Appbar mode="small" />
        <View style={styles.centered}>
          <View style={styles.icon}>
            <TokenIcon token={t.token} size={ICON_SIZE.extraLarge} />
            <OverlayIcon icon={ReceiveIcon} parentSize={ICON_SIZE.extraLarge} />
          </View>

          <Text variant="titleLarge" style={styles.received}>
            Received <Timestamp timestamp={t.timestamp} />
          </Text>

          <Text variant="headlineMedium">
            {/* TODO: generic token resolution */}
            {t.token && <TokenAmount token={t.token} amount={t.amount} />}

            <Text style={styles.value}>
              {' ('}
              <FiatValue value={t.amount} />
              {')'}
            </Text>
          </Text>
        </View>

        <ItemList>
          <ListItem
            leading={<AddressIcon address={from} />}
            overline="From"
            headline={<SelectableAddress address={from} />}
            trailing={
              <Chip
                mode="outlined"
                icon={(props) => (
                  <ContactsOutlineIcon {...props} color={styles.contactChip.color} />
                )}
                onPress={() =>
                  router.push({ pathname: `/(nav)/contacts/[address]`, params: { address: from } })
                }
              >
                Contact
              </Chip>
            }
            containerStyle={styles.item}
          />

          <ListItem
            leading={<AddressIcon address={t.account.address} />}
            overline="Account"
            headline={<SelectableAddress address={t.account.address} />}
            containerStyle={styles.item}
            trailing={({ Text }) =>
              t.token && (
                <View style={styles.balanceContainer}>
                  <Text>
                    <TokenAmount token={t.token} amount={t.token.balance} />
                  </Text>

                  {t.token.price && (
                    <Text>
                      <FiatValue value={new Decimal(t.token.balance).mul(t.token.price.usd)} />
                    </Text>
                  )}
                </View>
              )
            }
          />
        </ItemList>

        {explorerUrl && (
          <Actions horizontal style={styles.actions}>
            <Link href={explorerUrl} asChild>
              <Button mode="contained-tonal" icon={WebIcon}>
                Explorer
              </Button>
            </Link>

            <Button
              mode="contained-tonal"
              icon={ShareIcon}
              onPress={() => share({ url: explorerUrl })}
            >
              Share
            </Button>
          </Actions>
        )}
      </Scrollable>
    </Pane>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  centered: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginBottom: 16,
  },
  received: {
    color: colors.onSurfaceVariant,
  },
  value: {
    color: colors.tertiary,
  },
  item: {
    backgroundColor: colors.surface,
  },
  balanceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  contactChip: {
    color: colors.onSurface,
  },
  actions: {
    marginVertical: 8,
  },
}));

export default withSuspense(TransferScreen, <PaneSkeleton />);

export { ErrorBoundary } from '#/ErrorBoundary';
