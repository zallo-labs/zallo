import produce from 'immer';
import { Quorum, QuorumGuid } from 'lib';
import { ReactNode, useEffect, useMemo } from 'react';
import { atom, useRecoilState } from 'recoil';
import { Suspend } from '~/components/Suspender';
import { CombinedQuorum, Proposable } from '~/queries/quroum';
import { useQuorum } from '~/queries/quroum/useQuorum.api';

export interface QuorumDraft {
  quorum: CombinedQuorum;
  initState: Proposable<Quorum>;
  state: Quorum;
}

const QUORUM_DRAFT = atom<QuorumDraft>({
  key: 'QuorumDraft',
  default: {} as QuorumDraft,
});

export const useQuorumDraft = () => {
  const [draft, updateDraft] = useRecoilState(QUORUM_DRAFT);

  return useMemo(
    () => ({
      ...draft,
      updateDraft,
      updateState: (valOrUpdater: ((currVal: Quorum) => void) | Quorum) =>
        updateDraft(
          produce((draft) => {
            typeof valOrUpdater === 'function'
              ? valOrUpdater(draft.state)
              : (draft.state = valOrUpdater);
          }),
        ),
    }),
    [draft, updateDraft],
  );
};

export interface QuorumDraftProviderProps {
  children?: ReactNode;
  quorum: QuorumGuid;
  initState?: Proposable<Quorum>;
}

export const QuorumDraftProvider = ({ children, ...props }: QuorumDraftProviderProps) => {
  const quorum = useQuorum(props.quorum);
  const proposedState = props.initState ?? quorum.activeOrLatest;

  const [draft, updateDraft] = useRecoilState(QUORUM_DRAFT);

  useEffect(() => {
    updateDraft({
      quorum,
      initState: proposedState,
      state: proposedState,
    });
  }, [proposedState, quorum, updateDraft]);

  if (!draft?.state) return <Suspend />;

  return <>{children}</>;
};
