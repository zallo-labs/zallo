import { BluetoothIcon } from '@theme/icons';
import { useCallback } from 'react';
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
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { signAuthHeaders } from '~/api/auth-manager';
import { useFragment } from 'react-relay';
import { LedgerItem_user$key } from '~/api/__generated__/LedgerItem_user.graphql';
import { LedgerItem_linkMutation } from '~/api/__generated__/LedgerItem_linkMutation.graphql';
import { LedgerItem_updateMutation } from '~/api/__generated__/LedgerItem_updateMutation.graphql';

const LEDGER_LINKED = new Subject<Address>();
export function useLinkLedger() {
  const getEvent = useGetEvent();

  if (Platform.OS === 'web') return null;

  return () => getEvent({ pathname: `/(nav)/ledger/link` }, LEDGER_LINKED);
}

const User = graphql`
  fragment LedgerItem_user on User {
    id
    linkingToken
  }
`;

const Link = graphql`
  mutation LedgerItem_linkMutation($token: String!) {
    link(input: { token: $token }) {
      id
      approvers {
        id
        address
        details {
          id
          bluetoothDevices
        }
      }
    }
  }
`;

const Update = graphql`
  mutation LedgerItem_updateMutation($details: UpdateApproverInput!) {
    updateApprover(input: $details) {
      id
      label
      details {
        id
        bluetoothDevices
      }
    }
  }
`;

export interface LedgerItemProps {
  device: BleDevice;
  user: LedgerItem_user$key;
}

export function LedgerItem({ device: d, ...props }: LedgerItemProps) {
  const user = useFragment(User, props.user);
  const link = useMutation<LedgerItem_linkMutation>(Link);
  const updateDetails = useMutation<LedgerItem_updateMutation>(Update);
  const setApproverBleIds = useImmerAtom(APPROVER_BLE_IDS)[1];
  const getSign = useGetLedgerApprover();
  const model = getLedgerDeviceModel(d)?.productName || 'Unknown model';

  const connect = useCallback(async () => {
    const name = d.name || model || d.id;

    const { address, signMessage } = await getSign({ device: d.id, name });

    const authHeaders = await tryOrIgnoreAsync(() =>
      signAuthHeaders({
        address,
        signMessage: async ({ message }) => {
          const signature = await signMessage({ message });
          if (!signature) throw new Error('Cancelled');
          return signature;
        },
      }),
    );
    if (!authHeaders)
      return showError('Connection request cancelled', {
        action: { label: 'Try again', onPress: connect },
      });

    // 1. Link
    const { approvers } = (await link({ token: user.linkingToken }, { headers: authHeaders })).link;
    const approver = approvers.find((a) => a.address === address)?.details;

    // 2. Update ledger details
    const uniqueId = isUniqueBleDeviceId(d.id) ? d.id : null;
    if (!uniqueId) {
      // Persist approver => deviceId association locally if OS doesn't provide device's MAC (iOS)
      setApproverBleIds((approverBluetoothIDs) => {
        const ids = approverBluetoothIDs[address] ?? [];
        approverBluetoothIDs[address] = ids.includes(d.id) ? ids : [...ids, d.id];
      });
    }

    updateDetails({
      details: {
        address,
        name,
        bluetoothDevices:
          uniqueId && !approver?.bluetoothDevices?.includes(uniqueId)
            ? [...(approver?.bluetoothDevices ?? []), uniqueId]
            : undefined,
      },
    });

    LEDGER_LINKED.next(address);
    ampli.ledgerLinked({ model });
  }, [d.name, d.id, model, getSign, link, user.linkingToken, updateDetails, setApproverBleIds]);

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
