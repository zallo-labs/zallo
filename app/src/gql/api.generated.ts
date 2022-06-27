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
  name: string | null;
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

export interface ProposeTx_proposeTx_ops {
  __typename: "Op";
  hash: string;
  to: string;
  value: any;
  data: string;
  nonce: any;
}

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
  ops: ProposeTx_proposeTx_ops[] | null;
  approvals: ProposeTx_proposeTx_approvals[] | null;
  createdAt: any;
  submissions: ProposeTx_proposeTx_submissions[] | null;
}

export interface ProposeTx {
  proposeTx: ProposeTx_proposeTx;
}

export interface ProposeTxVariables {
  safe: any;
  ops: OpInput[];
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
// GraphQL mutation operation: CreateCfSafe
// ====================================================

export interface CreateCfSafe_createCfSafe_groups_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface CreateCfSafe_createCfSafe_groups {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: CreateCfSafe_createCfSafe_groups_approvers[] | null;
  name: string | null;
}

export interface CreateCfSafe_createCfSafe {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: CreateCfSafe_createCfSafe_groups[] | null;
}

export interface CreateCfSafe {
  createCfSafe: CreateCfSafe_createCfSafe;
}

export interface CreateCfSafeVariables {
  group: GroupInput;
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
  name: string | null;
}

export interface UpsertSafe_upsertSafe {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: UpsertSafe_upsertSafe_groups[] | null;
}

export interface UpsertSafe {
  upsertSafe: UpsertSafe_upsertSafe;
}

export interface UpsertSafeVariables {
  safe: string;
  create: SafeCreateInput;
  update: SafeUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetApiTxs
// ====================================================

export interface GetApiTxs_txs_ops {
  __typename: "Op";
  hash: string;
  to: string;
  value: any;
  data: string;
  nonce: any;
}

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
  ops: GetApiTxs_txs_ops[] | null;
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
  name: string | null;
}

export interface AQueryUserSafes_user_safes {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: AQueryUserSafes_user_safes_groups[] | null;
}

export interface AQueryUserSafes_user {
  __typename: "User";
  id: string;
  safes: AQueryUserSafes_user_safes[];
}

export interface AQueryUserSafes_safes_groups_approvers {
  __typename: "Approver";
  userId: string;
  weight: any;
}

export interface AQueryUserSafes_safes_groups {
  __typename: "Group";
  id: string;
  ref: string;
  safeId: string;
  approvers: AQueryUserSafes_safes_groups_approvers[] | null;
  name: string | null;
}

export interface AQueryUserSafes_safes {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: AQueryUserSafes_safes_groups[] | null;
}

export interface AQueryUserSafes {
  user: AQueryUserSafes_user | null;
  safes: AQueryUserSafes_safes[];
}

export interface AQueryUserSafesVariables {
  safes?: string[] | null;
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

export interface TxFields_ops {
  __typename: "Op";
  hash: string;
  to: string;
  value: any;
  data: string;
  nonce: any;
}

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
  ops: TxFields_ops[] | null;
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
  name: string | null;
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
  name: string | null;
}

export interface SafeFields {
  __typename: "Safe";
  id: string;
  name: string | null;
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

export enum QueryMode {
  default = "default",
  insensitive = "insensitive",
}

export interface ApprovalCreateManySafeInput {
  createdAt?: any | null;
  signature: string;
  txHash: string;
  userId: string;
}

export interface ApprovalCreateManySafeInputEnvelope {
  data: ApprovalCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface ApprovalCreateManyTxInput {
  createdAt?: any | null;
  signature: string;
  userId: string;
}

export interface ApprovalCreateManyTxInputEnvelope {
  data: ApprovalCreateManyTxInput[];
  skipDuplicates?: boolean | null;
}

export interface ApprovalCreateManyUserInput {
  createdAt?: any | null;
  safeId: string;
  signature: string;
  txHash: string;
}

export interface ApprovalCreateManyUserInputEnvelope {
  data: ApprovalCreateManyUserInput[];
  skipDuplicates?: boolean | null;
}

export interface ApprovalCreateNestedManyWithoutSafeInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutSafeInput[] | null;
  create?: ApprovalCreateWithoutSafeInput[] | null;
  createMany?: ApprovalCreateManySafeInputEnvelope | null;
}

export interface ApprovalCreateNestedManyWithoutTxInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutTxInput[] | null;
  create?: ApprovalCreateWithoutTxInput[] | null;
  createMany?: ApprovalCreateManyTxInputEnvelope | null;
}

export interface ApprovalCreateNestedManyWithoutUserInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutUserInput[] | null;
  create?: ApprovalCreateWithoutUserInput[] | null;
  createMany?: ApprovalCreateManyUserInputEnvelope | null;
}

export interface ApprovalCreateOrConnectWithoutSafeInput {
  create: ApprovalCreateWithoutSafeInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalCreateOrConnectWithoutTxInput {
  create: ApprovalCreateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalCreateOrConnectWithoutUserInput {
  create: ApprovalCreateWithoutUserInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalCreateWithoutSafeInput {
  createdAt?: any | null;
  signature: string;
  tx: TxCreateNestedOneWithoutApprovalsInput;
  user: UserCreateNestedOneWithoutApprovalsInput;
}

export interface ApprovalCreateWithoutTxInput {
  createdAt?: any | null;
  safe: SafeCreateNestedOneWithoutApprovalsInput;
  signature: string;
  user: UserCreateNestedOneWithoutApprovalsInput;
}

export interface ApprovalCreateWithoutUserInput {
  createdAt?: any | null;
  safe: SafeCreateNestedOneWithoutApprovalsInput;
  signature: string;
  tx: TxCreateNestedOneWithoutApprovalsInput;
}

export interface ApprovalSafeIdTxHashUserIdCompoundUniqueInput {
  safeId: string;
  txHash: string;
  userId: string;
}

export interface ApprovalScalarWhereInput {
  AND?: ApprovalScalarWhereInput[] | null;
  NOT?: ApprovalScalarWhereInput[] | null;
  OR?: ApprovalScalarWhereInput[] | null;
  createdAt?: DateTimeFilter | null;
  safeId?: StringFilter | null;
  signature?: StringFilter | null;
  txHash?: StringFilter | null;
  userId?: StringFilter | null;
}

export interface ApprovalUpdateManyMutationInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
}

export interface ApprovalUpdateManyWithWhereWithoutSafeInput {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
}

export interface ApprovalUpdateManyWithWhereWithoutTxInput {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
}

export interface ApprovalUpdateManyWithWhereWithoutUserInput {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
}

export interface ApprovalUpdateManyWithoutSafeInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutSafeInput[] | null;
  create?: ApprovalCreateWithoutSafeInput[] | null;
  createMany?: ApprovalCreateManySafeInputEnvelope | null;
  delete?: ApprovalWhereUniqueInput[] | null;
  deleteMany?: ApprovalScalarWhereInput[] | null;
  disconnect?: ApprovalWhereUniqueInput[] | null;
  set?: ApprovalWhereUniqueInput[] | null;
  update?: ApprovalUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: ApprovalUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: ApprovalUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface ApprovalUpdateManyWithoutTxInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutTxInput[] | null;
  create?: ApprovalCreateWithoutTxInput[] | null;
  createMany?: ApprovalCreateManyTxInputEnvelope | null;
  delete?: ApprovalWhereUniqueInput[] | null;
  deleteMany?: ApprovalScalarWhereInput[] | null;
  disconnect?: ApprovalWhereUniqueInput[] | null;
  set?: ApprovalWhereUniqueInput[] | null;
  update?: ApprovalUpdateWithWhereUniqueWithoutTxInput[] | null;
  updateMany?: ApprovalUpdateManyWithWhereWithoutTxInput[] | null;
  upsert?: ApprovalUpsertWithWhereUniqueWithoutTxInput[] | null;
}

export interface ApprovalUpdateManyWithoutUserInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutUserInput[] | null;
  create?: ApprovalCreateWithoutUserInput[] | null;
  createMany?: ApprovalCreateManyUserInputEnvelope | null;
  delete?: ApprovalWhereUniqueInput[] | null;
  deleteMany?: ApprovalScalarWhereInput[] | null;
  disconnect?: ApprovalWhereUniqueInput[] | null;
  set?: ApprovalWhereUniqueInput[] | null;
  update?: ApprovalUpdateWithWhereUniqueWithoutUserInput[] | null;
  updateMany?: ApprovalUpdateManyWithWhereWithoutUserInput[] | null;
  upsert?: ApprovalUpsertWithWhereUniqueWithoutUserInput[] | null;
}

export interface ApprovalUpdateWithWhereUniqueWithoutSafeInput {
  data: ApprovalUpdateWithoutSafeInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpdateWithWhereUniqueWithoutTxInput {
  data: ApprovalUpdateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpdateWithWhereUniqueWithoutUserInput {
  data: ApprovalUpdateWithoutUserInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpdateWithoutSafeInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
  tx?: TxUpdateOneRequiredWithoutApprovalsInput | null;
  user?: UserUpdateOneRequiredWithoutApprovalsInput | null;
}

export interface ApprovalUpdateWithoutTxInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutApprovalsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
  user?: UserUpdateOneRequiredWithoutApprovalsInput | null;
}

export interface ApprovalUpdateWithoutUserInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutApprovalsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
  tx?: TxUpdateOneRequiredWithoutApprovalsInput | null;
}

export interface ApprovalUpsertWithWhereUniqueWithoutSafeInput {
  create: ApprovalCreateWithoutSafeInput;
  update: ApprovalUpdateWithoutSafeInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpsertWithWhereUniqueWithoutTxInput {
  create: ApprovalCreateWithoutTxInput;
  update: ApprovalUpdateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpsertWithWhereUniqueWithoutUserInput {
  create: ApprovalCreateWithoutUserInput;
  update: ApprovalUpdateWithoutUserInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalWhereUniqueInput {
  safeId_txHash_userId?: ApprovalSafeIdTxHashUserIdCompoundUniqueInput | null;
}

export interface ApproverCreateManyGroupInput {
  userId: string;
  weight: any;
}

export interface ApproverCreateManyGroupInputEnvelope {
  data: ApproverCreateManyGroupInput[];
  skipDuplicates?: boolean | null;
}

export interface ApproverCreateManyUserInput {
  groupRef: string;
  safeId: string;
  weight: any;
}

export interface ApproverCreateManyUserInputEnvelope {
  data: ApproverCreateManyUserInput[];
  skipDuplicates?: boolean | null;
}

export interface ApproverCreateNestedManyWithoutGroupInput {
  connect?: ApproverWhereUniqueInput[] | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutGroupInput[] | null;
  create?: ApproverCreateWithoutGroupInput[] | null;
  createMany?: ApproverCreateManyGroupInputEnvelope | null;
}

export interface ApproverCreateNestedManyWithoutUserInput {
  connect?: ApproverWhereUniqueInput[] | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutUserInput[] | null;
  create?: ApproverCreateWithoutUserInput[] | null;
  createMany?: ApproverCreateManyUserInputEnvelope | null;
}

export interface ApproverCreateOrConnectWithoutGroupInput {
  create: ApproverCreateWithoutGroupInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverCreateOrConnectWithoutUserInput {
  create: ApproverCreateWithoutUserInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverCreateWithoutGroupInput {
  user: UserCreateNestedOneWithoutGroupsInput;
  weight: any;
}

export interface ApproverCreateWithoutUserInput {
  group: GroupCreateNestedOneWithoutApproversInput;
  weight: any;
}

export interface ApproverInput {
  addr: any;
  weight: number;
}

export interface ApproverSafeIdGroupRefUserIdCompoundUniqueInput {
  groupRef: string;
  safeId: string;
  userId: string;
}

export interface ApproverScalarWhereInput {
  AND?: ApproverScalarWhereInput[] | null;
  NOT?: ApproverScalarWhereInput[] | null;
  OR?: ApproverScalarWhereInput[] | null;
  groupRef?: StringFilter | null;
  safeId?: StringFilter | null;
  userId?: StringFilter | null;
  weight?: DecimalFilter | null;
}

export interface ApproverUpdateManyMutationInput {
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface ApproverUpdateManyWithWhereWithoutGroupInput {
  data: ApproverUpdateManyMutationInput;
  where: ApproverScalarWhereInput;
}

export interface ApproverUpdateManyWithWhereWithoutUserInput {
  data: ApproverUpdateManyMutationInput;
  where: ApproverScalarWhereInput;
}

export interface ApproverUpdateManyWithoutGroupInput {
  connect?: ApproverWhereUniqueInput[] | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutGroupInput[] | null;
  create?: ApproverCreateWithoutGroupInput[] | null;
  createMany?: ApproverCreateManyGroupInputEnvelope | null;
  delete?: ApproverWhereUniqueInput[] | null;
  deleteMany?: ApproverScalarWhereInput[] | null;
  disconnect?: ApproverWhereUniqueInput[] | null;
  set?: ApproverWhereUniqueInput[] | null;
  update?: ApproverUpdateWithWhereUniqueWithoutGroupInput[] | null;
  updateMany?: ApproverUpdateManyWithWhereWithoutGroupInput[] | null;
  upsert?: ApproverUpsertWithWhereUniqueWithoutGroupInput[] | null;
}

export interface ApproverUpdateManyWithoutUserInput {
  connect?: ApproverWhereUniqueInput[] | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutUserInput[] | null;
  create?: ApproverCreateWithoutUserInput[] | null;
  createMany?: ApproverCreateManyUserInputEnvelope | null;
  delete?: ApproverWhereUniqueInput[] | null;
  deleteMany?: ApproverScalarWhereInput[] | null;
  disconnect?: ApproverWhereUniqueInput[] | null;
  set?: ApproverWhereUniqueInput[] | null;
  update?: ApproverUpdateWithWhereUniqueWithoutUserInput[] | null;
  updateMany?: ApproverUpdateManyWithWhereWithoutUserInput[] | null;
  upsert?: ApproverUpsertWithWhereUniqueWithoutUserInput[] | null;
}

export interface ApproverUpdateWithWhereUniqueWithoutGroupInput {
  data: ApproverUpdateWithoutGroupInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverUpdateWithWhereUniqueWithoutUserInput {
  data: ApproverUpdateWithoutUserInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverUpdateWithoutGroupInput {
  user?: UserUpdateOneRequiredWithoutGroupsInput | null;
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface ApproverUpdateWithoutUserInput {
  group?: GroupUpdateOneRequiredWithoutApproversInput | null;
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface ApproverUpsertWithWhereUniqueWithoutGroupInput {
  create: ApproverCreateWithoutGroupInput;
  update: ApproverUpdateWithoutGroupInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverUpsertWithWhereUniqueWithoutUserInput {
  create: ApproverCreateWithoutUserInput;
  update: ApproverUpdateWithoutUserInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverWhereUniqueInput {
  safeId_groupRef_userId?: ApproverSafeIdGroupRefUserIdCompoundUniqueInput | null;
}

export interface BoolFieldUpdateOperationsInput {
  set?: boolean | null;
}

export interface BoolFilter {
  equals?: boolean | null;
  not?: NestedBoolFilter | null;
}

export interface CommentCreateManyAuthorInput {
  content: string;
  createdAt?: any | null;
  key: string;
  nonce?: number | null;
  safeId: string;
  updatedAt?: any | null;
}

export interface CommentCreateManyAuthorInputEnvelope {
  data: CommentCreateManyAuthorInput[];
  skipDuplicates?: boolean | null;
}

export interface CommentCreateManySafeInput {
  authorId: string;
  content: string;
  createdAt?: any | null;
  key: string;
  nonce?: number | null;
  updatedAt?: any | null;
}

export interface CommentCreateManySafeInputEnvelope {
  data: CommentCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface CommentCreateNestedManyWithoutAuthorInput {
  connect?: CommentWhereUniqueInput[] | null;
  connectOrCreate?: CommentCreateOrConnectWithoutAuthorInput[] | null;
  create?: CommentCreateWithoutAuthorInput[] | null;
  createMany?: CommentCreateManyAuthorInputEnvelope | null;
}

export interface CommentCreateNestedManyWithoutSafeInput {
  connect?: CommentWhereUniqueInput[] | null;
  connectOrCreate?: CommentCreateOrConnectWithoutSafeInput[] | null;
  create?: CommentCreateWithoutSafeInput[] | null;
  createMany?: CommentCreateManySafeInputEnvelope | null;
}

export interface CommentCreateNestedOneWithoutReactionsInput {
  connect?: CommentWhereUniqueInput | null;
  connectOrCreate?: CommentCreateOrConnectWithoutReactionsInput | null;
  create?: CommentCreateWithoutReactionsInput | null;
}

export interface CommentCreateOrConnectWithoutAuthorInput {
  create: CommentCreateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
}

export interface CommentCreateOrConnectWithoutReactionsInput {
  create: CommentCreateWithoutReactionsInput;
  where: CommentWhereUniqueInput;
}

export interface CommentCreateOrConnectWithoutSafeInput {
  create: CommentCreateWithoutSafeInput;
  where: CommentWhereUniqueInput;
}

export interface CommentCreateWithoutAuthorInput {
  content: string;
  createdAt?: any | null;
  key: string;
  nonce?: number | null;
  reactions?: ReactionCreateNestedManyWithoutCommentInput | null;
  safe: SafeCreateNestedOneWithoutCommentsInput;
  updatedAt?: any | null;
}

export interface CommentCreateWithoutReactionsInput {
  author: UserCreateNestedOneWithoutCommentsInput;
  content: string;
  createdAt?: any | null;
  key: string;
  nonce?: number | null;
  safe: SafeCreateNestedOneWithoutCommentsInput;
  updatedAt?: any | null;
}

export interface CommentCreateWithoutSafeInput {
  author: UserCreateNestedOneWithoutCommentsInput;
  content: string;
  createdAt?: any | null;
  key: string;
  nonce?: number | null;
  reactions?: ReactionCreateNestedManyWithoutCommentInput | null;
  updatedAt?: any | null;
}

export interface CommentSafeIdKeyNonceCompoundUniqueInput {
  key: string;
  nonce: number;
  safeId: string;
}

export interface CommentScalarWhereInput {
  AND?: CommentScalarWhereInput[] | null;
  NOT?: CommentScalarWhereInput[] | null;
  OR?: CommentScalarWhereInput[] | null;
  authorId?: StringFilter | null;
  content?: StringFilter | null;
  createdAt?: DateTimeFilter | null;
  key?: StringFilter | null;
  nonce?: IntFilter | null;
  safeId?: StringFilter | null;
  updatedAt?: DateTimeFilter | null;
}

export interface CommentUpdateManyMutationInput {
  content?: StringFieldUpdateOperationsInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  key?: StringFieldUpdateOperationsInput | null;
  nonce?: IntFieldUpdateOperationsInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
}

export interface CommentUpdateManyWithWhereWithoutAuthorInput {
  data: CommentUpdateManyMutationInput;
  where: CommentScalarWhereInput;
}

export interface CommentUpdateManyWithWhereWithoutSafeInput {
  data: CommentUpdateManyMutationInput;
  where: CommentScalarWhereInput;
}

export interface CommentUpdateManyWithoutAuthorInput {
  connect?: CommentWhereUniqueInput[] | null;
  connectOrCreate?: CommentCreateOrConnectWithoutAuthorInput[] | null;
  create?: CommentCreateWithoutAuthorInput[] | null;
  createMany?: CommentCreateManyAuthorInputEnvelope | null;
  delete?: CommentWhereUniqueInput[] | null;
  deleteMany?: CommentScalarWhereInput[] | null;
  disconnect?: CommentWhereUniqueInput[] | null;
  set?: CommentWhereUniqueInput[] | null;
  update?: CommentUpdateWithWhereUniqueWithoutAuthorInput[] | null;
  updateMany?: CommentUpdateManyWithWhereWithoutAuthorInput[] | null;
  upsert?: CommentUpsertWithWhereUniqueWithoutAuthorInput[] | null;
}

export interface CommentUpdateManyWithoutSafeInput {
  connect?: CommentWhereUniqueInput[] | null;
  connectOrCreate?: CommentCreateOrConnectWithoutSafeInput[] | null;
  create?: CommentCreateWithoutSafeInput[] | null;
  createMany?: CommentCreateManySafeInputEnvelope | null;
  delete?: CommentWhereUniqueInput[] | null;
  deleteMany?: CommentScalarWhereInput[] | null;
  disconnect?: CommentWhereUniqueInput[] | null;
  set?: CommentWhereUniqueInput[] | null;
  update?: CommentUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: CommentUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: CommentUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface CommentUpdateOneRequiredWithoutReactionsInput {
  connect?: CommentWhereUniqueInput | null;
  connectOrCreate?: CommentCreateOrConnectWithoutReactionsInput | null;
  create?: CommentCreateWithoutReactionsInput | null;
  update?: CommentUpdateWithoutReactionsInput | null;
  upsert?: CommentUpsertWithoutReactionsInput | null;
}

export interface CommentUpdateWithWhereUniqueWithoutAuthorInput {
  data: CommentUpdateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
}

export interface CommentUpdateWithWhereUniqueWithoutSafeInput {
  data: CommentUpdateWithoutSafeInput;
  where: CommentWhereUniqueInput;
}

export interface CommentUpdateWithoutAuthorInput {
  content?: StringFieldUpdateOperationsInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  key?: StringFieldUpdateOperationsInput | null;
  nonce?: IntFieldUpdateOperationsInput | null;
  reactions?: ReactionUpdateManyWithoutCommentInput | null;
  safe?: SafeUpdateOneRequiredWithoutCommentsInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
}

export interface CommentUpdateWithoutReactionsInput {
  author?: UserUpdateOneRequiredWithoutCommentsInput | null;
  content?: StringFieldUpdateOperationsInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  key?: StringFieldUpdateOperationsInput | null;
  nonce?: IntFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutCommentsInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
}

export interface CommentUpdateWithoutSafeInput {
  author?: UserUpdateOneRequiredWithoutCommentsInput | null;
  content?: StringFieldUpdateOperationsInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  key?: StringFieldUpdateOperationsInput | null;
  nonce?: IntFieldUpdateOperationsInput | null;
  reactions?: ReactionUpdateManyWithoutCommentInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
}

export interface CommentUpsertWithWhereUniqueWithoutAuthorInput {
  create: CommentCreateWithoutAuthorInput;
  update: CommentUpdateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
}

export interface CommentUpsertWithWhereUniqueWithoutSafeInput {
  create: CommentCreateWithoutSafeInput;
  update: CommentUpdateWithoutSafeInput;
  where: CommentWhereUniqueInput;
}

export interface CommentUpsertWithoutReactionsInput {
  create: CommentCreateWithoutReactionsInput;
  update: CommentUpdateWithoutReactionsInput;
}

export interface CommentWhereUniqueInput {
  safeId_key_nonce?: CommentSafeIdKeyNonceCompoundUniqueInput | null;
}

export interface ContactCreateManyUserInput {
  addr: string;
  name: string;
}

export interface ContactCreateManyUserInputEnvelope {
  data: ContactCreateManyUserInput[];
  skipDuplicates?: boolean | null;
}

export interface ContactCreateNestedManyWithoutUserInput {
  connect?: ContactWhereUniqueInput[] | null;
  connectOrCreate?: ContactCreateOrConnectWithoutUserInput[] | null;
  create?: ContactCreateWithoutUserInput[] | null;
  createMany?: ContactCreateManyUserInputEnvelope | null;
}

export interface ContactCreateOrConnectWithoutUserInput {
  create: ContactCreateWithoutUserInput;
  where: ContactWhereUniqueInput;
}

export interface ContactCreateWithoutUserInput {
  addr: string;
  name: string;
}

export interface ContactName_identifierCompoundUniqueInput {
  name: string;
  userId: string;
}

export interface ContactScalarWhereInput {
  AND?: ContactScalarWhereInput[] | null;
  NOT?: ContactScalarWhereInput[] | null;
  OR?: ContactScalarWhereInput[] | null;
  addr?: StringFilter | null;
  name?: StringFilter | null;
  userId?: StringFilter | null;
}

export interface ContactUpdateManyMutationInput {
  addr?: StringFieldUpdateOperationsInput | null;
  name?: StringFieldUpdateOperationsInput | null;
}

export interface ContactUpdateManyWithWhereWithoutUserInput {
  data: ContactUpdateManyMutationInput;
  where: ContactScalarWhereInput;
}

export interface ContactUpdateManyWithoutUserInput {
  connect?: ContactWhereUniqueInput[] | null;
  connectOrCreate?: ContactCreateOrConnectWithoutUserInput[] | null;
  create?: ContactCreateWithoutUserInput[] | null;
  createMany?: ContactCreateManyUserInputEnvelope | null;
  delete?: ContactWhereUniqueInput[] | null;
  deleteMany?: ContactScalarWhereInput[] | null;
  disconnect?: ContactWhereUniqueInput[] | null;
  set?: ContactWhereUniqueInput[] | null;
  update?: ContactUpdateWithWhereUniqueWithoutUserInput[] | null;
  updateMany?: ContactUpdateManyWithWhereWithoutUserInput[] | null;
  upsert?: ContactUpsertWithWhereUniqueWithoutUserInput[] | null;
}

export interface ContactUpdateWithWhereUniqueWithoutUserInput {
  data: ContactUpdateWithoutUserInput;
  where: ContactWhereUniqueInput;
}

export interface ContactUpdateWithoutUserInput {
  addr?: StringFieldUpdateOperationsInput | null;
  name?: StringFieldUpdateOperationsInput | null;
}

export interface ContactUpsertWithWhereUniqueWithoutUserInput {
  create: ContactCreateWithoutUserInput;
  update: ContactUpdateWithoutUserInput;
  where: ContactWhereUniqueInput;
}

export interface ContactUserIdAddrCompoundUniqueInput {
  addr: string;
  userId: string;
}

export interface ContactWhereUniqueInput {
  name_identifier?: ContactName_identifierCompoundUniqueInput | null;
  userId_addr?: ContactUserIdAddrCompoundUniqueInput | null;
}

export interface DateTimeFieldUpdateOperationsInput {
  set?: any | null;
}

export interface DateTimeFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDateTimeFilter | null;
  notIn?: any[] | null;
}

export interface DecimalFieldUpdateOperationsInput {
  decrement?: any | null;
  divide?: any | null;
  increment?: any | null;
  multiply?: any | null;
  set?: any | null;
}

export interface DecimalFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDecimalFilter | null;
  notIn?: any[] | null;
}

export interface DecimalNullableFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDecimalNullableFilter | null;
  notIn?: any[] | null;
}

export interface GroupCreateManySafeInput {
  name?: string | null;
  ref: string;
}

export interface GroupCreateManySafeInputEnvelope {
  data: GroupCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface GroupCreateNestedManyWithoutSafeInput {
  connect?: GroupWhereUniqueInput[] | null;
  connectOrCreate?: GroupCreateOrConnectWithoutSafeInput[] | null;
  create?: GroupCreateWithoutSafeInput[] | null;
  createMany?: GroupCreateManySafeInputEnvelope | null;
}

export interface GroupCreateNestedOneWithoutApproversInput {
  connect?: GroupWhereUniqueInput | null;
  connectOrCreate?: GroupCreateOrConnectWithoutApproversInput | null;
  create?: GroupCreateWithoutApproversInput | null;
}

export interface GroupCreateOrConnectWithoutApproversInput {
  create: GroupCreateWithoutApproversInput;
  where: GroupWhereUniqueInput;
}

export interface GroupCreateOrConnectWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupCreateWithoutApproversInput {
  name?: string | null;
  ref: string;
  safe: SafeCreateNestedOneWithoutGroupsInput;
}

export interface GroupCreateWithoutSafeInput {
  approvers?: ApproverCreateNestedManyWithoutGroupInput | null;
  name?: string | null;
  ref: string;
}

export interface GroupInput {
  approvers: ApproverInput[];
  name?: string | null;
  ref: any;
}

export interface GroupSafeIdRefCompoundUniqueInput {
  ref: string;
  safeId: string;
}

export interface GroupScalarWhereInput {
  AND?: GroupScalarWhereInput[] | null;
  NOT?: GroupScalarWhereInput[] | null;
  OR?: GroupScalarWhereInput[] | null;
  name?: StringNullableFilter | null;
  ref?: StringFilter | null;
  safeId?: StringFilter | null;
}

export interface GroupUpdateManyMutationInput {
  name?: NullableStringFieldUpdateOperationsInput | null;
  ref?: StringFieldUpdateOperationsInput | null;
}

export interface GroupUpdateManyWithWhereWithoutSafeInput {
  data: GroupUpdateManyMutationInput;
  where: GroupScalarWhereInput;
}

export interface GroupUpdateManyWithoutSafeInput {
  connect?: GroupWhereUniqueInput[] | null;
  connectOrCreate?: GroupCreateOrConnectWithoutSafeInput[] | null;
  create?: GroupCreateWithoutSafeInput[] | null;
  createMany?: GroupCreateManySafeInputEnvelope | null;
  delete?: GroupWhereUniqueInput[] | null;
  deleteMany?: GroupScalarWhereInput[] | null;
  disconnect?: GroupWhereUniqueInput[] | null;
  set?: GroupWhereUniqueInput[] | null;
  update?: GroupUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: GroupUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: GroupUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface GroupUpdateOneRequiredWithoutApproversInput {
  connect?: GroupWhereUniqueInput | null;
  connectOrCreate?: GroupCreateOrConnectWithoutApproversInput | null;
  create?: GroupCreateWithoutApproversInput | null;
  update?: GroupUpdateWithoutApproversInput | null;
  upsert?: GroupUpsertWithoutApproversInput | null;
}

export interface GroupUpdateWithWhereUniqueWithoutSafeInput {
  data: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupUpdateWithoutApproversInput {
  name?: NullableStringFieldUpdateOperationsInput | null;
  ref?: StringFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutGroupsInput | null;
}

export interface GroupUpdateWithoutSafeInput {
  approvers?: ApproverUpdateManyWithoutGroupInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ref?: StringFieldUpdateOperationsInput | null;
}

export interface GroupUpsertWithWhereUniqueWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  update: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupUpsertWithoutApproversInput {
  create: GroupCreateWithoutApproversInput;
  update: GroupUpdateWithoutApproversInput;
}

export interface GroupWhereUniqueInput {
  safeId_ref?: GroupSafeIdRefCompoundUniqueInput | null;
}

export interface IntFieldUpdateOperationsInput {
  decrement?: number | null;
  divide?: number | null;
  increment?: number | null;
  multiply?: number | null;
  set?: number | null;
}

export interface IntFilter {
  equals?: number | null;
  gt?: number | null;
  gte?: number | null;
  in?: number[] | null;
  lt?: number | null;
  lte?: number | null;
  not?: NestedIntFilter | null;
  notIn?: number[] | null;
}

export interface NestedBoolFilter {
  equals?: boolean | null;
  not?: NestedBoolFilter | null;
}

export interface NestedDateTimeFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDateTimeFilter | null;
  notIn?: any[] | null;
}

export interface NestedDecimalFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDecimalFilter | null;
  notIn?: any[] | null;
}

export interface NestedDecimalNullableFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDecimalNullableFilter | null;
  notIn?: any[] | null;
}

export interface NestedIntFilter {
  equals?: number | null;
  gt?: number | null;
  gte?: number | null;
  in?: number[] | null;
  lt?: number | null;
  lte?: number | null;
  not?: NestedIntFilter | null;
  notIn?: number[] | null;
}

export interface NestedStringFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  not?: NestedStringFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

export interface NestedStringNullableFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  not?: NestedStringNullableFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

export interface NullableDecimalFieldUpdateOperationsInput {
  decrement?: any | null;
  divide?: any | null;
  increment?: any | null;
  multiply?: any | null;
  set?: any | null;
}

export interface NullableStringFieldUpdateOperationsInput {
  set?: string | null;
}

export interface OpCreateManySafeInput {
  data: string;
  hash: string;
  nonce: any;
  to: string;
  txHash: string;
  value: any;
}

export interface OpCreateManySafeInputEnvelope {
  data: OpCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface OpCreateManyTxInput {
  data: string;
  hash: string;
  nonce: any;
  to: string;
  value: any;
}

export interface OpCreateManyTxInputEnvelope {
  data: OpCreateManyTxInput[];
  skipDuplicates?: boolean | null;
}

export interface OpCreateNestedManyWithoutSafeInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutSafeInput[] | null;
  create?: OpCreateWithoutSafeInput[] | null;
  createMany?: OpCreateManySafeInputEnvelope | null;
}

export interface OpCreateNestedManyWithoutTxInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutTxInput[] | null;
  create?: OpCreateWithoutTxInput[] | null;
  createMany?: OpCreateManyTxInputEnvelope | null;
}

export interface OpCreateOrConnectWithoutSafeInput {
  create: OpCreateWithoutSafeInput;
  where: OpWhereUniqueInput;
}

export interface OpCreateOrConnectWithoutTxInput {
  create: OpCreateWithoutTxInput;
  where: OpWhereUniqueInput;
}

export interface OpCreateWithoutSafeInput {
  data: string;
  hash: string;
  nonce: any;
  to: string;
  tx: TxCreateNestedOneWithoutOpsInput;
  value: any;
}

export interface OpCreateWithoutTxInput {
  data: string;
  hash: string;
  nonce: any;
  safe: SafeCreateNestedOneWithoutOpsInput;
  to: string;
  value: any;
}

export interface OpInput {
  data: any;
  nonce: any;
  to: any;
  value: any;
}

export interface OpSafeIdTxHashHashCompoundUniqueInput {
  hash: string;
  safeId: string;
  txHash: string;
}

export interface OpScalarWhereInput {
  AND?: OpScalarWhereInput[] | null;
  NOT?: OpScalarWhereInput[] | null;
  OR?: OpScalarWhereInput[] | null;
  data?: StringFilter | null;
  hash?: StringFilter | null;
  nonce?: DecimalFilter | null;
  safeId?: StringFilter | null;
  to?: StringFilter | null;
  txHash?: StringFilter | null;
  value?: DecimalFilter | null;
}

export interface OpUpdateManyMutationInput {
  data?: StringFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: DecimalFieldUpdateOperationsInput | null;
  to?: StringFieldUpdateOperationsInput | null;
  value?: DecimalFieldUpdateOperationsInput | null;
}

export interface OpUpdateManyWithWhereWithoutSafeInput {
  data: OpUpdateManyMutationInput;
  where: OpScalarWhereInput;
}

export interface OpUpdateManyWithWhereWithoutTxInput {
  data: OpUpdateManyMutationInput;
  where: OpScalarWhereInput;
}

export interface OpUpdateManyWithoutSafeInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutSafeInput[] | null;
  create?: OpCreateWithoutSafeInput[] | null;
  createMany?: OpCreateManySafeInputEnvelope | null;
  delete?: OpWhereUniqueInput[] | null;
  deleteMany?: OpScalarWhereInput[] | null;
  disconnect?: OpWhereUniqueInput[] | null;
  set?: OpWhereUniqueInput[] | null;
  update?: OpUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: OpUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: OpUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface OpUpdateManyWithoutTxInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutTxInput[] | null;
  create?: OpCreateWithoutTxInput[] | null;
  createMany?: OpCreateManyTxInputEnvelope | null;
  delete?: OpWhereUniqueInput[] | null;
  deleteMany?: OpScalarWhereInput[] | null;
  disconnect?: OpWhereUniqueInput[] | null;
  set?: OpWhereUniqueInput[] | null;
  update?: OpUpdateWithWhereUniqueWithoutTxInput[] | null;
  updateMany?: OpUpdateManyWithWhereWithoutTxInput[] | null;
  upsert?: OpUpsertWithWhereUniqueWithoutTxInput[] | null;
}

export interface OpUpdateWithWhereUniqueWithoutSafeInput {
  data: OpUpdateWithoutSafeInput;
  where: OpWhereUniqueInput;
}

export interface OpUpdateWithWhereUniqueWithoutTxInput {
  data: OpUpdateWithoutTxInput;
  where: OpWhereUniqueInput;
}

export interface OpUpdateWithoutSafeInput {
  data?: StringFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: DecimalFieldUpdateOperationsInput | null;
  to?: StringFieldUpdateOperationsInput | null;
  tx?: TxUpdateOneRequiredWithoutOpsInput | null;
  value?: DecimalFieldUpdateOperationsInput | null;
}

export interface OpUpdateWithoutTxInput {
  data?: StringFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: DecimalFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutOpsInput | null;
  to?: StringFieldUpdateOperationsInput | null;
  value?: DecimalFieldUpdateOperationsInput | null;
}

export interface OpUpsertWithWhereUniqueWithoutSafeInput {
  create: OpCreateWithoutSafeInput;
  update: OpUpdateWithoutSafeInput;
  where: OpWhereUniqueInput;
}

export interface OpUpsertWithWhereUniqueWithoutTxInput {
  create: OpCreateWithoutTxInput;
  update: OpUpdateWithoutTxInput;
  where: OpWhereUniqueInput;
}

export interface OpWhereUniqueInput {
  safeId_txHash_hash?: OpSafeIdTxHashHashCompoundUniqueInput | null;
}

export interface ReactionCreateManyCommentInput {
  createdAt?: any | null;
  emojis?: ReactionCreateemojisInput | null;
  updatedAt?: any | null;
  userId: string;
}

export interface ReactionCreateManyCommentInputEnvelope {
  data: ReactionCreateManyCommentInput[];
  skipDuplicates?: boolean | null;
}

export interface ReactionCreateManySafeInput {
  createdAt?: any | null;
  emojis?: ReactionCreateemojisInput | null;
  key: string;
  nonce: number;
  updatedAt?: any | null;
  userId: string;
}

export interface ReactionCreateManySafeInputEnvelope {
  data: ReactionCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface ReactionCreateManyUserInput {
  createdAt?: any | null;
  emojis?: ReactionCreateemojisInput | null;
  key: string;
  nonce: number;
  safeId: string;
  updatedAt?: any | null;
}

export interface ReactionCreateManyUserInputEnvelope {
  data: ReactionCreateManyUserInput[];
  skipDuplicates?: boolean | null;
}

export interface ReactionCreateNestedManyWithoutCommentInput {
  connect?: ReactionWhereUniqueInput[] | null;
  connectOrCreate?: ReactionCreateOrConnectWithoutCommentInput[] | null;
  create?: ReactionCreateWithoutCommentInput[] | null;
  createMany?: ReactionCreateManyCommentInputEnvelope | null;
}

export interface ReactionCreateNestedManyWithoutSafeInput {
  connect?: ReactionWhereUniqueInput[] | null;
  connectOrCreate?: ReactionCreateOrConnectWithoutSafeInput[] | null;
  create?: ReactionCreateWithoutSafeInput[] | null;
  createMany?: ReactionCreateManySafeInputEnvelope | null;
}

export interface ReactionCreateNestedManyWithoutUserInput {
  connect?: ReactionWhereUniqueInput[] | null;
  connectOrCreate?: ReactionCreateOrConnectWithoutUserInput[] | null;
  create?: ReactionCreateWithoutUserInput[] | null;
  createMany?: ReactionCreateManyUserInputEnvelope | null;
}

export interface ReactionCreateOrConnectWithoutCommentInput {
  create: ReactionCreateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionCreateOrConnectWithoutSafeInput {
  create: ReactionCreateWithoutSafeInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionCreateOrConnectWithoutUserInput {
  create: ReactionCreateWithoutUserInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionCreateWithoutCommentInput {
  createdAt?: any | null;
  emojis?: ReactionCreateemojisInput | null;
  safe: SafeCreateNestedOneWithoutReactionsInput;
  updatedAt?: any | null;
  user: UserCreateNestedOneWithoutReactionsInput;
}

export interface ReactionCreateWithoutSafeInput {
  comment: CommentCreateNestedOneWithoutReactionsInput;
  createdAt?: any | null;
  emojis?: ReactionCreateemojisInput | null;
  updatedAt?: any | null;
  user: UserCreateNestedOneWithoutReactionsInput;
}

export interface ReactionCreateWithoutUserInput {
  comment: CommentCreateNestedOneWithoutReactionsInput;
  createdAt?: any | null;
  emojis?: ReactionCreateemojisInput | null;
  safe: SafeCreateNestedOneWithoutReactionsInput;
  updatedAt?: any | null;
}

export interface ReactionCreateemojisInput {
  set: string[];
}

export interface ReactionSafeIdKeyNonceUserIdCompoundUniqueInput {
  key: string;
  nonce: number;
  safeId: string;
  userId: string;
}

export interface ReactionScalarWhereInput {
  AND?: ReactionScalarWhereInput[] | null;
  NOT?: ReactionScalarWhereInput[] | null;
  OR?: ReactionScalarWhereInput[] | null;
  createdAt?: DateTimeFilter | null;
  emojis?: StringNullableListFilter | null;
  key?: StringFilter | null;
  nonce?: IntFilter | null;
  safeId?: StringFilter | null;
  updatedAt?: DateTimeFilter | null;
  userId?: StringFilter | null;
}

export interface ReactionUpdateManyMutationInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  emojis?: ReactionUpdateemojisInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
}

export interface ReactionUpdateManyWithWhereWithoutCommentInput {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
}

export interface ReactionUpdateManyWithWhereWithoutSafeInput {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
}

export interface ReactionUpdateManyWithWhereWithoutUserInput {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
}

export interface ReactionUpdateManyWithoutCommentInput {
  connect?: ReactionWhereUniqueInput[] | null;
  connectOrCreate?: ReactionCreateOrConnectWithoutCommentInput[] | null;
  create?: ReactionCreateWithoutCommentInput[] | null;
  createMany?: ReactionCreateManyCommentInputEnvelope | null;
  delete?: ReactionWhereUniqueInput[] | null;
  deleteMany?: ReactionScalarWhereInput[] | null;
  disconnect?: ReactionWhereUniqueInput[] | null;
  set?: ReactionWhereUniqueInput[] | null;
  update?: ReactionUpdateWithWhereUniqueWithoutCommentInput[] | null;
  updateMany?: ReactionUpdateManyWithWhereWithoutCommentInput[] | null;
  upsert?: ReactionUpsertWithWhereUniqueWithoutCommentInput[] | null;
}

export interface ReactionUpdateManyWithoutSafeInput {
  connect?: ReactionWhereUniqueInput[] | null;
  connectOrCreate?: ReactionCreateOrConnectWithoutSafeInput[] | null;
  create?: ReactionCreateWithoutSafeInput[] | null;
  createMany?: ReactionCreateManySafeInputEnvelope | null;
  delete?: ReactionWhereUniqueInput[] | null;
  deleteMany?: ReactionScalarWhereInput[] | null;
  disconnect?: ReactionWhereUniqueInput[] | null;
  set?: ReactionWhereUniqueInput[] | null;
  update?: ReactionUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: ReactionUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: ReactionUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface ReactionUpdateManyWithoutUserInput {
  connect?: ReactionWhereUniqueInput[] | null;
  connectOrCreate?: ReactionCreateOrConnectWithoutUserInput[] | null;
  create?: ReactionCreateWithoutUserInput[] | null;
  createMany?: ReactionCreateManyUserInputEnvelope | null;
  delete?: ReactionWhereUniqueInput[] | null;
  deleteMany?: ReactionScalarWhereInput[] | null;
  disconnect?: ReactionWhereUniqueInput[] | null;
  set?: ReactionWhereUniqueInput[] | null;
  update?: ReactionUpdateWithWhereUniqueWithoutUserInput[] | null;
  updateMany?: ReactionUpdateManyWithWhereWithoutUserInput[] | null;
  upsert?: ReactionUpsertWithWhereUniqueWithoutUserInput[] | null;
}

export interface ReactionUpdateWithWhereUniqueWithoutCommentInput {
  data: ReactionUpdateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionUpdateWithWhereUniqueWithoutSafeInput {
  data: ReactionUpdateWithoutSafeInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionUpdateWithWhereUniqueWithoutUserInput {
  data: ReactionUpdateWithoutUserInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionUpdateWithoutCommentInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  emojis?: ReactionUpdateemojisInput | null;
  safe?: SafeUpdateOneRequiredWithoutReactionsInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
  user?: UserUpdateOneRequiredWithoutReactionsInput | null;
}

export interface ReactionUpdateWithoutSafeInput {
  comment?: CommentUpdateOneRequiredWithoutReactionsInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  emojis?: ReactionUpdateemojisInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
  user?: UserUpdateOneRequiredWithoutReactionsInput | null;
}

export interface ReactionUpdateWithoutUserInput {
  comment?: CommentUpdateOneRequiredWithoutReactionsInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  emojis?: ReactionUpdateemojisInput | null;
  safe?: SafeUpdateOneRequiredWithoutReactionsInput | null;
  updatedAt?: DateTimeFieldUpdateOperationsInput | null;
}

export interface ReactionUpdateemojisInput {
  push?: string[] | null;
  set?: string[] | null;
}

export interface ReactionUpsertWithWhereUniqueWithoutCommentInput {
  create: ReactionCreateWithoutCommentInput;
  update: ReactionUpdateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionUpsertWithWhereUniqueWithoutSafeInput {
  create: ReactionCreateWithoutSafeInput;
  update: ReactionUpdateWithoutSafeInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionUpsertWithWhereUniqueWithoutUserInput {
  create: ReactionCreateWithoutUserInput;
  update: ReactionUpdateWithoutUserInput;
  where: ReactionWhereUniqueInput;
}

export interface ReactionWhereUniqueInput {
  safeId_key_nonce_userId?: ReactionSafeIdKeyNonceUserIdCompoundUniqueInput | null;
}

export interface SafeCreateInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  comments?: CommentCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  reactions?: ReactionCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateNestedOneWithoutApprovalsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutApprovalsInput | null;
  create?: SafeCreateWithoutApprovalsInput | null;
}

export interface SafeCreateNestedOneWithoutCommentsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutCommentsInput | null;
  create?: SafeCreateWithoutCommentsInput | null;
}

export interface SafeCreateNestedOneWithoutGroupsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutGroupsInput | null;
  create?: SafeCreateWithoutGroupsInput | null;
}

export interface SafeCreateNestedOneWithoutOpsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutOpsInput | null;
  create?: SafeCreateWithoutOpsInput | null;
}

export interface SafeCreateNestedOneWithoutReactionsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutReactionsInput | null;
  create?: SafeCreateWithoutReactionsInput | null;
}

export interface SafeCreateNestedOneWithoutTxsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutTxsInput | null;
  create?: SafeCreateWithoutTxsInput | null;
}

export interface SafeCreateOrConnectWithoutApprovalsInput {
  create: SafeCreateWithoutApprovalsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutCommentsInput {
  create: SafeCreateWithoutCommentsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutGroupsInput {
  create: SafeCreateWithoutGroupsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutOpsInput {
  create: SafeCreateWithoutOpsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutReactionsInput {
  create: SafeCreateWithoutReactionsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutTxsInput {
  create: SafeCreateWithoutTxsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateWithoutApprovalsInput {
  comments?: CommentCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  reactions?: ReactionCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutCommentsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  reactions?: ReactionCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutGroupsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  comments?: CommentCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  reactions?: ReactionCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutOpsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  comments?: CommentCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  reactions?: ReactionCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutReactionsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  comments?: CommentCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutTxsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  comments?: CommentCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  reactions?: ReactionCreateNestedManyWithoutSafeInput | null;
}

export interface SafeUpdateInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  comments?: CommentUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  reactions?: ReactionUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateOneRequiredWithoutApprovalsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutApprovalsInput | null;
  create?: SafeCreateWithoutApprovalsInput | null;
  update?: SafeUpdateWithoutApprovalsInput | null;
  upsert?: SafeUpsertWithoutApprovalsInput | null;
}

export interface SafeUpdateOneRequiredWithoutCommentsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutCommentsInput | null;
  create?: SafeCreateWithoutCommentsInput | null;
  update?: SafeUpdateWithoutCommentsInput | null;
  upsert?: SafeUpsertWithoutCommentsInput | null;
}

export interface SafeUpdateOneRequiredWithoutGroupsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutGroupsInput | null;
  create?: SafeCreateWithoutGroupsInput | null;
  update?: SafeUpdateWithoutGroupsInput | null;
  upsert?: SafeUpsertWithoutGroupsInput | null;
}

export interface SafeUpdateOneRequiredWithoutOpsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutOpsInput | null;
  create?: SafeCreateWithoutOpsInput | null;
  update?: SafeUpdateWithoutOpsInput | null;
  upsert?: SafeUpsertWithoutOpsInput | null;
}

export interface SafeUpdateOneRequiredWithoutReactionsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutReactionsInput | null;
  create?: SafeCreateWithoutReactionsInput | null;
  update?: SafeUpdateWithoutReactionsInput | null;
  upsert?: SafeUpsertWithoutReactionsInput | null;
}

export interface SafeUpdateOneRequiredWithoutTxsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutTxsInput | null;
  create?: SafeCreateWithoutTxsInput | null;
  update?: SafeUpdateWithoutTxsInput | null;
  upsert?: SafeUpsertWithoutTxsInput | null;
}

export interface SafeUpdateWithoutApprovalsInput {
  comments?: CommentUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  reactions?: ReactionUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutCommentsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  reactions?: ReactionUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutGroupsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  comments?: CommentUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  reactions?: ReactionUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutOpsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  comments?: CommentUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  reactions?: ReactionUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutReactionsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  comments?: CommentUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutTxsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  comments?: CommentUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  reactions?: ReactionUpdateManyWithoutSafeInput | null;
}

export interface SafeUpsertWithoutApprovalsInput {
  create: SafeCreateWithoutApprovalsInput;
  update: SafeUpdateWithoutApprovalsInput;
}

export interface SafeUpsertWithoutCommentsInput {
  create: SafeCreateWithoutCommentsInput;
  update: SafeUpdateWithoutCommentsInput;
}

export interface SafeUpsertWithoutGroupsInput {
  create: SafeCreateWithoutGroupsInput;
  update: SafeUpdateWithoutGroupsInput;
}

export interface SafeUpsertWithoutOpsInput {
  create: SafeCreateWithoutOpsInput;
  update: SafeUpdateWithoutOpsInput;
}

export interface SafeUpsertWithoutReactionsInput {
  create: SafeCreateWithoutReactionsInput;
  update: SafeUpdateWithoutReactionsInput;
}

export interface SafeUpsertWithoutTxsInput {
  create: SafeCreateWithoutTxsInput;
  update: SafeUpdateWithoutTxsInput;
}

export interface SafeWhereUniqueInput {
  id?: string | null;
}

export interface StringFieldUpdateOperationsInput {
  set?: string | null;
}

export interface StringFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  mode?: QueryMode | null;
  not?: NestedStringFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

export interface StringNullableFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  mode?: QueryMode | null;
  not?: NestedStringNullableFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

export interface StringNullableListFilter {
  equals?: string[] | null;
  has?: string | null;
  hasEvery?: string[] | null;
  hasSome?: string[] | null;
  isEmpty?: boolean | null;
}

export interface SubmissionCreateManyTxInput {
  createdAt?: any | null;
  finalized: boolean;
  gasLimit: any;
  gasPrice?: any | null;
  hash: string;
  nonce: number;
}

export interface SubmissionCreateManyTxInputEnvelope {
  data: SubmissionCreateManyTxInput[];
  skipDuplicates?: boolean | null;
}

export interface SubmissionCreateNestedManyWithoutTxInput {
  connect?: SubmissionWhereUniqueInput[] | null;
  connectOrCreate?: SubmissionCreateOrConnectWithoutTxInput[] | null;
  create?: SubmissionCreateWithoutTxInput[] | null;
  createMany?: SubmissionCreateManyTxInputEnvelope | null;
}

export interface SubmissionCreateOrConnectWithoutTxInput {
  create: SubmissionCreateWithoutTxInput;
  where: SubmissionWhereUniqueInput;
}

export interface SubmissionCreateWithoutTxInput {
  createdAt?: any | null;
  finalized: boolean;
  gasLimit: any;
  gasPrice?: any | null;
  hash: string;
  nonce: number;
}

export interface SubmissionInput {
  hash: any;
}

export interface SubmissionScalarWhereInput {
  AND?: SubmissionScalarWhereInput[] | null;
  NOT?: SubmissionScalarWhereInput[] | null;
  OR?: SubmissionScalarWhereInput[] | null;
  createdAt?: DateTimeFilter | null;
  finalized?: BoolFilter | null;
  gasLimit?: DecimalFilter | null;
  gasPrice?: DecimalNullableFilter | null;
  hash?: StringFilter | null;
  nonce?: IntFilter | null;
  safeId?: StringFilter | null;
  txHash?: StringFilter | null;
}

export interface SubmissionUpdateManyMutationInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  finalized?: BoolFieldUpdateOperationsInput | null;
  gasLimit?: DecimalFieldUpdateOperationsInput | null;
  gasPrice?: NullableDecimalFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: IntFieldUpdateOperationsInput | null;
}

export interface SubmissionUpdateManyWithWhereWithoutTxInput {
  data: SubmissionUpdateManyMutationInput;
  where: SubmissionScalarWhereInput;
}

export interface SubmissionUpdateManyWithoutTxInput {
  connect?: SubmissionWhereUniqueInput[] | null;
  connectOrCreate?: SubmissionCreateOrConnectWithoutTxInput[] | null;
  create?: SubmissionCreateWithoutTxInput[] | null;
  createMany?: SubmissionCreateManyTxInputEnvelope | null;
  delete?: SubmissionWhereUniqueInput[] | null;
  deleteMany?: SubmissionScalarWhereInput[] | null;
  disconnect?: SubmissionWhereUniqueInput[] | null;
  set?: SubmissionWhereUniqueInput[] | null;
  update?: SubmissionUpdateWithWhereUniqueWithoutTxInput[] | null;
  updateMany?: SubmissionUpdateManyWithWhereWithoutTxInput[] | null;
  upsert?: SubmissionUpsertWithWhereUniqueWithoutTxInput[] | null;
}

export interface SubmissionUpdateWithWhereUniqueWithoutTxInput {
  data: SubmissionUpdateWithoutTxInput;
  where: SubmissionWhereUniqueInput;
}

export interface SubmissionUpdateWithoutTxInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  finalized?: BoolFieldUpdateOperationsInput | null;
  gasLimit?: DecimalFieldUpdateOperationsInput | null;
  gasPrice?: NullableDecimalFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: IntFieldUpdateOperationsInput | null;
}

export interface SubmissionUpsertWithWhereUniqueWithoutTxInput {
  create: SubmissionCreateWithoutTxInput;
  update: SubmissionUpdateWithoutTxInput;
  where: SubmissionWhereUniqueInput;
}

export interface SubmissionWhereUniqueInput {
  hash?: string | null;
}

export interface TxCreateManySafeInput {
  createdAt?: any | null;
  hash: string;
}

export interface TxCreateManySafeInputEnvelope {
  data: TxCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface TxCreateNestedManyWithoutSafeInput {
  connect?: TxWhereUniqueInput[] | null;
  connectOrCreate?: TxCreateOrConnectWithoutSafeInput[] | null;
  create?: TxCreateWithoutSafeInput[] | null;
  createMany?: TxCreateManySafeInputEnvelope | null;
}

export interface TxCreateNestedOneWithoutApprovalsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutApprovalsInput | null;
  create?: TxCreateWithoutApprovalsInput | null;
}

export interface TxCreateNestedOneWithoutOpsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutOpsInput | null;
  create?: TxCreateWithoutOpsInput | null;
}

export interface TxCreateOrConnectWithoutApprovalsInput {
  create: TxCreateWithoutApprovalsInput;
  where: TxWhereUniqueInput;
}

export interface TxCreateOrConnectWithoutOpsInput {
  create: TxCreateWithoutOpsInput;
  where: TxWhereUniqueInput;
}

export interface TxCreateOrConnectWithoutSafeInput {
  create: TxCreateWithoutSafeInput;
  where: TxWhereUniqueInput;
}

export interface TxCreateWithoutApprovalsInput {
  createdAt?: any | null;
  hash: string;
  ops?: OpCreateNestedManyWithoutTxInput | null;
  safe: SafeCreateNestedOneWithoutTxsInput;
  submissions?: SubmissionCreateNestedManyWithoutTxInput | null;
}

export interface TxCreateWithoutOpsInput {
  approvals?: ApprovalCreateNestedManyWithoutTxInput | null;
  createdAt?: any | null;
  hash: string;
  safe: SafeCreateNestedOneWithoutTxsInput;
  submissions?: SubmissionCreateNestedManyWithoutTxInput | null;
}

export interface TxCreateWithoutSafeInput {
  approvals?: ApprovalCreateNestedManyWithoutTxInput | null;
  createdAt?: any | null;
  hash: string;
  ops?: OpCreateNestedManyWithoutTxInput | null;
  submissions?: SubmissionCreateNestedManyWithoutTxInput | null;
}

export interface TxSafeIdHashCompoundUniqueInput {
  hash: string;
  safeId: string;
}

export interface TxScalarWhereInput {
  AND?: TxScalarWhereInput[] | null;
  NOT?: TxScalarWhereInput[] | null;
  OR?: TxScalarWhereInput[] | null;
  createdAt?: DateTimeFilter | null;
  hash?: StringFilter | null;
  safeId?: StringFilter | null;
}

export interface TxUpdateManyMutationInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
}

export interface TxUpdateManyWithWhereWithoutSafeInput {
  data: TxUpdateManyMutationInput;
  where: TxScalarWhereInput;
}

export interface TxUpdateManyWithoutSafeInput {
  connect?: TxWhereUniqueInput[] | null;
  connectOrCreate?: TxCreateOrConnectWithoutSafeInput[] | null;
  create?: TxCreateWithoutSafeInput[] | null;
  createMany?: TxCreateManySafeInputEnvelope | null;
  delete?: TxWhereUniqueInput[] | null;
  deleteMany?: TxScalarWhereInput[] | null;
  disconnect?: TxWhereUniqueInput[] | null;
  set?: TxWhereUniqueInput[] | null;
  update?: TxUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: TxUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: TxUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface TxUpdateOneRequiredWithoutApprovalsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutApprovalsInput | null;
  create?: TxCreateWithoutApprovalsInput | null;
  update?: TxUpdateWithoutApprovalsInput | null;
  upsert?: TxUpsertWithoutApprovalsInput | null;
}

export interface TxUpdateOneRequiredWithoutOpsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutOpsInput | null;
  create?: TxCreateWithoutOpsInput | null;
  update?: TxUpdateWithoutOpsInput | null;
  upsert?: TxUpsertWithoutOpsInput | null;
}

export interface TxUpdateWithWhereUniqueWithoutSafeInput {
  data: TxUpdateWithoutSafeInput;
  where: TxWhereUniqueInput;
}

export interface TxUpdateWithoutApprovalsInput {
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutTxInput | null;
  safe?: SafeUpdateOneRequiredWithoutTxsInput | null;
  submissions?: SubmissionUpdateManyWithoutTxInput | null;
}

export interface TxUpdateWithoutOpsInput {
  approvals?: ApprovalUpdateManyWithoutTxInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutTxsInput | null;
  submissions?: SubmissionUpdateManyWithoutTxInput | null;
}

export interface TxUpdateWithoutSafeInput {
  approvals?: ApprovalUpdateManyWithoutTxInput | null;
  createdAt?: DateTimeFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutTxInput | null;
  submissions?: SubmissionUpdateManyWithoutTxInput | null;
}

export interface TxUpsertWithWhereUniqueWithoutSafeInput {
  create: TxCreateWithoutSafeInput;
  update: TxUpdateWithoutSafeInput;
  where: TxWhereUniqueInput;
}

export interface TxUpsertWithoutApprovalsInput {
  create: TxCreateWithoutApprovalsInput;
  update: TxUpdateWithoutApprovalsInput;
}

export interface TxUpsertWithoutOpsInput {
  create: TxCreateWithoutOpsInput;
  update: TxUpdateWithoutOpsInput;
}

export interface TxWhereUniqueInput {
  safeId_hash?: TxSafeIdHashCompoundUniqueInput | null;
}

export interface UserCreateNestedOneWithoutApprovalsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutApprovalsInput | null;
  create?: UserCreateWithoutApprovalsInput | null;
}

export interface UserCreateNestedOneWithoutCommentsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutCommentsInput | null;
  create?: UserCreateWithoutCommentsInput | null;
}

export interface UserCreateNestedOneWithoutGroupsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutGroupsInput | null;
  create?: UserCreateWithoutGroupsInput | null;
}

export interface UserCreateNestedOneWithoutReactionsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutReactionsInput | null;
  create?: UserCreateWithoutReactionsInput | null;
}

export interface UserCreateOrConnectWithoutApprovalsInput {
  create: UserCreateWithoutApprovalsInput;
  where: UserWhereUniqueInput;
}

export interface UserCreateOrConnectWithoutCommentsInput {
  create: UserCreateWithoutCommentsInput;
  where: UserWhereUniqueInput;
}

export interface UserCreateOrConnectWithoutGroupsInput {
  create: UserCreateWithoutGroupsInput;
  where: UserWhereUniqueInput;
}

export interface UserCreateOrConnectWithoutReactionsInput {
  create: UserCreateWithoutReactionsInput;
  where: UserWhereUniqueInput;
}

export interface UserCreateWithoutApprovalsInput {
  comments?: CommentCreateNestedManyWithoutAuthorInput | null;
  contacts?: ContactCreateNestedManyWithoutUserInput | null;
  groups?: ApproverCreateNestedManyWithoutUserInput | null;
  id: string;
  reactions?: ReactionCreateNestedManyWithoutUserInput | null;
}

export interface UserCreateWithoutCommentsInput {
  approvals?: ApprovalCreateNestedManyWithoutUserInput | null;
  contacts?: ContactCreateNestedManyWithoutUserInput | null;
  groups?: ApproverCreateNestedManyWithoutUserInput | null;
  id: string;
  reactions?: ReactionCreateNestedManyWithoutUserInput | null;
}

export interface UserCreateWithoutGroupsInput {
  approvals?: ApprovalCreateNestedManyWithoutUserInput | null;
  comments?: CommentCreateNestedManyWithoutAuthorInput | null;
  contacts?: ContactCreateNestedManyWithoutUserInput | null;
  id: string;
  reactions?: ReactionCreateNestedManyWithoutUserInput | null;
}

export interface UserCreateWithoutReactionsInput {
  approvals?: ApprovalCreateNestedManyWithoutUserInput | null;
  comments?: CommentCreateNestedManyWithoutAuthorInput | null;
  contacts?: ContactCreateNestedManyWithoutUserInput | null;
  groups?: ApproverCreateNestedManyWithoutUserInput | null;
  id: string;
}

export interface UserUpdateOneRequiredWithoutApprovalsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutApprovalsInput | null;
  create?: UserCreateWithoutApprovalsInput | null;
  update?: UserUpdateWithoutApprovalsInput | null;
  upsert?: UserUpsertWithoutApprovalsInput | null;
}

export interface UserUpdateOneRequiredWithoutCommentsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutCommentsInput | null;
  create?: UserCreateWithoutCommentsInput | null;
  update?: UserUpdateWithoutCommentsInput | null;
  upsert?: UserUpsertWithoutCommentsInput | null;
}

export interface UserUpdateOneRequiredWithoutGroupsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutGroupsInput | null;
  create?: UserCreateWithoutGroupsInput | null;
  update?: UserUpdateWithoutGroupsInput | null;
  upsert?: UserUpsertWithoutGroupsInput | null;
}

export interface UserUpdateOneRequiredWithoutReactionsInput {
  connect?: UserWhereUniqueInput | null;
  connectOrCreate?: UserCreateOrConnectWithoutReactionsInput | null;
  create?: UserCreateWithoutReactionsInput | null;
  update?: UserUpdateWithoutReactionsInput | null;
  upsert?: UserUpsertWithoutReactionsInput | null;
}

export interface UserUpdateWithoutApprovalsInput {
  comments?: CommentUpdateManyWithoutAuthorInput | null;
  contacts?: ContactUpdateManyWithoutUserInput | null;
  groups?: ApproverUpdateManyWithoutUserInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  reactions?: ReactionUpdateManyWithoutUserInput | null;
}

export interface UserUpdateWithoutCommentsInput {
  approvals?: ApprovalUpdateManyWithoutUserInput | null;
  contacts?: ContactUpdateManyWithoutUserInput | null;
  groups?: ApproverUpdateManyWithoutUserInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  reactions?: ReactionUpdateManyWithoutUserInput | null;
}

export interface UserUpdateWithoutGroupsInput {
  approvals?: ApprovalUpdateManyWithoutUserInput | null;
  comments?: CommentUpdateManyWithoutAuthorInput | null;
  contacts?: ContactUpdateManyWithoutUserInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  reactions?: ReactionUpdateManyWithoutUserInput | null;
}

export interface UserUpdateWithoutReactionsInput {
  approvals?: ApprovalUpdateManyWithoutUserInput | null;
  comments?: CommentUpdateManyWithoutAuthorInput | null;
  contacts?: ContactUpdateManyWithoutUserInput | null;
  groups?: ApproverUpdateManyWithoutUserInput | null;
  id?: StringFieldUpdateOperationsInput | null;
}

export interface UserUpsertWithoutApprovalsInput {
  create: UserCreateWithoutApprovalsInput;
  update: UserUpdateWithoutApprovalsInput;
}

export interface UserUpsertWithoutCommentsInput {
  create: UserCreateWithoutCommentsInput;
  update: UserUpdateWithoutCommentsInput;
}

export interface UserUpsertWithoutGroupsInput {
  create: UserCreateWithoutGroupsInput;
  update: UserUpdateWithoutGroupsInput;
}

export interface UserUpsertWithoutReactionsInput {
  create: UserCreateWithoutReactionsInput;
  update: UserUpdateWithoutReactionsInput;
}

export interface UserWhereUniqueInput {
  id?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
