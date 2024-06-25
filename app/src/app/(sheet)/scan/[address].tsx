import { useRouter } from 'expo-router';
import { Sheet } from '#/sheet/Sheet';
import { ContactsIcon, NavigateNextIcon, OutboundIcon } from '@theme/icons';
import { ListItem } from '#/list/ListItem';
import { z } from 'zod';
import { zAddress, zUAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { asUAddress } from 'lib';
import { useSelectedChain } from '~/hooks/useSelectedAccount';

const ScannedAddressSheetParams = z.object({
  address: zAddress(),
  account: zUAddress().optional(),
});

export default function ScannedAddressSheet() {
  const { address, account } = useLocalParams(ScannedAddressSheetParams);
  const router = useRouter();
  const chain = useSelectedChain();

  return (
    <Sheet handle={false}>
      {account && (
        <ListItem
          leading={OutboundIcon}
          headline="Send"
          trailing={NavigateNextIcon}
          onPress={() =>
            router.replace({
              pathname: `/(nav)/[account]/send`,
              params: { account, to: address },
            })
          }
        />
      )}

      <ListItem
        leading={ContactsIcon}
        headline="Add as contact"
        trailing={NavigateNextIcon}
        onPress={() =>
          router.replace({
            pathname: `/(nav)/contacts/[address]`,
            params: { address: asUAddress(address, chain) },
          })
        }
      />
    </Sheet>
  );
}

export { ErrorBoundary } from '#/ErrorBoundary';
