import { Call } from 'lib';
import { useContractMethod } from '~/queries/useContractMethod.api';

export interface CallMethodProps {
  call: Call;
}

export const CallMethod = ({ call }: CallMethodProps) => {
  const { methodName } = useContractMethod(call.to, call.data);

  return <>{methodName}</>;
};
