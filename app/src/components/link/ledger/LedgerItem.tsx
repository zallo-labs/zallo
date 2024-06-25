import { authContext, useUrqlApiClient } from '@api/client';
import { gql } from '@api/generated';
import { BluetoothIcon } from '@theme/icons';
import { useCallback } from 'react';
import { useMutation } from 'urql';
import { ListItem } from '#/list/ListItem';
import { useGetLedgerApprover } from '~/app/(sheet)/ledger/approve';
import { APPROVER_BLE_IDS } from '~/hooks/ledger/useLedger';
import { showError } from '#/provider/SnackbarProvider';
import { useImmerAtom } from 'jotai-immer';
import { getLedgerDeviceModel } from '~/hooks/ledger/connectLedger';
import { elipseTruncate } from '~/util/format';
import { BleDevice, isUniqueBleDeviceId } from '~/lib/ble/util';
import { Address, tryOrIgnoreAsync } from 'lib';
import { ampli } from '~/lib/ampli';
import { Subject } from 'rxjs';
import { useGetEvent } from '~/hooks/useGetEvent';
import { Platform } from 'react-native';

const LEDGER_LINKED = new Subject<Address>();
export function useLinkLedger() {
  const getEvent = useGetEvent();

  if (Platform.OS === 'web') return null;

  return () => getEvent({ pathname: `/(nav)/ledger/link` }, LEDGER_LINKED);
}

const Query = gql(/* GraphQL */ `
  query LedgerItem {
    user {
      id
      linkingToken
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

const Link = gql(/* GraphQL */ `
  mutation LedgerItem_Link($token: String!) {
    link(input: { token: $token }) {
      id
    }
  }
`);

export interface LedgerItemProps {
  device: BleDevice;
}

export function LedgerItem({ device: d }: LedgerItemProps) {
  const api = useUrqlApiClient();
  const update = useMutation(Update)[1];
  const link = useMutation(Link)[1];
  const setApproverBleIds = useImmerAtom(APPROVER_BLE_IDS)[1];
  const getSign = useGetLedgerApprover();
  const model = getLedgerDeviceModel(d)?.productName || 'Unknown model';

  const connect = useCallback(async () => {
    const name = d.name || model || d.id;

    const { address, signMessage } = await getSign({ device: d.id, name });

    const context = await tryOrIgnoreAsync(() =>
      authContext({
        address,
        signMessage: async ({ message }) => {
          const signature = await signMessage({ message });
          if (!signature) throw new Error('Cancelled');
          return signature;
        },
      }),
    );
    if (!context)
      return showError('Connection request cancelled', {
        action: { label: 'Try again', onPress: connect },
      });

    const { data } = await api.query(Query, {}, context);

    const linkingToken = data?.user.linkingToken;
    if (!linkingToken) return showError('Failed to get linking token, please try again');

    const uniqueId = isUniqueBleDeviceId(d.id) ? d.id : null;

    update(
      {
        input: {
          address,
          name: !data.approver?.name ? name : undefined,
          bluetoothDevices:
            uniqueId && !data.approver?.bluetoothDevices?.includes(uniqueId)
              ? [...(data.approver?.bluetoothDevices ?? []), uniqueId]
              : undefined,
        },
      },
      context,
    );

    // Persist approver => deviceId association locally if OS doesn't provide device's MAC (iOS)
    if (!uniqueId) {
      setApproverBleIds((approverBluetoothIDs) => {
        const ids = approverBluetoothIDs[address] ?? [];
        approverBluetoothIDs[address] = ids.includes(d.id) ? ids : [...ids, d.id];
      });
    }

    await link({ token: linkingToken });
    LEDGER_LINKED.next(address);

    ampli.ledgerLinked({ model });
  }, [d.name, d.id, model, getSign, api, update, link, setApproverBleIds]);

  return (
    <ListItem
      leading={BluetoothIcon}
      headline={d.name || d.id}
      supporting={model}
      trailing={elipseTruncate(d.id, 9)}
      onPress={connect}
    />
  );
}
