import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { asAddress, tryAsAddress } from 'lib';
import { Sheet } from '~/components/sheet/Sheet';
import { ContactsIcon, NavigateNextIcon, SendIcon } from '@theme/icons';
import { ListItem } from '~/components/list/ListItem';
import { StyleSheet } from 'react-native';

export type ScannedAddressSheetRoute = `/scan/[address]`;
export type ScanAddressSheetParams = SearchParams<ScannedAddressSheetRoute> & {
  account?: string;
};

export default function ScannedAddressSheet() {
  const params = useLocalSearchParams<ScanAddressSheetParams>();
  const [account, address] = [tryAsAddress(params?.account), asAddress(params.address)];
  const router = useRouter();

  return (
    <Sheet handle={false} contentContainerStyle={styles.contentContainer}>
      {account && (
        <ListItem
          leading={SendIcon}
          headline="Send"
          trailing={NavigateNextIcon}
          onPress={() =>
            router.replace({ pathname: `/[account]/transfer`, params: { account, to: address } })
          }
        />
      )}

      <ListItem
        leading={ContactsIcon}
        headline="Add as contact"
        trailing={NavigateNextIcon}
        onPress={() => router.replace({ pathname: `/contacts/[address]`, params: { address } })}
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 16,
  },
});
