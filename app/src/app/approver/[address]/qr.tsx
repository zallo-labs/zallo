import { SearchParams, useLocalSearchParams } from 'expo-router';
import { asAddress } from 'lib';
import { QrModal } from '~/components/QrModal';

export type ApproverQrModalRoute = `/approver/[address]/qr`;
export type ApproverQrModalParams = SearchParams<ApproverQrModalRoute>;

export function ApproverQrModal() {
  const params = useLocalSearchParams<ApproverQrModalParams>();

  return <QrModal address={asAddress(params.address)} />;
}
