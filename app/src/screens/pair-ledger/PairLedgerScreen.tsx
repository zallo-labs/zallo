import { LedgerLogo } from '@theme/icons';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { Appbar } from '~/components/Appbar/Appbar';
import { Screen } from '~/components/layout/Screen';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { ListHeader } from '~/components/list/ListHeader';
import { Actions } from '~/components/layout/Actions';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { match } from 'ts-pattern';
import { useQuery } from '~/gql';
import { useBleDevices } from '~/components/ledger/useBleDevices';
import { LedgerItem } from './LedgerItem';

const Query = gql(/* GraphQL */ `
  query PairLedgerScreen {
    user {
      ...LedgerItem_user
    }
  }
`);

export type PairLedgerScreenProps = StackNavigatorScreenProps<'PairLedger'>;

export function PairLedgerScreen(_props: PairLedgerScreenProps) {
  const devices = useBleDevices();

  const { user } = useQuery(Query).data;

  return (
    <Screen>
      <Appbar mode="small" headline="Pair" />

      <View style={styles.headerContainer}>
        <LedgerLogo width={undefined} height={64} />

        <Text variant="titleLarge" style={styles.headerText}>
          Unlock your Ledger, enable bluetooth, and open the Ethereum app
        </Text>
      </View>

      {devices.isOk() ? (
        <FlatList
          data={devices.value}
          ListHeaderComponent={
            <ListHeader trailing={() => <ActivityIndicator size={16} />}>
              Available devices
            </ListHeader>
          }
          renderItem={({ item }) => <LedgerItem user={user} device={item} />}
          extraData={[user]}
          contentContainerStyle={styles.listContainer}
          keyExtractor={(d) => d.id}
        />
      ) : (
        match(devices.error)
          .with({ type: 'permissions-required' }, ({ requestPermissions }) => (
            <>
              <Text variant="titleMedium" style={styles.errorText}>
                Please grant bluetooth related permissions in order to scan and connect
              </Text>

              <Actions>
                <Button mode="contained" onPress={requestPermissions}>
                  Grant
                </Button>
              </Actions>
            </>
          ))
          .exhaustive()
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginHorizontal: 16,
    marginVertical: 32,
    gap: 32,
  },
  headerText: {
    textAlign: 'center',
  },
  listContainer: {
    marginVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    margin: 16,
  },
});
