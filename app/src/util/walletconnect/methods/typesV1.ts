import { SignClientTypes } from '@walletconnect/types';

export interface SessionProposalV1 {
  id: number;
  params: [
    {
      peerId: string;
      peerMeta: SignClientTypes.Metadata;
    },
  ];
}

export interface SessionRequestV1 {
  id: number;
  method: string;
  params: unknown[];
}
