/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateComment
// ====================================================

export interface CreateComment_createComment_reactions {
  __typename: "Reaction";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  userId: string;
  emojis: string[] | null;
}

export interface CreateComment_createComment {
  __typename: "Comment";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  authorId: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  reactions: CreateComment_createComment_reactions[] | null;
}

export interface CreateComment {
  createComment: CreateComment_createComment;
}

export interface CreateCommentVariables {
  safe: any;
  key: any;
  content: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteComment
// ====================================================

export interface DeleteComment_deleteComment {
  __typename: "Comment";
  id: string;
}

export interface DeleteComment {
  deleteComment: DeleteComment_deleteComment | null;
}

export interface DeleteCommentVariables {
  safe: any;
  key: any;
  nonce: number;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ReactToComment
// ====================================================

export interface ReactToComment_reactToComment {
  __typename: "Reaction";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  userId: string;
  emojis: string[] | null;
}

export interface ReactToComment {
  reactToComment: ReactToComment_reactToComment | null;
}

export interface ReactToCommentVariables {
  safe: any;
  key: any;
  nonce: number;
  emojis: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DeleteContact
// ====================================================

export interface DeleteContact_deleteContact {
  __typename: "DeleteContactResp";
  id: string;
}

export interface DeleteContact {
  deleteContact: DeleteContact_deleteContact;
}

export interface DeleteContactVariables {
  addr: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertContact
// ====================================================

export interface UpsertContact_upsertContact {
  __typename: "Contact";
  id: string;
  addr: string;
  name: string;
}

export interface UpsertContact {
  upsertContact: UpsertContact_upsertContact | null;
}

export interface UpsertContactVariables {
  prevAddr?: any | null;
  newAddr: any;
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertGroup
// ====================================================

export interface UpsertGroup_upsertGroup_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface UpsertGroup_upsertGroup {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: UpsertGroup_upsertGroup_approvers[] | null;
  name: string;
}

export interface UpsertGroup {
  upsertGroup: UpsertGroup_upsertGroup | null;
}

export interface UpsertGroupVariables {
  safe: any;
  group: GroupInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: SubmitTxExecution
// ====================================================

export interface SubmitTxExecution_submitTxExecution {
  __typename: "Submission";
  id: string;
  hash: string;
  nonce: number;
  gasLimit: any;
  gasPrice: any | null;
  finalized: boolean;
  createdAt: any;
}

export interface SubmitTxExecution {
  submitTxExecution: SubmitTxExecution_submitTxExecution;
}

export interface SubmitTxExecutionVariables {
  safe: any;
  txHash: any;
  submission: SubmissionInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ApproveTx
// ====================================================

export interface ApproveTx_approve {
  __typename: "Tx";
  id: string;
}

export interface ApproveTx {
  approve: ApproveTx_approve | null;
}

export interface ApproveTxVariables {
  safe: any;
  txHash: any;
  signature: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: ProposeTx
// ====================================================

export interface ProposeTx_proposeTx_approvals {
  __typename: "Approval";
  userId: string;
  signature: string;
  createdAt: any;
}

export interface ProposeTx_proposeTx_submissions {
  __typename: "Submission";
  id: string;
  hash: string;
  nonce: number;
  gasLimit: any;
  gasPrice: any | null;
  finalized: boolean;
  createdAt: any;
}

export interface ProposeTx_proposeTx {
  __typename: "Tx";
  id: string;
  safeId: string;
  hash: string;
  to: string;
  value: string;
  data: string;
  salt: string;
  approvals: ProposeTx_proposeTx_approvals[] | null;
  createdAt: any;
  submissions: ProposeTx_proposeTx_submissions[] | null;
}

export interface ProposeTx {
  proposeTx: ProposeTx_proposeTx;
}

export interface ProposeTxVariables {
  safe: any;
  tx: TxInput;
  signature: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: RevokeApproval
// ====================================================

export interface RevokeApproval_revokeApproval {
  __typename: "RevokeApprovalResp";
  id: string | null;
}

export interface RevokeApproval {
  revokeApproval: RevokeApproval_revokeApproval;
}

export interface RevokeApprovalVariables {
  safe: any;
  txHash: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertSafe
// ====================================================

export interface UpsertSafe_upsertSafe_groups_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface UpsertSafe_upsertSafe_groups {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: UpsertSafe_upsertSafe_groups_approvers[] | null;
  name: string;
}

export interface UpsertSafe_upsertSafe {
  __typename: "Safe";
  id: string;
  name: string;
  deploySalt: string | null;
  groups: UpsertSafe_upsertSafe_groups[] | null;
}

export interface UpsertSafe {
  upsertSafe: UpsertSafe_upsertSafe;
}

export interface UpsertSafeVariables {
  safe: any;
  deploySalt?: any | null;
  name: string;
  groups?: GroupInput[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetApiTxs
// ====================================================

export interface GetApiTxs_txs_approvals {
  __typename: "Approval";
  userId: string;
  signature: string;
  createdAt: any;
}

export interface GetApiTxs_txs_submissions {
  __typename: "Submission";
  id: string;
  hash: string;
  nonce: number;
  gasLimit: any;
  gasPrice: any | null;
  finalized: boolean;
  createdAt: any;
}

export interface GetApiTxs_txs {
  __typename: "Tx";
  id: string;
  safeId: string;
  hash: string;
  to: string;
  value: string;
  data: string;
  salt: string;
  approvals: GetApiTxs_txs_approvals[] | null;
  createdAt: any;
  submissions: GetApiTxs_txs_submissions[] | null;
}

export interface GetApiTxs {
  txs: GetApiTxs_txs[];
}

export interface GetApiTxsVariables {
  safe: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: CommentsQuery
// ====================================================

export interface CommentsQuery_comments_reactions {
  __typename: "Reaction";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  userId: string;
  emojis: string[] | null;
}

export interface CommentsQuery_comments {
  __typename: "Comment";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  authorId: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  reactions: CommentsQuery_comments_reactions[] | null;
}

export interface CommentsQuery {
  comments: CommentsQuery_comments[];
}

export interface CommentsQueryVariables {
  safe: any;
  key: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetContacts
// ====================================================

export interface GetContacts_contacts {
  __typename: "Contact";
  id: string;
  addr: string;
  name: string;
}

export interface GetContacts {
  contacts: GetContacts_contacts[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetContractMethod
// ====================================================

export interface GetContractMethod_contractMethod {
  __typename: "ContractMethod";
  id: string;
  fragment: any;
}

export interface GetContractMethod {
  contractMethod: GetContractMethod_contractMethod | null;
}

export interface GetContractMethodVariables {
  contract: any;
  sighash: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AQueryUserSafes
// ====================================================

export interface AQueryUserSafes_user_safes_groups_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface AQueryUserSafes_user_safes_groups {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: AQueryUserSafes_user_safes_groups_approvers[] | null;
  name: string;
}

export interface AQueryUserSafes_user_safes {
  __typename: "Safe";
  id: string;
  name: string;
  deploySalt: string | null;
  groups: AQueryUserSafes_user_safes_groups[] | null;
}

export interface AQueryUserSafes_user {
  __typename: "User";
  id: string;
  safes: AQueryUserSafes_user_safes[];
}

export interface AQueryUserSafes {
  user: AQueryUserSafes_user | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SubmissionFields
// ====================================================

export interface SubmissionFields {
  __typename: "Submission";
  id: string;
  hash: string;
  nonce: number;
  gasLimit: any;
  gasPrice: any | null;
  finalized: boolean;
  createdAt: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TxFields
// ====================================================

export interface TxFields_approvals {
  __typename: "Approval";
  userId: string;
  signature: string;
  createdAt: any;
}

export interface TxFields_submissions {
  __typename: "Submission";
  id: string;
  hash: string;
  nonce: number;
  gasLimit: any;
  gasPrice: any | null;
  finalized: boolean;
  createdAt: any;
}

export interface TxFields {
  __typename: "Tx";
  id: string;
  safeId: string;
  hash: string;
  to: string;
  value: string;
  data: string;
  salt: string;
  approvals: TxFields_approvals[] | null;
  createdAt: any;
  submissions: TxFields_submissions[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ReactionFields
// ====================================================

export interface ReactionFields {
  __typename: "Reaction";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  userId: string;
  emojis: string[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: CommentFields
// ====================================================

export interface CommentFields_reactions {
  __typename: "Reaction";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  userId: string;
  emojis: string[] | null;
}

export interface CommentFields {
  __typename: "Comment";
  id: string;
  safeId: string;
  key: string;
  nonce: number;
  authorId: string;
  content: string;
  createdAt: any;
  updatedAt: any;
  reactions: CommentFields_reactions[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ContactFields
// ====================================================

export interface ContactFields {
  __typename: "Contact";
  id: string;
  addr: string;
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: GroupFields
// ====================================================

export interface GroupFields_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface GroupFields {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: GroupFields_approvers[] | null;
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SafeFields
// ====================================================

export interface SafeFields_groups_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface SafeFields_groups {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: SafeFields_groups_approvers[] | null;
  name: string;
}

export interface SafeFields {
  __typename: "Safe";
  id: string;
  name: string;
  deploySalt: string | null;
  groups: SafeFields_groups[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface ApproverInput {
  addr: any;
  weight: number;
}

export interface GroupInput {
  approvers: ApproverInput[];
  name: string;
  ref: any;
}

export interface SubmissionInput {
  hash: any;
}

export interface TxInput {
  data: any;
  salt: any;
  to: any;
  value: any;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
