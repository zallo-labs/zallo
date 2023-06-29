import React from 'react';
import { withBrowser } from '@site/src/components/withBrowser';
import gql from 'graphql-tag';
import Explorer from '@site/src/components/Explorer';
// import {
//   ProposeMutationVariables,
//   ApproveMutationVariables,
//   ProposalQueryVariables,
//   ProposalsQueryVariables,
//   ProposalChangesSubscriptionVariables,
// } from '@site/src/api.generated';
import { useAccount } from '@site/src/api/useAccount';
import { useDevice } from '@site/src/hooks/useDevice';
import { useProposal } from '@site/src/api/useProposal';
import { Suspend } from '@site/src/components/Suspender';
import { signDigest } from 'lib';

export const ProposeExample = withBrowser(() => {
  // const device = useDevice().address;
  // const account = useAccount();

  // if (!account) return <Suspend />;

  // return (
  //   <Explorer
  //     document={gql`
  //       mutation Propose($input: ProposeInput!) {
  //         propose(input: $input) {
  //           id
  //           hash
  //           operations {
  //             to
  //             value
  //             data
  //           }
  //         }
  //       }
  //     `}
  //     variables={
  //       {
  //         input: {
  //           account,
  //           operations: [
  //             {
  //               to: device,
  //               value: 3000000,
  //             },
  //           ],
  //         },
  //       } as ProposeMutationVariables
  //     }
  //   />
  // );
  return null;
});

export const ApproveExample = withBrowser(() => {
  // const proposal = useProposal();
  // const device = useDevice();
  // if (!proposal) return <Suspend />;

  // return (
  //   <Explorer
  //     document={gql`
  //       mutation Approve($input: ApproveInput!) {
  //         approve(input: $input) {
  //           id
  //           hash
  //           operations {
  //             to
  //             value
  //             data
  //           }
  //         }
  //       }
  //     `}
  //     variables={
  //       {
  //         input: {
  //           hash: proposal,
  //           signature: signDigest(proposal, device),
  //         },
  //       } as ApproveMutationVariables
  //     }
  //   />
  // );
  return null;
});

export const SubscribeExample = withBrowser(() => {
  // const proposal = useProposal();
  // if (!proposal) return <Suspend />;

  // return (
  //   <Explorer
  //     document={gql`
  //       subscription ProposalChanges {
  //         proposal {
  //           id
  //           operations {
  //             to
  //             value
  //             data
  //           }
  //           gasLimit
  //           transaction {
  //             hash
  //             gasPrice
  //             submittedAt
  //             receipt {
  //               success
  //               responses
  //               timestamp
  //               gasUsed
  //               fee
  //             }
  //           }
  //         }
  //       }
  //     `}
  //     variables={{} as ProposalChangesSubscriptionVariables}
  //   />
  // );
  return null;
});

export const ProposalExample = withBrowser(() => {
  // const proposal = useProposal();
  // if (!proposal) return <Suspend />;

  // return (
  //   <Explorer
  //     document={gql`
  //       query Proposal($input: ProposalInput!) {
  //         proposal(input: $input) {
  //           id
  //           operations {
  //             to
  //             value
  //             data
  //           }
  //           gasLimit
  //           transaction {
  //             hash
  //             gasPrice
  //             submittedAt
  //             receipt {
  //               success
  //               responses
  //               timestamp
  //               gasUsed
  //               fee
  //             }
  //           }
  //         }
  //       }
  //     `}
  //     variables={{ input: { hash: proposal } } as ProposalQueryVariables}
  //   />
  // );
  return null;
});

export const ProposalsExample = withBrowser(() => {
  // if (!useProposal()) return <Suspend />;

  // return (
  //   <Explorer
  //     document={gql`
  //       query Proposals {
  //         proposals {
  //           id
  //           operations {
  //             to
  //             value
  //             data
  //           }
  //           gasLimit
  //           transaction {
  //             hash
  //             gasPrice
  //             submittedAt
  //             receipt {
  //               success
  //               responses
  //               timestamp
  //               gasUsed
  //               fee
  //             }
  //           }
  //         }
  //       }
  //     `}
  //     variables={{} as ProposalsQueryVariables}
  //   />
  // );
  return null;
});
