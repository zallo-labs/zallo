import { makeUnionTypeResolver } from '../database/database.util';
import e from '~/edgeql-js';
// import { TransactionProposal } from '../transaction-proposals/transaction-proposals.model';
// import { MessageProposal } from '../message-proposals/message-proposals.model';

export const resolveProposalType = makeUnionTypeResolver([
  [e.TransactionProposal, () => 'TransactionProposal'],
  [e.MessageProposal, () => 'MessageProposal'],
]);
