import { gql } from '@apollo/client';
import { useDevice } from '@network/useDevice';
import { BigNumber } from 'ethers';
import { address, toId, toTxSalt } from 'lib';
import { DateTime } from 'luxon';
import { useMemo } from 'react';
import {
  ProposalDocument,
  ProposalQuery,
  ProposalQueryVariables,
} from '~/gql/generated.api';
import { useApiClient } from '~/gql/GqlProvider';
import { usePollWhenFocussed } from '~/gql/usePollWhenFocussed';
import { useSuspenseQuery } from '~/gql/useSuspenseQuery';
import { Approval, Proposal, Submission, ProposalStatus, ProposalId } from '.';
import { useUser } from '../user/useUser.api';

gql`
  query Proposal($hash: Bytes32!) {
    proposal(hash: $hash) {
      id
      accountId
      proposerId
      hash
      to
      value
      data
      salt
      createdAt
      approvals {
        deviceId
        signature
        createdAt
      }
      submissions {
        id
        hash
        nonce
        gasLimit
        gasPrice
        createdAt
        response {
          response
          reverted
          timestamp
        }
      }
    }
  }
`;

const getStatus = (submissions: Submission[]): ProposalStatus => {
  if (!submissions.length) return 'proposed';
  if (submissions.some((s) => s.status === 'success')) return 'executed';
  if (submissions.some((s) => s.status === 'failure')) return 'failed';
  return 'submitted';
};

export const useProposal = ({ hash }: ProposalId, focussed = false) => {
  const device = useDevice();

  const { data, ...rest } = useSuspenseQuery<
    ProposalQuery,
    ProposalQueryVariables
  >(ProposalDocument, {
    client: useApiClient(),
    variables: { hash },
  });
  usePollWhenFocussed(rest, focussed ? 3 : 15);

  const p = data.proposal;

  const account = address(p.accountId);
  const [proposer] = useUser({
    account,
    addr: address(p.proposerId),
  });

  const proposal = useMemo((): Proposal => {
    const approvals: Approval[] =
      p.approvals?.map((a) => ({
        addr: address(a.deviceId),
        signature: a.signature,
        timestamp: DateTime.fromISO(a.createdAt),
      })) ?? [];

    const submissions =
      p.submissions?.map(
        (s): Submission => ({
          hash: s.hash,
          nonce: s.nonce,
          status: !s.response
            ? 'pending'
            : s.response.reverted
            ? 'failure'
            : 'success',
          timestamp: DateTime.fromISO(s.createdAt),
          gasLimit: BigNumber.from(s.gasLimit),
          gasPrice: s.gasPrice ? BigNumber.from(s.gasPrice) : undefined,
          response: s.response
            ? {
                response: s.response.response,
                reverted: s.response.reverted,
                timestamp: DateTime.fromISO(s.response.timestamp),
              }
            : undefined,
        }),
      ) ?? [];

    return {
      account,
      proposer,
      // TODO: allow user to select config
      config: (proposer.configs.active ?? proposer.configs.proposed!)[0],
      hash,
      id: toId(p.id),
      timestamp: DateTime.fromISO(p.createdAt),
      to: address(p.to),
      value: BigNumber.from(p.value),
      data: p.data,
      salt: toTxSalt(p.salt),
      approvals,
      userHasApproved: approvals.some(
        (a) => a.addr === address(device.address),
      ),
      submissions,
      proposedAt: DateTime.fromISO(p.createdAt),
      status: getStatus(submissions),
    };
  }, [p, account, proposer, hash, device.address]);

  return [proposal, rest] as const;
};
