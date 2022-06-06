import { TokenValue } from '@components/token/TokenValue';
import { useContractMethod } from '@gql/queries/useContractMethod';
import { BytesLike } from 'ethers';
import { Address } from 'lib';
import { useToken } from '~/token/useToken';

export const TRANSFER_METHOD_SIGHASH = '0xa9059cbb';

export interface TransferMethodValueProps {
  to: Address;
  data: BytesLike;
}

export const TransferMethodValue = ({ to, data }: TransferMethodValueProps) => {
  const token = useToken(to);
  const { sighash, methodFragment, methodInterface } = useContractMethod(
    to,
    data,
  );

  if (!token || sighash !== TRANSFER_METHOD_SIGHASH) return null;

  const [_to, value] = methodInterface.decodeFunctionData(methodFragment, data);

  return <TokenValue token={token} value={value} />;
};
