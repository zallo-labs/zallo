import { useSafe } from '@features/safe/SafeProvider';
import { ChildrenProps } from '@util/children';
import { callsToTxReq } from '@util/multicall';
import { Address, hashTx, toId, CallDef } from 'lib';
import { DateTime } from 'luxon';
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ProposedTx, TxStatus } from '~/queries/tx';
import { useTxs } from '~/queries/tx/useTxs';
import { ActivitySheet } from '../tx/ActivitySheet';

const txReqToProposedTx = async (
  safe: Address,
  callDefs: CallDef[],
): Promise<ProposedTx> => {
  const txReq = await callsToTxReq(callDefs);
  const hash = await hashTx(safe, txReq);
  const now = DateTime.now();

  return {
    id: toId(`${safe}-${hash}`),
    hash,
    ...txReq,
    approvals: [],
    userHasApproved: false,
    submissions: [],
    proposedAt: now,
    timestamp: now,
    status: TxStatus.PreProposal,
  };
};

type Propose = (...callDefs: CallDef[]) => Promise<void>;

interface Context {
  propose: Propose;
}

const context = createContext<Context>({
  propose: () => {
    throw new Error(`${ProposeProvider.name} is not initialized}`);
  },
});

export interface ActivityProviderProps extends ChildrenProps {}

export const ProposeProvider = ({ children }: ActivityProviderProps) => {
  const { safe } = useSafe();
  const { txs } = useTxs();

  const [tx, setTx] = useState<ProposedTx | undefined>();

  const value: Context = useMemo(
    () => ({
      propose: async (...callDefs) => {
        setTx(await txReqToProposedTx(safe.address, callDefs));
      },
    }),
    [safe.address],
  );

  const matchingTx = useMemo(
    () => tx && txs.find((t) => t.id === tx.id),
    [tx, txs],
  );

  const handleClose = useCallback(() => setTx(undefined), [setTx]);

  return (
    <context.Provider value={value}>
      {children}
      {tx && (
        <ActivitySheet activity={matchingTx ?? tx} onClose={handleClose} />
      )}
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
