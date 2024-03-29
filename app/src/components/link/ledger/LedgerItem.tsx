import { authContext, useUrqlApiClient } from '@api/client';
import { FragmentType, gql, useFragment } from '@api/generated';
import { BluetoothIcon } from '@theme/icons';
import { useCallback } from 'react';
import { useMutation } from 'urql';
import { ListItem } from '#/list/ListItem';
import { useGetLedgerApprover } from '~/app/(sheet)/ledger/approve';
import { APPROVER_BLE_IDS } from '~/hooks/ledger/useLedger';
import { showError, showInfo } from '#/provider/SnackbarProvider';
import { useImmerAtom } from 'jotai-immer';
import { getLedgerDeviceModel } from '~/hooks/ledger/connectLedger';
import { elipseTruncate } from '~/util/format';
import { useRouter } from 'expo-router';
import { BleDevice, isUniqueBleDeviceId } from '~/lib/ble/util';
import { LinkWithTokenSheetParams } from '~/app/(sheet)/link/token';
import { tryOrIgnoreAsync } from 'lib';
import { ampli } from '~/lib/ampli';

const User = gql(/* GraphQL */ `
  fragment LedgerItem_user on User {
    id
  }
`);

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

export interface LedgerItemProps {
  user: FragmentType<typeof User>;
  device: BleDevice;
}

export function LedgerItem({ device: d, ...props }: LedgerItemProps) {
  const user = useFragment(User, props.user);
  const router = useRouter();
  const api = useUrqlApiClient();
  const update = useMutation(Update)[1];
  const setApproverBleIds = useImmerAtom(APPROVER_BLE_IDS)[1];
  const getSign = useGetLedgerApprover();

  const productName = getLedgerDeviceModel(d)?.productName;

  const connect = useCallback(async () => {
    const name = d.name || productName || d.id;

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

    // Check if already link
    if (data.user.id === user.id) return showInfo('Already linked');

    const params: LinkWithTokenSheetParams = { token: linkingToken };
    router.push({ pathname: `/link/token`, params });

    ampli.ledgerLinked({ productName });
  }, [d.name, d.id, productName, getSign, api, update, user.id, router, setApproverBleIds]);

  return (
    <ListItem
      leading={BluetoothIcon}
      headline={d.name || d.id}
      supporting={productName}
      trailing={elipseTruncate(d.id, 9)}
      lines={2}
      onPress={connect}
    />
  );
}
