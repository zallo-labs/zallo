import { getAuthHeaders, useUrqlApiClient } from '@api/client';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useNavigation } from '@react-navigation/native';
import { BluetoothIcon } from '@theme/icons';
import { useCallback } from 'react';
import { OperationContext, useMutation } from 'urql';
import { ListItem } from '~/components/list/ListItem';
import { LEDGER_ADDRESS_EMITTER, getLedgerLazySignature } from '../ledger-sign/LedgerSignSheet';
import { APPROVER_BLE_IDS } from '~/components/ledger/useLedger';
import { showSuccess } from '~/provider/SnackbarProvider';
import { useImmerAtom } from 'jotai-immer';
import { BleDevice, isMacAddress } from '~/components/ledger/SharedBleManager';
import { getLedgerDeviceModel } from '~/components/ledger/connectLedger';

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
  device: BleDevice;
}

export function LedgerItem({ device: d, ...props }: LedgerItemProps) {
  const user = useFragment(User, props.user);
  const { navigate, goBack } = useNavigation();
  const api = useUrqlApiClient();
  const update = useMutation(Update)[1];
  const setApproverBleIds = useImmerAtom(APPROVER_BLE_IDS)[1];

  const productName = getLedgerDeviceModel(d)?.productName;

  const connect = useCallback(async () => {
    const name = d.name || productName || d.id;
    navigate('LedgerSign', {
      device: d.id,
      name,
      content: undefined,
    });

    const address = await LEDGER_ADDRESS_EMITTER.getEvent();

    const headers = await getAuthHeaders({
      address,
      signMessage: async (message) => (await getLedgerLazySignature(message)).signature,
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

    const mac = isMacAddress(d.id) ? d.id : null;

    update(
      {
        input: {
          address,
          name: !data.approver?.name ? name : undefined,
          bluetoothDevices:
            mac && !data.approver?.bluetoothDevices?.includes(mac)
              ? [...(data.approver?.bluetoothDevices ?? []), mac]
              : undefined,
        },
      },
      context,
    );

    // Persist approver => deviceId association locally if OS doesn't provide device's MAC (iOS)
    if (!mac) {
      setApproverBleIds((approverBluetoothIDs) => {
        const ids = approverBluetoothIDs[address] ?? [];
        approverBluetoothIDs[address] = ids.includes(d.id) ? ids : [...ids, d.id];
      });
    }

    // Check if already paired
    if (data.user.id === user.id) return showSuccess('Pairing successful');

    navigate('PairConfirmSheet', { token: pairingToken });
  }, [api, d.id, d.name, goBack, navigate, productName, setApproverBleIds, update, user.id]);

  return (
    <ListItem
      leading={BluetoothIcon}
      headline={d.name || d.id}
      supporting={productName}
      trailing={d.id}
      lines={2}
      onPress={connect}
    />
  );
}
