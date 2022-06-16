import { useSafe } from '@features/safe/SafeProvider';
import { ChildrenProps } from '@util/children';
import { Address, hashTx, mapAsync, Op, toId } from 'lib';
import { DateTime } from 'luxon';
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ProposedTx, TxStatus, useTxs } from '~/queries/tx/useTxs';
import { ActivitySheet } from '../ActivitySheet';

const opsToProposedTx = async (
  safe: Address,
  ops: Op[],
): Promise<ProposedTx> => {
  const now = DateTime.now();
  const hash = await hashTx(safe, ...ops);

  return {
    id: toId(`${safe}-${hash}`),
    hash,
    ops: await mapAsync(ops, async (op) => ({
      ...op,
      hash: await hashTx(safe, op),
    })),
    approvals: [],
    userHasApproved: false,
    submissions: [],
    proposedAt: now,
    timestamp: now,
    status: TxStatus.PreProposal,
  };
};

type Propose = (...ops: Op[]) => Promise<void>;

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

  const [opsTx, setOpsTx] = useState<ProposedTx | undefined>();

  const value: Context = useMemo(
    () => ({
      propose: async (...ops) =>
        setOpsTx(await opsToProposedTx(safe.address, ops)),
    }),
    [safe.address],
  );

  const matchingTx = useMemo(
    () => opsTx && txs.find((t) => t.id === opsTx.id),
    [opsTx, txs],
  );

  const handleClose = useCallback(() => setOpsTx(undefined), [setOpsTx]);

  return (
    <context.Provider value={value}>
      {children}
      {opsTx && (
        <ActivitySheet activity={matchingTx ?? opsTx} onClose={handleClose} />
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
