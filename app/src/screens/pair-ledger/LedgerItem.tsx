import { getAuthHeaders, useUrqlApiClient } from '@api/client';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useNavigation } from '@react-navigation/native';
import { BluetoothIcon } from '@theme/icons';
import { useCallback } from 'react';
import { OperationContext, useMutation } from 'urql';
import { LedgerBleDevice } from '~/components/ledger/useLedgerBleDevices';
import { ListItem } from '~/components/list/ListItem';
import { LEDGER_ADDRESS_EMITTER, getLedgerLazySignature } from '../ledger-sign/LedgerSignSheet';
import { APPROVER_BLUETOOTH_IDS, isMacAddress } from '~/components/ledger/useLedger';
import { showSuccess } from '~/provider/SnackbarProvider';
import { useImmerAtom } from 'jotai-immer';

const User = gql(/* GraphQL */ `
  fragment LedgerItem_user on User {
    id
  }
`);

const PairingQuery = gql(/* GraphQL */ `
  query LedgerItem_pair {
    user {
      id
      pairingToken
    }

    approver {
      id
      name
      bluetoothDevices
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation LedgerItem_update($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      id
      name
      bluetoothDevices
    }
  }
`);

export interface LedgerItemProps {
  user: FragmentType<typeof User>;
  device: LedgerBleDevice;
}

export function LedgerItem({ device: d, ...props }: LedgerItemProps) {
  const user = useFragment(User, props.user);
  const { navigate, goBack } = useNavigation();
  const api = useUrqlApiClient();
  const update = useMutation(Update)[1];
  const setApproverBluetoothIds = useImmerAtom(APPROVER_BLUETOOTH_IDS)[1];

  const connect = useCallback(async () => {
    navigate('LedgerSign', {
      device: d.descriptor.id,
      name: d.descriptor.name || d.deviceModel.productName || d.descriptor.id,
      content: undefined,
    });

    const address = await LEDGER_ADDRESS_EMITTER.getEvent();

    const headers = await getAuthHeaders({
      address,
      signMessage: async (message) => (await getLedgerLazySignature({ message })).signature,
    });

    goBack(); // Return to this screen once the signature has been complete

    const context: Partial<OperationContext> = {
      fetchOptions: { headers },
      skipAddAuthToOperation: true,
      suspense: false,
    };

    const { data } = await api.query(PairingQuery, {}, context);

    const pairingToken = data?.user.pairingToken;
    if (!pairingToken) return; // TODO: handle

    const mac = isMacAddress(d.descriptor.id) ? d.descriptor.id : null;

    update(
      {
        input: {
          address,
          name: !data.approver.name ? d.descriptor.name || d.deviceModel.productName : undefined,
          bluetoothDevices:
            mac && !data.approver.bluetoothDevices.includes(mac)
              ? [...data.approver.bluetoothDevices, mac]
              : undefined,
        },
      },
      context,
    );

    // Persist approver => deviceId association locally if OS doesn't provide device's MAC (iOS)
    if (!mac) {
      setApproverBluetoothIds((approverBluetoothIDs) => {
        const ids = approverBluetoothIDs[address] ?? [];
        approverBluetoothIDs[address] = ids.includes(d.descriptor.id)
          ? ids
          : [...ids, d.descriptor.id];
      });
    }

    // Check if already paired
    if (data.user.id === user.id) return showSuccess('Pairing successful');

    navigate('PairConfirmSheet', { token: pairingToken });
  }, [api, d, goBack, navigate, setApproverBluetoothIds, update, user.id]);

  return (
    <ListItem
      leading={BluetoothIcon}
      headline={d.descriptor.name || d.descriptor.id}
      supporting={d.deviceModel.productName}
      trailing={d.descriptor.id}
      lines={2}
      onPress={connect}
    />
  );
}
