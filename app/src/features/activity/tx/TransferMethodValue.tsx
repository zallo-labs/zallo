import { TokenValue } from '@components/token/TokenValue';
import { BytesLike } from 'ethers';
import { Address } from 'lib';
import { useMaybeToken } from '~/token/useToken';
import { useDecodedTransfer } from './useDecodedTransfer';

export interface TransferMethodValueProps {
  to: Address;
  data: BytesLike;
}

export const TransferMethodValue = ({ to, data }: TransferMethodValueProps) => {
  const token = useMaybeToken(to);
  const decoded = useDecodedTransfer(to, data);

  if (!token || !decoded) return null;

  return <TokenValue token={token} value={decoded.value} />;
};
