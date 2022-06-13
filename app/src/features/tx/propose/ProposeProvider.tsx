import { ChildrenProps } from '@util/children';
import { Op } from 'lib';
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ActivitySheet } from '../ActivitySheet';
import { createOpsActivity, OpsActivity } from './opsActivity';

type Propose = (...ops: Op[]) => void;

interface Context {
  propose: Propose;
}

const context = createContext<Context>({
  propose: () => {
    throw new Error('Uninitialized');
  },
});

export interface ActivityProviderProps extends ChildrenProps {}

export const ProposeProvider = ({ children }: ActivityProviderProps) => {
  const [ops, setOps] = useState<OpsActivity | undefined>();

  const handleClose = useCallback(() => setOps(undefined), [setOps]);

  const value: Context = useMemo(
    () => ({
      propose: (...ops) => setOps(createOpsActivity(ops)),
    }),
    [setOps],
  );

  return (
    <context.Provider value={value}>
      {children}
      {ops && <ActivitySheet activity={ops} onClose={handleClose} />}
    </context.Provider>
  );
};

export const usePropose = () => useContext(context).propose;

export const withProposeProvider =
  <T,>(Component: FC<T>) =>
  (props: T) =>
    (
      <ProposeProvider>
        <Component {...props} />
      </ProposeProvider>
    );
