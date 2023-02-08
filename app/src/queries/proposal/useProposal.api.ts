import { gql } from '@apollo/client';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { Address, address, toQuorumKey, toTxSalt } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { ProposalDocument, ProposalQuery, ProposalQueryVariables } from '~/gql/generated.api';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { Approval, Proposal, Submission, ProposalState, ProposalId, Rejection } from '.';
import { useQuorum } from '../quroum/useQuorum.api';
import { useProposalSubscription } from './useProposalSubscription.api';

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

  fragment ProposalFields on Proposal {
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

  query Proposal($id: Bytes32!) {
    proposal(id: $id) {
      ...ProposalFields
    }
  }
`;

const getStatus = (submissions: Submission[]): ProposalState => {
  if (!submissions.length) return 'pending';
  if (submissions.some((s) => s.status === 'success')) return 'executed';
  if (submissions.some((s) => s.status === 'pending')) return 'executing';
  if (submissions.some((s) => s.status === 'failure')) return 'failed';
  assert(false); // Unreachable
};

export const useProposal = <Id extends ProposalId | undefined>(id: Id) => {
  const skip = !id;
  const { data } = useSuspenseQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, {
    variables: id,
    skip,
  });
  useProposalSubscription({ proposals: id, skip });

  const p = data.proposal;
  if (id) assert(p);

  const quorum = useQuorum(
    p ? { account: address(p.accountId), key: toQuorumKey(p.quorumKey) } : undefined,
  );

  const proposal = useMemo((): Proposal | undefined => {
    if (!id || !p || !quorum) return undefined;

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
      [...quorum.activeOrLatest.approvers].filter((a) => !approvals.has(a) && !rejected.has(a)),
    );

    return {
      id: id.id,
      account: address(p.accountId),
      quorum,
      timestamp: DateTime.fromISO(p.createdAt),
      to: address(p.to),
      value: p.value ? BigNumber.from(p.value) : undefined,
      data: p.data || undefined,
      salt: toTxSalt(p.salt),
      approvals,
      rejected,
      awaitingApproval: awaitingApprovalFrom,
      isApproved: approvals.size === quorum.activeOrLatest.approvers.size,
      submissions: transactions,
      proposedAt: DateTime.fromISO(p.createdAt),
      proposer: address(p.proposerId),
      state: getStatus(transactions),
    };
  }, [p, quorum, id]);

  return proposal as Id extends undefined ? Proposal | undefined : Proposal;
};
