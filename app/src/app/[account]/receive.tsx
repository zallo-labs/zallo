import { SearchParams, useLocalSearchParams } from 'expo-router';
import { asAddress } from 'lib';
import { QrModal } from '~/components/QrModal';

export type ReceiveModalRoute = `/[account]/receive`;
export type ReceiveModalParams = SearchParams<ReceiveModalRoute>;

export default function ReceiveModal() {
  const account = asAddress(useLocalSearchParams<ReceiveModalParams>().account);

  return <QrModal address={account} faucet />;
}
