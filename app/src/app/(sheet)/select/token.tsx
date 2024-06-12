import { PressableOpacity } from '#/PressableOpacity';
import { ListHeader } from '#/list/ListHeader';
import { ListItemHeight } from '#/list/ListItem';
import { Sheet } from '#/sheet/Sheet';
import { withSuspense } from '#/skeleton/withSuspense';
import { gql } from '@api';
import { FlashList } from '@shopify/flash-list';
import { NavigateNextIcon } from '@theme/icons';
import { CORNER, ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { UAddress, asChain } from 'lib';
import { Divider, Text } from 'react-native-paper';
import { P, match } from 'ts-pattern';
import { z } from 'zod';
import { useQuery } from '~/gql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zArray, zUAddress } from '~/lib/zod';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TokenItem } from '#/token/TokenItem';
import { TokenIcon } from '#/token/TokenIcon';
import { useRecentTokens, useSetSelectedToken } from '~/hooks/useSelectToken';
import { useRouter } from 'expo-router';
import { useRef } from 'react';

const Query = gql(/* GraphQL */ `
  query SelectTokenSheet($account: UAddress!, $chain: Chain!, $feeToken: Boolean) {
    tokens(input: { chain: $chain, feeToken: $feeToken }) {
      __typename
      id
      address
      symbol
      balance(input: { account: $account })
      ...TokenIcon_Token
      ...TokenItem_Token
    }
  }
`);

export const SelectTokenSheetParams = z.object({
  account: zUAddress(),
  enabled: zArray(zUAddress()).optional(),
  disabled: zArray(zUAddress()).optional(),
  feeToken: z.coerce.boolean().optional(),
});
export type SelectTokenSheetParams = z.infer<typeof SelectTokenSheetParams>;

function SelectTokenSheet() {
  const { account, feeToken, ...params } = useLocalParams(SelectTokenSheetParams);
  const { styles } = useStyles(stylesheet);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const chain = asChain(account);
  const setSelected = useSetSelectedToken(chain);

  const { tokens } = useQuery(Query, { account, chain, feeToken }).data;

  const isDisabled = (t: UAddress) =>
    (params.disabled && params.disabled.includes(t)) ||
    (params.enabled && !params.enabled.includes(t));

  const recentTokens = useRecentTokens(chain)
    .map((t) => !isDisabled(t) && tokens.find((t2) => t2.address === t))
    .filter(Boolean);

  const goBack = useRef(true);
  const select = (token: UAddress) => {
    goBack.current = false;
    setSelected(token);
  };

  return (
    <Sheet contentContainer={false} onClose={() => goBack.current && router.back()}>
      <FlashList
        ListHeaderComponent={
          <>
            <FlashList
              data={recentTokens}
              renderItem={({ item: t }) => (
                <PressableOpacity
                  style={styles.recent}
                  disabled={isDisabled(t.address)}
                  onPress={() => select(t.address)}
                >
                  <TokenIcon token={t} size={ICON_SIZE.medium} />
                  <Text variant="labelLarge">{t.symbol}</Text>
                </PressableOpacity>
              )}
              horizontal
              keyExtractor={(t) => t.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentsContainer}
            />

            <Divider horizontalInset style={styles.divider} />
          </>
        }
        renderItem={({ item }) =>
          match(item)
            .with(P.string, (v) => <ListHeader>{v}</ListHeader>)
            .with({ __typename: 'Token' }, (t) => (
              <TokenItem
                token={t}
                amount={t.balance}
                trailing={NavigateNextIcon}
                disabled={isDisabled(t.address)}
                onPress={() => select(t.address)}
              />
            ))
            .exhaustive()
        }
        data={['Tokens', ...tokens]}
        /// @ts-expect-error "children is optional in props"
        renderScrollComponent={BottomSheetScrollView}
        keyExtractor={(v) => (typeof v === 'object' ? v.id : v)}
        getItemType={(item) => (typeof item === 'object' ? item.__typename : 'header')}
        estimatedItemSize={ListItemHeight.DOUBLE_LINE}
        contentContainerStyle={styles.container(insets)}
      />
    </Sheet>
  );
}

const stylesheet = createStyles(() => ({
  container: (insets: EdgeInsets) => ({
    paddingBottom: insets.bottom,
  }),
  headline: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  recentsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  recent: {
    alignItems: 'center',
    gap: 8,
    width: 80,
    paddingVertical: 8,
    borderRadius: CORNER.m,
  },
  divider: {
    marginVertical: 8,
  },
}));

export default withSuspense(SelectTokenSheet, null);

export { ErrorBoundary } from '#/ErrorBoundary';
