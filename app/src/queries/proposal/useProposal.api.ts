import { gql } from '@apollo/client';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { Address, address, toQuorumKey, toTxSalt } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { ProposalDocument, ProposalQuery, ProposalQueryVariables } from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { Approval, Proposal, Submission, ProposalState, ProposalId, Rejection } from '.';
import { useQuorum } from '../useQuorum.api';

gql`
  fragment TransactionFields on Transaction {
    id
    hash
    nonce
    gasLimit
    gasPrice
    createdAt
    response {
      success
      response
      timestamp
    }
  }

  query Proposal($id: Bytes32!) {
    proposal(id: $id) {
      id
      accountId
      quorumKey
      proposerId
      to
      value
      data
      salt
      createdAt
      approvals {
        userId
        signature
        createdAt
      }
      transactions {
        ...TransactionFields
      }
    }
  }
`;

const getStatus = (submissions: Submission[]): ProposalState => {
  if (!submissions.length) return 'pending';
  if (submissions.some((s) => s.status === 'success')) return 'executed';
  if (submissions.some((s) => s.status === 'pending')) return 'executing';
  if (submissions.some((s) => s.status === 'failure')) return 'failed';
  return 'pending'; // Unreachable
};

export const useProposal = ({ id }: ProposalId, focussed = false) => {
  const { data, ...rest } = useSuspenseQuery<ProposalQuery, ProposalQueryVariables>(
    ProposalDocument,
    {
      client: useApiClient(),
      variables: { id },
    },
  );
  usePollWhenFocussed(rest, focussed ? 3 : 15);

  const p = data.proposal;
  assert(p);

  const account = address(p.accountId);
  const quorum = useQuorum({ account, key: toQuorumKey(p.quorumKey) });

  const proposal = useMemo((): Proposal => {
    const approvals = new Map<Address, Approval>(
      p.approvals
        ?.filter((a) => a.signature)
        .map((a) => ({
          addr: address(a.userId),
          signature: a.signature!,
          timestamp: DateTime.fromISO(a.createdAt),
        }))
        .map((a) => [a.addr, a] as const),
    );

    const transactions =
      p?.transactions?.map(
        (s): Submission => ({
          hash: s.hash,
          nonce: s.nonce,
          status: !s.response ? 'pending' : s.response.success ? 'success' : 'failure',
          timestamp: DateTime.fromISO(s.createdAt),
          gasLimit: BigNumber.from(s.gasLimit),
          gasPrice: s.gasPrice ? BigNumber.from(s.gasPrice) : undefined,
          response: s.response
            ? {
                response: s.response.response,
                reverted: !s.response.success,
                timestamp: DateTime.fromISO(s.response.timestamp),
              }
            : undefined,
        }),
      ) ?? [];

    const rejected = new Map(
      p.approvals
        ?.filter((a) => !a.signature)
        .map((a): [Address, Rejection] => [
          address(a.userId),
          {
            addr: address(a.userId),
            timestamp: DateTime.fromISO(a.createdAt),
          },
        ]),
    );

    const awaitingApprovalFrom = new Set(
      [...(quorum.activeOrLatest?.approvers ?? []).values()].filter(
        (a) => !approvals.has(a) && !rejected.has(a),
      ),
    );

    return {
      id,
      account,
      quorum,
      timestamp: DateTime.fromISO(p.createdAt),
      to: address(p.to),
      value: BigNumber.from(p.value),
      data: p.data || undefined,
      salt: toTxSalt(p.salt),
      approvals,
      rejected,
      awaitingApproval: awaitingApprovalFrom,
      isApproved: awaitingApprovalFrom.size === 0,
      submissions: transactions,
      proposedAt: DateTime.fromISO(p.createdAt),
      state: getStatus(transactions),
    };
  }, [p, quorum, id, account]);

  return [proposal, rest] as const;
};
