import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Address: any;
  Bytes: any;
  Bytes4: any;
  Bytes8: any;
  Bytes32: any;
  DateTime: any;
  Decimal: any;
  Id: any;
  JSON: any;
  QuorumScalar: any;
  Uint256: any;
};

export type Account = {
  __typename?: 'Account';
  _count: AccountCount;
  approvals?: Maybe<Array<Approval>>;
  approvers?: Maybe<Array<Approver>>;
  comments?: Maybe<Array<Comment>>;
  deploySalt?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  impl?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  quorums?: Maybe<Array<Quorum>>;
  reactions?: Maybe<Array<Reaction>>;
  txs?: Maybe<Array<Tx>>;
  wallets?: Maybe<Array<Wallet>>;
};

export type AccountCount = {
  __typename?: 'AccountCount';
  approvals: Scalars['Int'];
  approvers: Scalars['Int'];
  comments: Scalars['Int'];
  quorums: Scalars['Int'];
  reactions: Scalars['Int'];
  txs: Scalars['Int'];
  wallets: Scalars['Int'];
};

export type AccountCreateNestedOneWithoutApprovalsInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<AccountCreateWithoutApprovalsInput>;
};

export type AccountCreateNestedOneWithoutApproversInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<AccountCreateWithoutApproversInput>;
};

export type AccountCreateNestedOneWithoutCommentsInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<AccountCreateWithoutCommentsInput>;
};

export type AccountCreateNestedOneWithoutQuorumsInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutQuorumsInput>;
  create?: InputMaybe<AccountCreateWithoutQuorumsInput>;
};

export type AccountCreateNestedOneWithoutReactionsInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<AccountCreateWithoutReactionsInput>;
};

export type AccountCreateNestedOneWithoutTxsInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutTxsInput>;
  create?: InputMaybe<AccountCreateWithoutTxsInput>;
};

export type AccountCreateNestedOneWithoutWalletsInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutWalletsInput>;
  create?: InputMaybe<AccountCreateWithoutWalletsInput>;
};

export type AccountCreateOrConnectWithoutApprovalsInput = {
  create: AccountCreateWithoutApprovalsInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateOrConnectWithoutApproversInput = {
  create: AccountCreateWithoutApproversInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateOrConnectWithoutCommentsInput = {
  create: AccountCreateWithoutCommentsInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateOrConnectWithoutQuorumsInput = {
  create: AccountCreateWithoutQuorumsInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateOrConnectWithoutReactionsInput = {
  create: AccountCreateWithoutReactionsInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateOrConnectWithoutTxsInput = {
  create: AccountCreateWithoutTxsInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateOrConnectWithoutWalletsInput = {
  create: AccountCreateWithoutWalletsInput;
  where: AccountWhereUniqueInput;
};

export type AccountCreateWithoutApprovalsInput = {
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutAccountInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutAccountInput>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutAccountInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutAccountInput>;
  wallets?: InputMaybe<WalletCreateNestedManyWithoutAccountInput>;
};

export type AccountCreateWithoutApproversInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutAccountInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutAccountInput>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutAccountInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutAccountInput>;
  wallets?: InputMaybe<WalletCreateNestedManyWithoutAccountInput>;
};

export type AccountCreateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutAccountInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutAccountInput>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutAccountInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutAccountInput>;
  wallets?: InputMaybe<WalletCreateNestedManyWithoutAccountInput>;
};

export type AccountCreateWithoutQuorumsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutAccountInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutAccountInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutAccountInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutAccountInput>;
  wallets?: InputMaybe<WalletCreateNestedManyWithoutAccountInput>;
};

export type AccountCreateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutAccountInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutAccountInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutAccountInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutAccountInput>;
  wallets?: InputMaybe<WalletCreateNestedManyWithoutAccountInput>;
};

export type AccountCreateWithoutTxsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutAccountInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutAccountInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutAccountInput>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutAccountInput>;
  wallets?: InputMaybe<WalletCreateNestedManyWithoutAccountInput>;
};

export type AccountCreateWithoutWalletsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutAccountInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutAccountInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAccountInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  impl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutAccountInput>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutAccountInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutAccountInput>;
};

export type AccountOrderByWithRelationInput = {
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  deploySalt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  impl?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  quorums?: InputMaybe<QuorumOrderByRelationAggregateInput>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
  txs?: InputMaybe<TxOrderByRelationAggregateInput>;
  wallets?: InputMaybe<WalletOrderByRelationAggregateInput>;
};

export type AccountRelationFilter = {
  is?: InputMaybe<AccountWhereInput>;
  isNot?: InputMaybe<AccountWhereInput>;
};

export enum AccountScalarFieldEnum {
  DeploySalt = 'deploySalt',
  Id = 'id',
  Impl = 'impl',
  Name = 'name'
}

export type AccountUpdateOneRequiredWithoutApprovalsNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<AccountCreateWithoutApprovalsInput>;
  update?: InputMaybe<AccountUpdateWithoutApprovalsInput>;
  upsert?: InputMaybe<AccountUpsertWithoutApprovalsInput>;
};

export type AccountUpdateOneRequiredWithoutApproversNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<AccountCreateWithoutApproversInput>;
  update?: InputMaybe<AccountUpdateWithoutApproversInput>;
  upsert?: InputMaybe<AccountUpsertWithoutApproversInput>;
};

export type AccountUpdateOneRequiredWithoutCommentsNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<AccountCreateWithoutCommentsInput>;
  update?: InputMaybe<AccountUpdateWithoutCommentsInput>;
  upsert?: InputMaybe<AccountUpsertWithoutCommentsInput>;
};

export type AccountUpdateOneRequiredWithoutQuorumsNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutQuorumsInput>;
  create?: InputMaybe<AccountCreateWithoutQuorumsInput>;
  update?: InputMaybe<AccountUpdateWithoutQuorumsInput>;
  upsert?: InputMaybe<AccountUpsertWithoutQuorumsInput>;
};

export type AccountUpdateOneRequiredWithoutReactionsNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<AccountCreateWithoutReactionsInput>;
  update?: InputMaybe<AccountUpdateWithoutReactionsInput>;
  upsert?: InputMaybe<AccountUpsertWithoutReactionsInput>;
};

export type AccountUpdateOneRequiredWithoutTxsNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutTxsInput>;
  create?: InputMaybe<AccountCreateWithoutTxsInput>;
  update?: InputMaybe<AccountUpdateWithoutTxsInput>;
  upsert?: InputMaybe<AccountUpsertWithoutTxsInput>;
};

export type AccountUpdateOneRequiredWithoutWalletsNestedInput = {
  connect?: InputMaybe<AccountWhereUniqueInput>;
  connectOrCreate?: InputMaybe<AccountCreateOrConnectWithoutWalletsInput>;
  create?: InputMaybe<AccountCreateWithoutWalletsInput>;
  update?: InputMaybe<AccountUpdateWithoutWalletsInput>;
  upsert?: InputMaybe<AccountUpsertWithoutWalletsInput>;
};

export type AccountUpdateWithoutApprovalsInput = {
  approvers?: InputMaybe<ApproverUpdateManyWithoutAccountNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutAccountNestedInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutAccountNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutAccountNestedInput>;
  wallets?: InputMaybe<WalletUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpdateWithoutApproversInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutAccountNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutAccountNestedInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutAccountNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutAccountNestedInput>;
  wallets?: InputMaybe<WalletUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpdateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutAccountNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutAccountNestedInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutAccountNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutAccountNestedInput>;
  wallets?: InputMaybe<WalletUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpdateWithoutQuorumsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutAccountNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutAccountNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutAccountNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutAccountNestedInput>;
  wallets?: InputMaybe<WalletUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpdateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutAccountNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutAccountNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutAccountNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutAccountNestedInput>;
  wallets?: InputMaybe<WalletUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpdateWithoutTxsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutAccountNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutAccountNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutAccountNestedInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutAccountNestedInput>;
  wallets?: InputMaybe<WalletUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpdateWithoutWalletsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutAccountNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutAccountNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAccountNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  impl?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutAccountNestedInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutAccountNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutAccountNestedInput>;
};

export type AccountUpsertWithoutApprovalsInput = {
  create: AccountCreateWithoutApprovalsInput;
  update: AccountUpdateWithoutApprovalsInput;
};

export type AccountUpsertWithoutApproversInput = {
  create: AccountCreateWithoutApproversInput;
  update: AccountUpdateWithoutApproversInput;
};

export type AccountUpsertWithoutCommentsInput = {
  create: AccountCreateWithoutCommentsInput;
  update: AccountUpdateWithoutCommentsInput;
};

export type AccountUpsertWithoutQuorumsInput = {
  create: AccountCreateWithoutQuorumsInput;
  update: AccountUpdateWithoutQuorumsInput;
};

export type AccountUpsertWithoutReactionsInput = {
  create: AccountCreateWithoutReactionsInput;
  update: AccountUpdateWithoutReactionsInput;
};

export type AccountUpsertWithoutTxsInput = {
  create: AccountCreateWithoutTxsInput;
  update: AccountUpdateWithoutTxsInput;
};

export type AccountUpsertWithoutWalletsInput = {
  create: AccountCreateWithoutWalletsInput;
  update: AccountUpdateWithoutWalletsInput;
};

export type AccountWhereInput = {
  AND?: InputMaybe<Array<AccountWhereInput>>;
  NOT?: InputMaybe<Array<AccountWhereInput>>;
  OR?: InputMaybe<Array<AccountWhereInput>>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  comments?: InputMaybe<CommentListRelationFilter>;
  deploySalt?: InputMaybe<StringNullableFilter>;
  id?: InputMaybe<StringFilter>;
  impl?: InputMaybe<StringNullableFilter>;
  name?: InputMaybe<StringFilter>;
  quorums?: InputMaybe<QuorumListRelationFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
  txs?: InputMaybe<TxListRelationFilter>;
  wallets?: InputMaybe<WalletListRelationFilter>;
};

export type AccountWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Approval = {
  __typename?: 'Approval';
  account: Account;
  accountId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  signature: Scalars['String'];
  tx: Tx;
  txHash: Scalars['String'];
  user: User;
  userId: Scalars['String'];
};

export type ApprovalAccountIdTxHashUserIdCompoundUniqueInput = {
  accountId: Scalars['String'];
  txHash: Scalars['String'];
  userId: Scalars['String'];
};

export type ApprovalCreateManyAccountInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  txHash: Scalars['String'];
  userId: Scalars['String'];
};

export type ApprovalCreateManyAccountInputEnvelope = {
  data: Array<ApprovalCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApprovalCreateManyTxInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  userId: Scalars['String'];
};

export type ApprovalCreateManyTxInputEnvelope = {
  data: Array<ApprovalCreateManyTxInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApprovalCreateManyUserInput = {
  accountId: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  txHash: Scalars['String'];
};

export type ApprovalCreateManyUserInputEnvelope = {
  data: Array<ApprovalCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApprovalCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutAccountInput>>;
  createMany?: InputMaybe<ApprovalCreateManyAccountInputEnvelope>;
};

export type ApprovalCreateNestedManyWithoutTxInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutTxInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutTxInput>>;
  createMany?: InputMaybe<ApprovalCreateManyTxInputEnvelope>;
};

export type ApprovalCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutUserInput>>;
  createMany?: InputMaybe<ApprovalCreateManyUserInputEnvelope>;
};

export type ApprovalCreateOrConnectWithoutAccountInput = {
  create: ApprovalCreateWithoutAccountInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalCreateOrConnectWithoutTxInput = {
  create: ApprovalCreateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalCreateOrConnectWithoutUserInput = {
  create: ApprovalCreateWithoutUserInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalCreateWithoutAccountInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  tx: TxCreateNestedOneWithoutApprovalsInput;
  user: UserCreateNestedOneWithoutApprovalsInput;
};

export type ApprovalCreateWithoutTxInput = {
  account: AccountCreateNestedOneWithoutApprovalsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  user: UserCreateNestedOneWithoutApprovalsInput;
};

export type ApprovalCreateWithoutUserInput = {
  account: AccountCreateNestedOneWithoutApprovalsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  tx: TxCreateNestedOneWithoutApprovalsInput;
};

export type ApprovalListRelationFilter = {
  every?: InputMaybe<ApprovalWhereInput>;
  none?: InputMaybe<ApprovalWhereInput>;
  some?: InputMaybe<ApprovalWhereInput>;
};

export type ApprovalOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ApprovalScalarWhereInput = {
  AND?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  NOT?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  OR?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  signature?: InputMaybe<StringFilter>;
  txHash?: InputMaybe<StringFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ApprovalUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type ApprovalUpdateManyWithWhereWithoutAccountInput = {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
};

export type ApprovalUpdateManyWithWhereWithoutTxInput = {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
};

export type ApprovalUpdateManyWithWhereWithoutUserInput = {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
};

export type ApprovalUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutAccountInput>>;
  createMany?: InputMaybe<ApprovalCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  set?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  update?: InputMaybe<Array<ApprovalUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<ApprovalUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<ApprovalUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type ApprovalUpdateManyWithoutTxNestedInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutTxInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutTxInput>>;
  createMany?: InputMaybe<ApprovalCreateManyTxInputEnvelope>;
  delete?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  set?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  update?: InputMaybe<Array<ApprovalUpdateWithWhereUniqueWithoutTxInput>>;
  updateMany?: InputMaybe<Array<ApprovalUpdateManyWithWhereWithoutTxInput>>;
  upsert?: InputMaybe<Array<ApprovalUpsertWithWhereUniqueWithoutTxInput>>;
};

export type ApprovalUpdateManyWithoutUserNestedInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutUserInput>>;
  createMany?: InputMaybe<ApprovalCreateManyUserInputEnvelope>;
  delete?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  set?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  update?: InputMaybe<Array<ApprovalUpdateWithWhereUniqueWithoutUserInput>>;
  updateMany?: InputMaybe<Array<ApprovalUpdateManyWithWhereWithoutUserInput>>;
  upsert?: InputMaybe<Array<ApprovalUpsertWithWhereUniqueWithoutUserInput>>;
};

export type ApprovalUpdateWithWhereUniqueWithoutAccountInput = {
  data: ApprovalUpdateWithoutAccountInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalUpdateWithWhereUniqueWithoutTxInput = {
  data: ApprovalUpdateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalUpdateWithWhereUniqueWithoutUserInput = {
  data: ApprovalUpdateWithoutUserInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalUpdateWithoutAccountInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
  tx?: InputMaybe<TxUpdateOneRequiredWithoutApprovalsNestedInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApprovalsNestedInput>;
};

export type ApprovalUpdateWithoutTxInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutApprovalsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApprovalsNestedInput>;
};

export type ApprovalUpdateWithoutUserInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutApprovalsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
  tx?: InputMaybe<TxUpdateOneRequiredWithoutApprovalsNestedInput>;
};

export type ApprovalUpsertWithWhereUniqueWithoutAccountInput = {
  create: ApprovalCreateWithoutAccountInput;
  update: ApprovalUpdateWithoutAccountInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalUpsertWithWhereUniqueWithoutTxInput = {
  create: ApprovalCreateWithoutTxInput;
  update: ApprovalUpdateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalUpsertWithWhereUniqueWithoutUserInput = {
  create: ApprovalCreateWithoutUserInput;
  update: ApprovalUpdateWithoutUserInput;
  where: ApprovalWhereUniqueInput;
};

export type ApprovalWhereInput = {
  AND?: InputMaybe<Array<ApprovalWhereInput>>;
  NOT?: InputMaybe<Array<ApprovalWhereInput>>;
  OR?: InputMaybe<Array<ApprovalWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  signature?: InputMaybe<StringFilter>;
  tx?: InputMaybe<TxRelationFilter>;
  txHash?: InputMaybe<StringFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ApprovalWhereUniqueInput = {
  accountId_txHash_userId?: InputMaybe<ApprovalAccountIdTxHashUserIdCompoundUniqueInput>;
};

export type Approver = {
  __typename?: 'Approver';
  account: Account;
  accountId: Scalars['String'];
  id: Scalars['String'];
  quorum: Quorum;
  quorumHash: Scalars['String'];
  user: User;
  userId: Scalars['String'];
  wallet: Wallet;
  walletRef: Scalars['String'];
};

export type ApproverAccountIdWalletRefQuorumHashUserIdCompoundUniqueInput = {
  accountId: Scalars['String'];
  quorumHash: Scalars['String'];
  userId: Scalars['String'];
  walletRef: Scalars['String'];
};

export type ApproverCreateManyAccountInput = {
  quorumHash: Scalars['String'];
  userId: Scalars['String'];
  walletRef: Scalars['String'];
};

export type ApproverCreateManyAccountInputEnvelope = {
  data: Array<ApproverCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApproverCreateManyQuorumInput = {
  userId: Scalars['String'];
};

export type ApproverCreateManyQuorumInputEnvelope = {
  data: Array<ApproverCreateManyQuorumInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApproverCreateManyUserInput = {
  accountId: Scalars['String'];
  quorumHash: Scalars['String'];
  walletRef: Scalars['String'];
};

export type ApproverCreateManyUserInputEnvelope = {
  data: Array<ApproverCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApproverCreateManyWalletInput = {
  quorumHash: Scalars['String'];
  userId: Scalars['String'];
};

export type ApproverCreateManyWalletInputEnvelope = {
  data: Array<ApproverCreateManyWalletInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApproverCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutAccountInput>>;
  createMany?: InputMaybe<ApproverCreateManyAccountInputEnvelope>;
};

export type ApproverCreateNestedManyWithoutQuorumInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutQuorumInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutQuorumInput>>;
  createMany?: InputMaybe<ApproverCreateManyQuorumInputEnvelope>;
};

export type ApproverCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutUserInput>>;
  createMany?: InputMaybe<ApproverCreateManyUserInputEnvelope>;
};

export type ApproverCreateNestedManyWithoutWalletInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutWalletInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutWalletInput>>;
  createMany?: InputMaybe<ApproverCreateManyWalletInputEnvelope>;
};

export type ApproverCreateOrConnectWithoutAccountInput = {
  create: ApproverCreateWithoutAccountInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverCreateOrConnectWithoutQuorumInput = {
  create: ApproverCreateWithoutQuorumInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverCreateOrConnectWithoutUserInput = {
  create: ApproverCreateWithoutUserInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverCreateOrConnectWithoutWalletInput = {
  create: ApproverCreateWithoutWalletInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverCreateWithoutAccountInput = {
  quorum: QuorumCreateNestedOneWithoutApproversInput;
  user: UserCreateNestedOneWithoutApproversInput;
  wallet: WalletCreateNestedOneWithoutApproversInput;
};

export type ApproverCreateWithoutQuorumInput = {
  account: AccountCreateNestedOneWithoutApproversInput;
  user: UserCreateNestedOneWithoutApproversInput;
  wallet: WalletCreateNestedOneWithoutApproversInput;
};

export type ApproverCreateWithoutUserInput = {
  account: AccountCreateNestedOneWithoutApproversInput;
  quorum: QuorumCreateNestedOneWithoutApproversInput;
  wallet: WalletCreateNestedOneWithoutApproversInput;
};

export type ApproverCreateWithoutWalletInput = {
  account: AccountCreateNestedOneWithoutApproversInput;
  quorum: QuorumCreateNestedOneWithoutApproversInput;
  user: UserCreateNestedOneWithoutApproversInput;
};

export type ApproverListRelationFilter = {
  every?: InputMaybe<ApproverWhereInput>;
  none?: InputMaybe<ApproverWhereInput>;
  some?: InputMaybe<ApproverWhereInput>;
};

export type ApproverOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ApproverScalarWhereInput = {
  AND?: InputMaybe<Array<ApproverScalarWhereInput>>;
  NOT?: InputMaybe<Array<ApproverScalarWhereInput>>;
  OR?: InputMaybe<Array<ApproverScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  quorumHash?: InputMaybe<StringFilter>;
  userId?: InputMaybe<StringFilter>;
  walletRef?: InputMaybe<StringFilter>;
};

export type ApproverUncheckedUpdateManyWithoutApproversInput = {
  accountId?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorumHash?: InputMaybe<StringFieldUpdateOperationsInput>;
  walletRef?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type ApproverUpdateManyWithWhereWithoutAccountInput = {
  data: ApproverUncheckedUpdateManyWithoutApproversInput;
  where: ApproverScalarWhereInput;
};

export type ApproverUpdateManyWithWhereWithoutQuorumInput = {
  data: ApproverUncheckedUpdateManyWithoutApproversInput;
  where: ApproverScalarWhereInput;
};

export type ApproverUpdateManyWithWhereWithoutUserInput = {
  data: ApproverUncheckedUpdateManyWithoutApproversInput;
  where: ApproverScalarWhereInput;
};

export type ApproverUpdateManyWithWhereWithoutWalletInput = {
  data: ApproverUncheckedUpdateManyWithoutApproversInput;
  where: ApproverScalarWhereInput;
};

export type ApproverUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutAccountInput>>;
  createMany?: InputMaybe<ApproverCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApproverScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  set?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  update?: InputMaybe<Array<ApproverUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<ApproverUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<ApproverUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type ApproverUpdateManyWithoutQuorumNestedInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutQuorumInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutQuorumInput>>;
  createMany?: InputMaybe<ApproverCreateManyQuorumInputEnvelope>;
  delete?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApproverScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  set?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  update?: InputMaybe<Array<ApproverUpdateWithWhereUniqueWithoutQuorumInput>>;
  updateMany?: InputMaybe<Array<ApproverUpdateManyWithWhereWithoutQuorumInput>>;
  upsert?: InputMaybe<Array<ApproverUpsertWithWhereUniqueWithoutQuorumInput>>;
};

export type ApproverUpdateManyWithoutUserNestedInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutUserInput>>;
  createMany?: InputMaybe<ApproverCreateManyUserInputEnvelope>;
  delete?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApproverScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  set?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  update?: InputMaybe<Array<ApproverUpdateWithWhereUniqueWithoutUserInput>>;
  updateMany?: InputMaybe<Array<ApproverUpdateManyWithWhereWithoutUserInput>>;
  upsert?: InputMaybe<Array<ApproverUpsertWithWhereUniqueWithoutUserInput>>;
};

export type ApproverUpdateManyWithoutWalletNestedInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutWalletInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutWalletInput>>;
  createMany?: InputMaybe<ApproverCreateManyWalletInputEnvelope>;
  delete?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApproverScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  set?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  update?: InputMaybe<Array<ApproverUpdateWithWhereUniqueWithoutWalletInput>>;
  updateMany?: InputMaybe<Array<ApproverUpdateManyWithWhereWithoutWalletInput>>;
  upsert?: InputMaybe<Array<ApproverUpsertWithWhereUniqueWithoutWalletInput>>;
};

export type ApproverUpdateWithWhereUniqueWithoutAccountInput = {
  data: ApproverUpdateWithoutAccountInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpdateWithWhereUniqueWithoutQuorumInput = {
  data: ApproverUpdateWithoutQuorumInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpdateWithWhereUniqueWithoutUserInput = {
  data: ApproverUpdateWithoutUserInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpdateWithWhereUniqueWithoutWalletInput = {
  data: ApproverUpdateWithoutWalletInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpdateWithoutAccountInput = {
  quorum?: InputMaybe<QuorumUpdateOneRequiredWithoutApproversNestedInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApproversNestedInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutApproversNestedInput>;
};

export type ApproverUpdateWithoutQuorumInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutApproversNestedInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApproversNestedInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutApproversNestedInput>;
};

export type ApproverUpdateWithoutUserInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutApproversNestedInput>;
  quorum?: InputMaybe<QuorumUpdateOneRequiredWithoutApproversNestedInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutApproversNestedInput>;
};

export type ApproverUpdateWithoutWalletInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutApproversNestedInput>;
  quorum?: InputMaybe<QuorumUpdateOneRequiredWithoutApproversNestedInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApproversNestedInput>;
};

export type ApproverUpsertWithWhereUniqueWithoutAccountInput = {
  create: ApproverCreateWithoutAccountInput;
  update: ApproverUpdateWithoutAccountInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpsertWithWhereUniqueWithoutQuorumInput = {
  create: ApproverCreateWithoutQuorumInput;
  update: ApproverUpdateWithoutQuorumInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpsertWithWhereUniqueWithoutUserInput = {
  create: ApproverCreateWithoutUserInput;
  update: ApproverUpdateWithoutUserInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpsertWithWhereUniqueWithoutWalletInput = {
  create: ApproverCreateWithoutWalletInput;
  update: ApproverUpdateWithoutWalletInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverWhereInput = {
  AND?: InputMaybe<Array<ApproverWhereInput>>;
  NOT?: InputMaybe<Array<ApproverWhereInput>>;
  OR?: InputMaybe<Array<ApproverWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  quorum?: InputMaybe<QuorumRelationFilter>;
  quorumHash?: InputMaybe<StringFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
  wallet?: InputMaybe<WalletRelationFilter>;
  walletRef?: InputMaybe<StringFilter>;
};

export type ApproverWhereUniqueInput = {
  accountId_walletRef_quorumHash_userId?: InputMaybe<ApproverAccountIdWalletRefQuorumHashUserIdCompoundUniqueInput>;
};

export type BoolFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['Boolean']>;
};

export type BoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<NestedBoolFilter>;
};

export type Comment = {
  __typename?: 'Comment';
  _count: CommentCount;
  account: Account;
  accountId: Scalars['String'];
  author: User;
  authorId: Scalars['String'];
  content: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['String'];
  key: Scalars['String'];
  nonce: Scalars['Int'];
  reactions?: Maybe<Array<Reaction>>;
  updatedAt: Scalars['DateTime'];
};

export type CommentAccountIdKeyNonceCompoundUniqueInput = {
  accountId: Scalars['String'];
  key: Scalars['String'];
  nonce: Scalars['Int'];
};

export type CommentCount = {
  __typename?: 'CommentCount';
  reactions: Scalars['Int'];
};

export type CommentCreateManyAccountInput = {
  authorId: Scalars['String'];
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateManyAccountInputEnvelope = {
  data: Array<CommentCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type CommentCreateManyAuthorInput = {
  accountId: Scalars['String'];
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateManyAuthorInputEnvelope = {
  data: Array<CommentCreateManyAuthorInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type CommentCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutAccountInput>>;
  createMany?: InputMaybe<CommentCreateManyAccountInputEnvelope>;
};

export type CommentCreateNestedManyWithoutAuthorInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutAuthorInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutAuthorInput>>;
  createMany?: InputMaybe<CommentCreateManyAuthorInputEnvelope>;
};

export type CommentCreateNestedOneWithoutReactionsInput = {
  connect?: InputMaybe<CommentWhereUniqueInput>;
  connectOrCreate?: InputMaybe<CommentCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<CommentCreateWithoutReactionsInput>;
};

export type CommentCreateOrConnectWithoutAccountInput = {
  create: CommentCreateWithoutAccountInput;
  where: CommentWhereUniqueInput;
};

export type CommentCreateOrConnectWithoutAuthorInput = {
  create: CommentCreateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
};

export type CommentCreateOrConnectWithoutReactionsInput = {
  create: CommentCreateWithoutReactionsInput;
  where: CommentWhereUniqueInput;
};

export type CommentCreateWithoutAccountInput = {
  author: UserCreateNestedOneWithoutCommentsInput;
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutCommentInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateWithoutAuthorInput = {
  account: AccountCreateNestedOneWithoutCommentsInput;
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutCommentInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateWithoutReactionsInput = {
  account: AccountCreateNestedOneWithoutCommentsInput;
  author: UserCreateNestedOneWithoutCommentsInput;
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentListRelationFilter = {
  every?: InputMaybe<CommentWhereInput>;
  none?: InputMaybe<CommentWhereInput>;
  some?: InputMaybe<CommentWhereInput>;
};

export type CommentOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type CommentRelationFilter = {
  is?: InputMaybe<CommentWhereInput>;
  isNot?: InputMaybe<CommentWhereInput>;
};

export type CommentScalarWhereInput = {
  AND?: InputMaybe<Array<CommentScalarWhereInput>>;
  NOT?: InputMaybe<Array<CommentScalarWhereInput>>;
  OR?: InputMaybe<Array<CommentScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  authorId?: InputMaybe<StringFilter>;
  content?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentUpdateManyMutationInput = {
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpdateManyWithWhereWithoutAccountInput = {
  data: CommentUpdateManyMutationInput;
  where: CommentScalarWhereInput;
};

export type CommentUpdateManyWithWhereWithoutAuthorInput = {
  data: CommentUpdateManyMutationInput;
  where: CommentScalarWhereInput;
};

export type CommentUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutAccountInput>>;
  createMany?: InputMaybe<CommentCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<CommentWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<CommentScalarWhereInput>>;
  disconnect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentWhereUniqueInput>>;
  update?: InputMaybe<Array<CommentUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<CommentUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<CommentUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type CommentUpdateManyWithoutAuthorNestedInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutAuthorInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutAuthorInput>>;
  createMany?: InputMaybe<CommentCreateManyAuthorInputEnvelope>;
  delete?: InputMaybe<Array<CommentWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<CommentScalarWhereInput>>;
  disconnect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentWhereUniqueInput>>;
  update?: InputMaybe<Array<CommentUpdateWithWhereUniqueWithoutAuthorInput>>;
  updateMany?: InputMaybe<Array<CommentUpdateManyWithWhereWithoutAuthorInput>>;
  upsert?: InputMaybe<Array<CommentUpsertWithWhereUniqueWithoutAuthorInput>>;
};

export type CommentUpdateOneRequiredWithoutReactionsNestedInput = {
  connect?: InputMaybe<CommentWhereUniqueInput>;
  connectOrCreate?: InputMaybe<CommentCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<CommentCreateWithoutReactionsInput>;
  update?: InputMaybe<CommentUpdateWithoutReactionsInput>;
  upsert?: InputMaybe<CommentUpsertWithoutReactionsInput>;
};

export type CommentUpdateWithWhereUniqueWithoutAccountInput = {
  data: CommentUpdateWithoutAccountInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpdateWithWhereUniqueWithoutAuthorInput = {
  data: CommentUpdateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpdateWithoutAccountInput = {
  author?: InputMaybe<UserUpdateOneRequiredWithoutCommentsNestedInput>;
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutCommentNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpdateWithoutAuthorInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutCommentsNestedInput>;
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutCommentNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpdateWithoutReactionsInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutCommentsNestedInput>;
  author?: InputMaybe<UserUpdateOneRequiredWithoutCommentsNestedInput>;
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpsertWithWhereUniqueWithoutAccountInput = {
  create: CommentCreateWithoutAccountInput;
  update: CommentUpdateWithoutAccountInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpsertWithWhereUniqueWithoutAuthorInput = {
  create: CommentCreateWithoutAuthorInput;
  update: CommentUpdateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpsertWithoutReactionsInput = {
  create: CommentCreateWithoutReactionsInput;
  update: CommentUpdateWithoutReactionsInput;
};

export type CommentWhereInput = {
  AND?: InputMaybe<Array<CommentWhereInput>>;
  NOT?: InputMaybe<Array<CommentWhereInput>>;
  OR?: InputMaybe<Array<CommentWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  author?: InputMaybe<UserRelationFilter>;
  authorId?: InputMaybe<StringFilter>;
  content?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentWhereUniqueInput = {
  accountId_key_nonce?: InputMaybe<CommentAccountIdKeyNonceCompoundUniqueInput>;
};

export type Contact = {
  __typename?: 'Contact';
  addr: Scalars['String'];
  id: Scalars['String'];
  name: Scalars['String'];
  user: User;
  userId: Scalars['String'];
};

export type ContactCreateManyUserInput = {
  addr: Scalars['String'];
  name: Scalars['String'];
};

export type ContactCreateManyUserInputEnvelope = {
  data: Array<ContactCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ContactCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<ContactWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ContactCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ContactCreateWithoutUserInput>>;
  createMany?: InputMaybe<ContactCreateManyUserInputEnvelope>;
};

export type ContactCreateOrConnectWithoutUserInput = {
  create: ContactCreateWithoutUserInput;
  where: ContactWhereUniqueInput;
};

export type ContactCreateWithoutUserInput = {
  addr: Scalars['String'];
  name: Scalars['String'];
};

export type ContactListRelationFilter = {
  every?: InputMaybe<ContactWhereInput>;
  none?: InputMaybe<ContactWhereInput>;
  some?: InputMaybe<ContactWhereInput>;
};

export type ContactName_IdentifierCompoundUniqueInput = {
  name: Scalars['String'];
  userId: Scalars['String'];
};

export type ContactOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ContactOrderByWithRelationInput = {
  addr?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
  userId?: InputMaybe<SortOrder>;
};

export enum ContactScalarFieldEnum {
  Addr = 'addr',
  Name = 'name',
  UserId = 'userId'
}

export type ContactScalarWhereInput = {
  AND?: InputMaybe<Array<ContactScalarWhereInput>>;
  NOT?: InputMaybe<Array<ContactScalarWhereInput>>;
  OR?: InputMaybe<Array<ContactScalarWhereInput>>;
  addr?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ContactUpdateManyMutationInput = {
  addr?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type ContactUpdateManyWithWhereWithoutUserInput = {
  data: ContactUpdateManyMutationInput;
  where: ContactScalarWhereInput;
};

export type ContactUpdateManyWithoutUserNestedInput = {
  connect?: InputMaybe<Array<ContactWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ContactCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ContactCreateWithoutUserInput>>;
  createMany?: InputMaybe<ContactCreateManyUserInputEnvelope>;
  delete?: InputMaybe<Array<ContactWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ContactScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ContactWhereUniqueInput>>;
  set?: InputMaybe<Array<ContactWhereUniqueInput>>;
  update?: InputMaybe<Array<ContactUpdateWithWhereUniqueWithoutUserInput>>;
  updateMany?: InputMaybe<Array<ContactUpdateManyWithWhereWithoutUserInput>>;
  upsert?: InputMaybe<Array<ContactUpsertWithWhereUniqueWithoutUserInput>>;
};

export type ContactUpdateWithWhereUniqueWithoutUserInput = {
  data: ContactUpdateWithoutUserInput;
  where: ContactWhereUniqueInput;
};

export type ContactUpdateWithoutUserInput = {
  addr?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type ContactUpsertWithWhereUniqueWithoutUserInput = {
  create: ContactCreateWithoutUserInput;
  update: ContactUpdateWithoutUserInput;
  where: ContactWhereUniqueInput;
};

export type ContactUserIdAddrCompoundUniqueInput = {
  addr: Scalars['String'];
  userId: Scalars['String'];
};

export type ContactWhereInput = {
  AND?: InputMaybe<Array<ContactWhereInput>>;
  NOT?: InputMaybe<Array<ContactWhereInput>>;
  OR?: InputMaybe<Array<ContactWhereInput>>;
  addr?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ContactWhereUniqueInput = {
  name_identifier?: InputMaybe<ContactName_IdentifierCompoundUniqueInput>;
  userId_addr?: InputMaybe<ContactUserIdAddrCompoundUniqueInput>;
};

export type ContractMethod = {
  __typename?: 'ContractMethod';
  contract: Scalars['String'];
  fragment: Scalars['JSON'];
  id: Scalars['String'];
  sighash: Scalars['String'];
};

export type DateTimeFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['DateTime']>;
};

export type DateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type DecimalFieldUpdateOperationsInput = {
  decrement?: InputMaybe<Scalars['Decimal']>;
  divide?: InputMaybe<Scalars['Decimal']>;
  increment?: InputMaybe<Scalars['Decimal']>;
  multiply?: InputMaybe<Scalars['Decimal']>;
  set?: InputMaybe<Scalars['Decimal']>;
};

export type DecimalFilter = {
  equals?: InputMaybe<Scalars['Decimal']>;
  gt?: InputMaybe<Scalars['Decimal']>;
  gte?: InputMaybe<Scalars['Decimal']>;
  in?: InputMaybe<Array<Scalars['Decimal']>>;
  lt?: InputMaybe<Scalars['Decimal']>;
  lte?: InputMaybe<Scalars['Decimal']>;
  not?: InputMaybe<NestedDecimalFilter>;
  notIn?: InputMaybe<Array<Scalars['Decimal']>>;
};

export type DecimalNullableFilter = {
  equals?: InputMaybe<Scalars['Decimal']>;
  gt?: InputMaybe<Scalars['Decimal']>;
  gte?: InputMaybe<Scalars['Decimal']>;
  in?: InputMaybe<Array<Scalars['Decimal']>>;
  lt?: InputMaybe<Scalars['Decimal']>;
  lte?: InputMaybe<Scalars['Decimal']>;
  not?: InputMaybe<NestedDecimalNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Decimal']>>;
};

export type DeleteContactResp = {
  __typename?: 'DeleteContactResp';
  id: Scalars['String'];
};

export type IntFieldUpdateOperationsInput = {
  decrement?: InputMaybe<Scalars['Int']>;
  divide?: InputMaybe<Scalars['Int']>;
  increment?: InputMaybe<Scalars['Int']>;
  multiply?: InputMaybe<Scalars['Int']>;
  set?: InputMaybe<Scalars['Int']>;
};

export type IntFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  approve?: Maybe<Tx>;
  createAccount: Account;
  createComment: Comment;
  deleteComment?: Maybe<Comment>;
  deleteContact: DeleteContactResp;
  deleteWallet: Scalars['Boolean'];
  proposeTx: Tx;
  reactToComment?: Maybe<Reaction>;
  requestFunds: Scalars['Boolean'];
  revokeApproval: RevokeApprovalResp;
  setAccountName: Account;
  setTxWallet?: Maybe<Tx>;
  setWalletName: Wallet;
  submitTxExecution: Submission;
  upsertContact?: Maybe<Contact>;
  upsertUser: User;
  upsertWallet?: Maybe<Wallet>;
};


export type MutationApproveArgs = {
  account: Scalars['Address'];
  hash: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
};


export type MutationCreateAccountArgs = {
  account: Scalars['Address'];
  deploySalt?: InputMaybe<Scalars['Bytes32']>;
  impl: Scalars['Address'];
  name: Scalars['String'];
  wallets?: InputMaybe<Array<WalletWithoutAccountInput>>;
};


export type MutationCreateCommentArgs = {
  account: Scalars['Address'];
  content: Scalars['String'];
  key: Scalars['Id'];
};


export type MutationDeleteCommentArgs = {
  account: Scalars['Address'];
  key: Scalars['Id'];
  nonce: Scalars['Int'];
};


export type MutationDeleteContactArgs = {
  addr: Scalars['Address'];
};


export type MutationDeleteWalletArgs = {
  id: WalletId;
  proposalHash?: InputMaybe<Scalars['Bytes32']>;
};


export type MutationProposeTxArgs = {
  account: Scalars['Address'];
  signature: Scalars['Bytes'];
  tx: TxInput;
  walletRef: Scalars['Bytes4'];
};


export type MutationReactToCommentArgs = {
  account: Scalars['Address'];
  emojis: Array<Scalars['String']>;
  key: Scalars['Id'];
  nonce: Scalars['Int'];
};


export type MutationRequestFundsArgs = {
  recipient: Scalars['Address'];
};


export type MutationRevokeApprovalArgs = {
  account: Scalars['Address'];
  hash: Scalars['Bytes32'];
};


export type MutationSetAccountNameArgs = {
  id: Scalars['Address'];
  name: Scalars['String'];
};


export type MutationSetTxWalletArgs = {
  account: Scalars['Address'];
  hash: Scalars['Bytes32'];
  walletRef: Scalars['Bytes4'];
};


export type MutationSetWalletNameArgs = {
  id: WalletId;
  name: Scalars['String'];
};


export type MutationSubmitTxExecutionArgs = {
  account: Scalars['Address'];
  submission: SubmissionInput;
  txHash: Scalars['Bytes32'];
};


export type MutationUpsertContactArgs = {
  name: Scalars['String'];
  newAddr: Scalars['Address'];
  prevAddr?: InputMaybe<Scalars['Address']>;
};


export type MutationUpsertUserArgs = {
  create: UserCreateInput;
  update: UserUpdateInput;
  where: UserWhereUniqueInput;
};


export type MutationUpsertWalletArgs = {
  id: WalletId;
  name?: InputMaybe<Scalars['String']>;
  proposalHash: Scalars['Bytes32'];
  quorums: Array<Scalars['QuorumScalar']>;
};

export type NestedBoolFilter = {
  equals?: InputMaybe<Scalars['Boolean']>;
  not?: InputMaybe<NestedBoolFilter>;
};

export type NestedDateTimeFilter = {
  equals?: InputMaybe<Scalars['DateTime']>;
  gt?: InputMaybe<Scalars['DateTime']>;
  gte?: InputMaybe<Scalars['DateTime']>;
  in?: InputMaybe<Array<Scalars['DateTime']>>;
  lt?: InputMaybe<Scalars['DateTime']>;
  lte?: InputMaybe<Scalars['DateTime']>;
  not?: InputMaybe<NestedDateTimeFilter>;
  notIn?: InputMaybe<Array<Scalars['DateTime']>>;
};

export type NestedDecimalFilter = {
  equals?: InputMaybe<Scalars['Decimal']>;
  gt?: InputMaybe<Scalars['Decimal']>;
  gte?: InputMaybe<Scalars['Decimal']>;
  in?: InputMaybe<Array<Scalars['Decimal']>>;
  lt?: InputMaybe<Scalars['Decimal']>;
  lte?: InputMaybe<Scalars['Decimal']>;
  not?: InputMaybe<NestedDecimalFilter>;
  notIn?: InputMaybe<Array<Scalars['Decimal']>>;
};

export type NestedDecimalNullableFilter = {
  equals?: InputMaybe<Scalars['Decimal']>;
  gt?: InputMaybe<Scalars['Decimal']>;
  gte?: InputMaybe<Scalars['Decimal']>;
  in?: InputMaybe<Array<Scalars['Decimal']>>;
  lt?: InputMaybe<Scalars['Decimal']>;
  lte?: InputMaybe<Scalars['Decimal']>;
  not?: InputMaybe<NestedDecimalNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Decimal']>>;
};

export type NestedIntFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export type NestedStringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NestedStringFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type NestedStringNullableFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  not?: InputMaybe<NestedStringNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type NullableDecimalFieldUpdateOperationsInput = {
  decrement?: InputMaybe<Scalars['Decimal']>;
  divide?: InputMaybe<Scalars['Decimal']>;
  increment?: InputMaybe<Scalars['Decimal']>;
  multiply?: InputMaybe<Scalars['Decimal']>;
  set?: InputMaybe<Scalars['Decimal']>;
};

export type NullableStringFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: Array<Account>;
  addrName?: Maybe<Scalars['String']>;
  comments: Array<Comment>;
  contact?: Maybe<Contact>;
  contacts: Array<Contact>;
  contractMethod?: Maybe<ContractMethod>;
  submissions: Array<Submission>;
  tx?: Maybe<Tx>;
  txs: Array<Tx>;
  user?: Maybe<User>;
  userAccounts: Array<Account>;
  userWallets: Array<Wallet>;
  wallet?: Maybe<Wallet>;
  wallets: Array<Wallet>;
};


export type QueryAccountArgs = {
  id: Scalars['Address'];
};


export type QueryAccountsArgs = {
  cursor?: InputMaybe<AccountWhereUniqueInput>;
  distinct?: InputMaybe<Array<AccountScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<AccountOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AccountWhereInput>;
};


export type QueryAddrNameArgs = {
  addr: Scalars['String'];
};


export type QueryCommentsArgs = {
  account: Scalars['Address'];
  key: Scalars['Id'];
};


export type QueryContactArgs = {
  where: ContactWhereUniqueInput;
};


export type QueryContactsArgs = {
  cursor?: InputMaybe<ContactWhereUniqueInput>;
  distinct?: InputMaybe<Array<ContactScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<ContactOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
};


export type QueryContractMethodArgs = {
  contract: Scalars['Address'];
  sighash: Scalars['Bytes'];
};


export type QuerySubmissionsArgs = {
  account: Scalars['Address'];
  txHash: Scalars['Bytes32'];
};


export type QueryTxArgs = {
  account: Scalars['Address'];
  hash: Scalars['Bytes32'];
};


export type QueryTxsArgs = {
  accounts: Array<Scalars['Address']>;
};


export type QueryWalletArgs = {
  id: WalletId;
};


export type QueryWalletsArgs = {
  cursor?: InputMaybe<WalletWhereUniqueInput>;
  distinct?: InputMaybe<Array<WalletScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<WalletOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<WalletWhereInput>;
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export type Quorum = {
  __typename?: 'Quorum';
  _count: QuorumCount;
  account: Account;
  accountId: Scalars['String'];
  approvers?: Maybe<Array<Approver>>;
  createProposal?: Maybe<Tx>;
  createProposalHash?: Maybe<Scalars['String']>;
  hash: Scalars['String'];
  removeProposal?: Maybe<Tx>;
  removeProposalAccountId?: Maybe<Scalars['String']>;
  removeProposalHash?: Maybe<Scalars['String']>;
  wallet: Wallet;
  walletRef: Scalars['String'];
};

export type QuorumAccountIdWalletRefHashCompoundUniqueInput = {
  accountId: Scalars['String'];
  hash: Scalars['String'];
  walletRef: Scalars['String'];
};

export type QuorumCount = {
  __typename?: 'QuorumCount';
  approvers: Scalars['Int'];
};

export type QuorumCreateManyAccountInput = {
  createProposalHash?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
  removeProposalAccountId?: InputMaybe<Scalars['String']>;
  removeProposalHash?: InputMaybe<Scalars['String']>;
  walletRef: Scalars['String'];
};

export type QuorumCreateManyAccountInputEnvelope = {
  data: Array<QuorumCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type QuorumCreateManyCreateProposalInput = {
  hash: Scalars['String'];
  removeProposalAccountId?: InputMaybe<Scalars['String']>;
  removeProposalHash?: InputMaybe<Scalars['String']>;
  walletRef: Scalars['String'];
};

export type QuorumCreateManyCreateProposalInputEnvelope = {
  data: Array<QuorumCreateManyCreateProposalInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type QuorumCreateManyRemoveProposalInput = {
  accountId: Scalars['String'];
  createProposalHash?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
  walletRef: Scalars['String'];
};

export type QuorumCreateManyRemoveProposalInputEnvelope = {
  data: Array<QuorumCreateManyRemoveProposalInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type QuorumCreateManyWalletInput = {
  createProposalHash?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
  removeProposalAccountId?: InputMaybe<Scalars['String']>;
  removeProposalHash?: InputMaybe<Scalars['String']>;
};

export type QuorumCreateManyWalletInputEnvelope = {
  data: Array<QuorumCreateManyWalletInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type QuorumCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutAccountInput>>;
  createMany?: InputMaybe<QuorumCreateManyAccountInputEnvelope>;
};

export type QuorumCreateNestedManyWithoutCreateProposalInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutCreateProposalInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutCreateProposalInput>>;
  createMany?: InputMaybe<QuorumCreateManyCreateProposalInputEnvelope>;
};

export type QuorumCreateNestedManyWithoutRemoveProposalInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutRemoveProposalInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutRemoveProposalInput>>;
  createMany?: InputMaybe<QuorumCreateManyRemoveProposalInputEnvelope>;
};

export type QuorumCreateNestedManyWithoutWalletInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutWalletInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutWalletInput>>;
  createMany?: InputMaybe<QuorumCreateManyWalletInputEnvelope>;
};

export type QuorumCreateNestedOneWithoutApproversInput = {
  connect?: InputMaybe<QuorumWhereUniqueInput>;
  connectOrCreate?: InputMaybe<QuorumCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<QuorumCreateWithoutApproversInput>;
};

export type QuorumCreateOrConnectWithoutAccountInput = {
  create: QuorumCreateWithoutAccountInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumCreateOrConnectWithoutApproversInput = {
  create: QuorumCreateWithoutApproversInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumCreateOrConnectWithoutCreateProposalInput = {
  create: QuorumCreateWithoutCreateProposalInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumCreateOrConnectWithoutRemoveProposalInput = {
  create: QuorumCreateWithoutRemoveProposalInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumCreateOrConnectWithoutWalletInput = {
  create: QuorumCreateWithoutWalletInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumCreateWithoutAccountInput = {
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutQuorumInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateQuroumsInput>;
  hash: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveQuroumsInput>;
  wallet: WalletCreateNestedOneWithoutQuorumsInput;
};

export type QuorumCreateWithoutApproversInput = {
  account: AccountCreateNestedOneWithoutQuorumsInput;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateQuroumsInput>;
  hash: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveQuroumsInput>;
  wallet: WalletCreateNestedOneWithoutQuorumsInput;
};

export type QuorumCreateWithoutCreateProposalInput = {
  account: AccountCreateNestedOneWithoutQuorumsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutQuorumInput>;
  hash: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveQuroumsInput>;
  wallet: WalletCreateNestedOneWithoutQuorumsInput;
};

export type QuorumCreateWithoutRemoveProposalInput = {
  account: AccountCreateNestedOneWithoutQuorumsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutQuorumInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateQuroumsInput>;
  hash: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutQuorumsInput;
};

export type QuorumCreateWithoutWalletInput = {
  account: AccountCreateNestedOneWithoutQuorumsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutQuorumInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateQuroumsInput>;
  hash: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveQuroumsInput>;
};

export type QuorumListRelationFilter = {
  every?: InputMaybe<QuorumWhereInput>;
  none?: InputMaybe<QuorumWhereInput>;
  some?: InputMaybe<QuorumWhereInput>;
};

export type QuorumOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type QuorumRelationFilter = {
  is?: InputMaybe<QuorumWhereInput>;
  isNot?: InputMaybe<QuorumWhereInput>;
};

export type QuorumScalarWhereInput = {
  AND?: InputMaybe<Array<QuorumScalarWhereInput>>;
  NOT?: InputMaybe<Array<QuorumScalarWhereInput>>;
  OR?: InputMaybe<Array<QuorumScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createProposalHash?: InputMaybe<StringNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  removeProposalAccountId?: InputMaybe<StringNullableFilter>;
  removeProposalHash?: InputMaybe<StringNullableFilter>;
  walletRef?: InputMaybe<StringFilter>;
};

export type QuorumUpdateManyMutationInput = {
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type QuorumUpdateManyWithWhereWithoutAccountInput = {
  data: QuorumUpdateManyMutationInput;
  where: QuorumScalarWhereInput;
};

export type QuorumUpdateManyWithWhereWithoutCreateProposalInput = {
  data: QuorumUpdateManyMutationInput;
  where: QuorumScalarWhereInput;
};

export type QuorumUpdateManyWithWhereWithoutRemoveProposalInput = {
  data: QuorumUpdateManyMutationInput;
  where: QuorumScalarWhereInput;
};

export type QuorumUpdateManyWithWhereWithoutWalletInput = {
  data: QuorumUpdateManyMutationInput;
  where: QuorumScalarWhereInput;
};

export type QuorumUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutAccountInput>>;
  createMany?: InputMaybe<QuorumCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<QuorumScalarWhereInput>>;
  disconnect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  set?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  update?: InputMaybe<Array<QuorumUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<QuorumUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<QuorumUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type QuorumUpdateManyWithoutCreateProposalNestedInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutCreateProposalInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutCreateProposalInput>>;
  createMany?: InputMaybe<QuorumCreateManyCreateProposalInputEnvelope>;
  delete?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<QuorumScalarWhereInput>>;
  disconnect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  set?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  update?: InputMaybe<Array<QuorumUpdateWithWhereUniqueWithoutCreateProposalInput>>;
  updateMany?: InputMaybe<Array<QuorumUpdateManyWithWhereWithoutCreateProposalInput>>;
  upsert?: InputMaybe<Array<QuorumUpsertWithWhereUniqueWithoutCreateProposalInput>>;
};

export type QuorumUpdateManyWithoutRemoveProposalNestedInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutRemoveProposalInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutRemoveProposalInput>>;
  createMany?: InputMaybe<QuorumCreateManyRemoveProposalInputEnvelope>;
  delete?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<QuorumScalarWhereInput>>;
  disconnect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  set?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  update?: InputMaybe<Array<QuorumUpdateWithWhereUniqueWithoutRemoveProposalInput>>;
  updateMany?: InputMaybe<Array<QuorumUpdateManyWithWhereWithoutRemoveProposalInput>>;
  upsert?: InputMaybe<Array<QuorumUpsertWithWhereUniqueWithoutRemoveProposalInput>>;
};

export type QuorumUpdateManyWithoutWalletNestedInput = {
  connect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<QuorumCreateOrConnectWithoutWalletInput>>;
  create?: InputMaybe<Array<QuorumCreateWithoutWalletInput>>;
  createMany?: InputMaybe<QuorumCreateManyWalletInputEnvelope>;
  delete?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<QuorumScalarWhereInput>>;
  disconnect?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  set?: InputMaybe<Array<QuorumWhereUniqueInput>>;
  update?: InputMaybe<Array<QuorumUpdateWithWhereUniqueWithoutWalletInput>>;
  updateMany?: InputMaybe<Array<QuorumUpdateManyWithWhereWithoutWalletInput>>;
  upsert?: InputMaybe<Array<QuorumUpsertWithWhereUniqueWithoutWalletInput>>;
};

export type QuorumUpdateOneRequiredWithoutApproversNestedInput = {
  connect?: InputMaybe<QuorumWhereUniqueInput>;
  connectOrCreate?: InputMaybe<QuorumCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<QuorumCreateWithoutApproversInput>;
  update?: InputMaybe<QuorumUpdateWithoutApproversInput>;
  upsert?: InputMaybe<QuorumUpsertWithoutApproversInput>;
};

export type QuorumUpdateWithWhereUniqueWithoutAccountInput = {
  data: QuorumUpdateWithoutAccountInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpdateWithWhereUniqueWithoutCreateProposalInput = {
  data: QuorumUpdateWithoutCreateProposalInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpdateWithWhereUniqueWithoutRemoveProposalInput = {
  data: QuorumUpdateWithoutRemoveProposalInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpdateWithWhereUniqueWithoutWalletInput = {
  data: QuorumUpdateWithoutWalletInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpdateWithoutAccountInput = {
  approvers?: InputMaybe<ApproverUpdateManyWithoutQuorumNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateQuroumsNestedInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveQuroumsNestedInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutQuorumsNestedInput>;
};

export type QuorumUpdateWithoutApproversInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutQuorumsNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateQuroumsNestedInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveQuroumsNestedInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutQuorumsNestedInput>;
};

export type QuorumUpdateWithoutCreateProposalInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutQuorumsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutQuorumNestedInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveQuroumsNestedInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutQuorumsNestedInput>;
};

export type QuorumUpdateWithoutRemoveProposalInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutQuorumsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutQuorumNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateQuroumsNestedInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutQuorumsNestedInput>;
};

export type QuorumUpdateWithoutWalletInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutQuorumsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutQuorumNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateQuroumsNestedInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveQuroumsNestedInput>;
};

export type QuorumUpsertWithWhereUniqueWithoutAccountInput = {
  create: QuorumCreateWithoutAccountInput;
  update: QuorumUpdateWithoutAccountInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpsertWithWhereUniqueWithoutCreateProposalInput = {
  create: QuorumCreateWithoutCreateProposalInput;
  update: QuorumUpdateWithoutCreateProposalInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpsertWithWhereUniqueWithoutRemoveProposalInput = {
  create: QuorumCreateWithoutRemoveProposalInput;
  update: QuorumUpdateWithoutRemoveProposalInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpsertWithWhereUniqueWithoutWalletInput = {
  create: QuorumCreateWithoutWalletInput;
  update: QuorumUpdateWithoutWalletInput;
  where: QuorumWhereUniqueInput;
};

export type QuorumUpsertWithoutApproversInput = {
  create: QuorumCreateWithoutApproversInput;
  update: QuorumUpdateWithoutApproversInput;
};

export type QuorumWhereInput = {
  AND?: InputMaybe<Array<QuorumWhereInput>>;
  NOT?: InputMaybe<Array<QuorumWhereInput>>;
  OR?: InputMaybe<Array<QuorumWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  createProposal?: InputMaybe<TxRelationFilter>;
  createProposalHash?: InputMaybe<StringNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  removeProposal?: InputMaybe<TxRelationFilter>;
  removeProposalAccountId?: InputMaybe<StringNullableFilter>;
  removeProposalHash?: InputMaybe<StringNullableFilter>;
  wallet?: InputMaybe<WalletRelationFilter>;
  walletRef?: InputMaybe<StringFilter>;
};

export type QuorumWhereUniqueInput = {
  accountId_walletRef_hash?: InputMaybe<QuorumAccountIdWalletRefHashCompoundUniqueInput>;
};

export type Reaction = {
  __typename?: 'Reaction';
  account: Account;
  accountId: Scalars['String'];
  comment: Comment;
  createdAt: Scalars['DateTime'];
  emojis?: Maybe<Array<Scalars['String']>>;
  id: Scalars['String'];
  key: Scalars['String'];
  nonce: Scalars['Int'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
};

export type ReactionAccountIdKeyNonceUserIdCompoundUniqueInput = {
  accountId: Scalars['String'];
  key: Scalars['String'];
  nonce: Scalars['Int'];
  userId: Scalars['String'];
};

export type ReactionCreateManyAccountInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  key: Scalars['String'];
  nonce: Scalars['Int'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  userId: Scalars['String'];
};

export type ReactionCreateManyAccountInputEnvelope = {
  data: Array<ReactionCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ReactionCreateManyCommentInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  userId: Scalars['String'];
};

export type ReactionCreateManyCommentInputEnvelope = {
  data: Array<ReactionCreateManyCommentInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ReactionCreateManyUserInput = {
  accountId: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  key: Scalars['String'];
  nonce: Scalars['Int'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type ReactionCreateManyUserInputEnvelope = {
  data: Array<ReactionCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ReactionCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutAccountInput>>;
  createMany?: InputMaybe<ReactionCreateManyAccountInputEnvelope>;
};

export type ReactionCreateNestedManyWithoutCommentInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutCommentInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutCommentInput>>;
  createMany?: InputMaybe<ReactionCreateManyCommentInputEnvelope>;
};

export type ReactionCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutUserInput>>;
  createMany?: InputMaybe<ReactionCreateManyUserInputEnvelope>;
};

export type ReactionCreateOrConnectWithoutAccountInput = {
  create: ReactionCreateWithoutAccountInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionCreateOrConnectWithoutCommentInput = {
  create: ReactionCreateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionCreateOrConnectWithoutUserInput = {
  create: ReactionCreateWithoutUserInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionCreateWithoutAccountInput = {
  comment: CommentCreateNestedOneWithoutReactionsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  user: UserCreateNestedOneWithoutReactionsInput;
};

export type ReactionCreateWithoutCommentInput = {
  account: AccountCreateNestedOneWithoutReactionsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  user: UserCreateNestedOneWithoutReactionsInput;
};

export type ReactionCreateWithoutUserInput = {
  account: AccountCreateNestedOneWithoutReactionsInput;
  comment: CommentCreateNestedOneWithoutReactionsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type ReactionCreateemojisInput = {
  set: Array<Scalars['String']>;
};

export type ReactionListRelationFilter = {
  every?: InputMaybe<ReactionWhereInput>;
  none?: InputMaybe<ReactionWhereInput>;
  some?: InputMaybe<ReactionWhereInput>;
};

export type ReactionOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ReactionScalarWhereInput = {
  AND?: InputMaybe<Array<ReactionScalarWhereInput>>;
  NOT?: InputMaybe<Array<ReactionScalarWhereInput>>;
  OR?: InputMaybe<Array<ReactionScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ReactionUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type ReactionUpdateManyWithWhereWithoutAccountInput = {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
};

export type ReactionUpdateManyWithWhereWithoutCommentInput = {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
};

export type ReactionUpdateManyWithWhereWithoutUserInput = {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
};

export type ReactionUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutAccountInput>>;
  createMany?: InputMaybe<ReactionCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ReactionScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  set?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  update?: InputMaybe<Array<ReactionUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<ReactionUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<ReactionUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type ReactionUpdateManyWithoutCommentNestedInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutCommentInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutCommentInput>>;
  createMany?: InputMaybe<ReactionCreateManyCommentInputEnvelope>;
  delete?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ReactionScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  set?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  update?: InputMaybe<Array<ReactionUpdateWithWhereUniqueWithoutCommentInput>>;
  updateMany?: InputMaybe<Array<ReactionUpdateManyWithWhereWithoutCommentInput>>;
  upsert?: InputMaybe<Array<ReactionUpsertWithWhereUniqueWithoutCommentInput>>;
};

export type ReactionUpdateManyWithoutUserNestedInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutUserInput>>;
  createMany?: InputMaybe<ReactionCreateManyUserInputEnvelope>;
  delete?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ReactionScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  set?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  update?: InputMaybe<Array<ReactionUpdateWithWhereUniqueWithoutUserInput>>;
  updateMany?: InputMaybe<Array<ReactionUpdateManyWithWhereWithoutUserInput>>;
  upsert?: InputMaybe<Array<ReactionUpsertWithWhereUniqueWithoutUserInput>>;
};

export type ReactionUpdateWithWhereUniqueWithoutAccountInput = {
  data: ReactionUpdateWithoutAccountInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpdateWithWhereUniqueWithoutCommentInput = {
  data: ReactionUpdateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpdateWithWhereUniqueWithoutUserInput = {
  data: ReactionUpdateWithoutUserInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpdateWithoutAccountInput = {
  comment?: InputMaybe<CommentUpdateOneRequiredWithoutReactionsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutReactionsNestedInput>;
};

export type ReactionUpdateWithoutCommentInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutReactionsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutReactionsNestedInput>;
};

export type ReactionUpdateWithoutUserInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutReactionsNestedInput>;
  comment?: InputMaybe<CommentUpdateOneRequiredWithoutReactionsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type ReactionUpdateemojisInput = {
  push?: InputMaybe<Array<Scalars['String']>>;
  set?: InputMaybe<Array<Scalars['String']>>;
};

export type ReactionUpsertWithWhereUniqueWithoutAccountInput = {
  create: ReactionCreateWithoutAccountInput;
  update: ReactionUpdateWithoutAccountInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpsertWithWhereUniqueWithoutCommentInput = {
  create: ReactionCreateWithoutCommentInput;
  update: ReactionUpdateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpsertWithWhereUniqueWithoutUserInput = {
  create: ReactionCreateWithoutUserInput;
  update: ReactionUpdateWithoutUserInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionWhereInput = {
  AND?: InputMaybe<Array<ReactionWhereInput>>;
  NOT?: InputMaybe<Array<ReactionWhereInput>>;
  OR?: InputMaybe<Array<ReactionWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  comment?: InputMaybe<CommentRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ReactionWhereUniqueInput = {
  accountId_key_nonce_userId?: InputMaybe<ReactionAccountIdKeyNonceUserIdCompoundUniqueInput>;
};

export type RevokeApprovalResp = {
  __typename?: 'RevokeApprovalResp';
  id?: Maybe<Scalars['String']>;
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export type StringFieldUpdateOperationsInput = {
  set?: InputMaybe<Scalars['String']>;
};

export type StringFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<QueryMode>;
  not?: InputMaybe<NestedStringFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type StringNullableFilter = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  equals?: InputMaybe<Scalars['String']>;
  gt?: InputMaybe<Scalars['String']>;
  gte?: InputMaybe<Scalars['String']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  lt?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
  mode?: InputMaybe<QueryMode>;
  not?: InputMaybe<NestedStringNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type StringNullableListFilter = {
  equals?: InputMaybe<Array<Scalars['String']>>;
  has?: InputMaybe<Scalars['String']>;
  hasEvery?: InputMaybe<Array<Scalars['String']>>;
  hasSome?: InputMaybe<Array<Scalars['String']>>;
  isEmpty?: InputMaybe<Scalars['Boolean']>;
};

export type Submission = {
  __typename?: 'Submission';
  accountId: Scalars['String'];
  createdAt: Scalars['DateTime'];
  finalized: Scalars['Boolean'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: Maybe<Scalars['Decimal']>;
  hash: Scalars['ID'];
  id: Scalars['String'];
  nonce: Scalars['Int'];
  tx: Tx;
  txHash: Scalars['String'];
};

export type SubmissionCreateManyTxInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  finalized: Scalars['Boolean'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: InputMaybe<Scalars['Decimal']>;
  hash: Scalars['String'];
  nonce: Scalars['Int'];
};

export type SubmissionCreateManyTxInputEnvelope = {
  data: Array<SubmissionCreateManyTxInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type SubmissionCreateNestedManyWithoutTxInput = {
  connect?: InputMaybe<Array<SubmissionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<SubmissionCreateOrConnectWithoutTxInput>>;
  create?: InputMaybe<Array<SubmissionCreateWithoutTxInput>>;
  createMany?: InputMaybe<SubmissionCreateManyTxInputEnvelope>;
};

export type SubmissionCreateOrConnectWithoutTxInput = {
  create: SubmissionCreateWithoutTxInput;
  where: SubmissionWhereUniqueInput;
};

export type SubmissionCreateWithoutTxInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  finalized: Scalars['Boolean'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: InputMaybe<Scalars['Decimal']>;
  hash: Scalars['String'];
  nonce: Scalars['Int'];
};

export type SubmissionInput = {
  hash: Scalars['Bytes32'];
};

export type SubmissionListRelationFilter = {
  every?: InputMaybe<SubmissionWhereInput>;
  none?: InputMaybe<SubmissionWhereInput>;
  some?: InputMaybe<SubmissionWhereInput>;
};

export type SubmissionOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type SubmissionScalarWhereInput = {
  AND?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  NOT?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  OR?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  finalized?: InputMaybe<BoolFilter>;
  gasLimit?: InputMaybe<DecimalFilter>;
  gasPrice?: InputMaybe<DecimalNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  txHash?: InputMaybe<StringFilter>;
};

export type SubmissionUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  finalized?: InputMaybe<BoolFieldUpdateOperationsInput>;
  gasLimit?: InputMaybe<DecimalFieldUpdateOperationsInput>;
  gasPrice?: InputMaybe<NullableDecimalFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
};

export type SubmissionUpdateManyWithWhereWithoutTxInput = {
  data: SubmissionUpdateManyMutationInput;
  where: SubmissionScalarWhereInput;
};

export type SubmissionUpdateManyWithoutTxNestedInput = {
  connect?: InputMaybe<Array<SubmissionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<SubmissionCreateOrConnectWithoutTxInput>>;
  create?: InputMaybe<Array<SubmissionCreateWithoutTxInput>>;
  createMany?: InputMaybe<SubmissionCreateManyTxInputEnvelope>;
  delete?: InputMaybe<Array<SubmissionWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  disconnect?: InputMaybe<Array<SubmissionWhereUniqueInput>>;
  set?: InputMaybe<Array<SubmissionWhereUniqueInput>>;
  update?: InputMaybe<Array<SubmissionUpdateWithWhereUniqueWithoutTxInput>>;
  updateMany?: InputMaybe<Array<SubmissionUpdateManyWithWhereWithoutTxInput>>;
  upsert?: InputMaybe<Array<SubmissionUpsertWithWhereUniqueWithoutTxInput>>;
};

export type SubmissionUpdateWithWhereUniqueWithoutTxInput = {
  data: SubmissionUpdateWithoutTxInput;
  where: SubmissionWhereUniqueInput;
};

export type SubmissionUpdateWithoutTxInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  finalized?: InputMaybe<BoolFieldUpdateOperationsInput>;
  gasLimit?: InputMaybe<DecimalFieldUpdateOperationsInput>;
  gasPrice?: InputMaybe<NullableDecimalFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
};

export type SubmissionUpsertWithWhereUniqueWithoutTxInput = {
  create: SubmissionCreateWithoutTxInput;
  update: SubmissionUpdateWithoutTxInput;
  where: SubmissionWhereUniqueInput;
};

export type SubmissionWhereInput = {
  AND?: InputMaybe<Array<SubmissionWhereInput>>;
  NOT?: InputMaybe<Array<SubmissionWhereInput>>;
  OR?: InputMaybe<Array<SubmissionWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  finalized?: InputMaybe<BoolFilter>;
  gasLimit?: InputMaybe<DecimalFilter>;
  gasPrice?: InputMaybe<DecimalNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  tx?: InputMaybe<TxRelationFilter>;
  txHash?: InputMaybe<StringFilter>;
};

export type SubmissionWhereUniqueInput = {
  hash?: InputMaybe<Scalars['String']>;
};

export type Tx = {
  __typename?: 'Tx';
  _count: TxCount;
  account: Account;
  accountId: Scalars['String'];
  approvals?: Maybe<Array<Approval>>;
  createdAt: Scalars['DateTime'];
  data: Scalars['String'];
  hash: Scalars['String'];
  id: Scalars['String'];
  proposedCreateQuroums?: Maybe<Array<Quorum>>;
  proposedCreateWallet?: Maybe<Wallet>;
  proposedRemoveQuroums?: Maybe<Array<Quorum>>;
  proposedRemoveWallet?: Maybe<Wallet>;
  salt: Scalars['String'];
  submissions?: Maybe<Array<Submission>>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: Wallet;
  walletRef: Scalars['String'];
};

export type TxAccountIdHashCompoundUniqueInput = {
  accountId: Scalars['String'];
  hash: Scalars['String'];
};

export type TxCount = {
  __typename?: 'TxCount';
  approvals: Scalars['Int'];
  proposedCreateQuroums: Scalars['Int'];
  proposedRemoveQuroums: Scalars['Int'];
  submissions: Scalars['Int'];
};

export type TxCreateManyAccountInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  salt: Scalars['String'];
  to: Scalars['String'];
  value: Scalars['String'];
  walletRef: Scalars['String'];
};

export type TxCreateManyAccountInputEnvelope = {
  data: Array<TxCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type TxCreateManyWalletInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  salt: Scalars['String'];
  to: Scalars['String'];
  value: Scalars['String'];
};

export type TxCreateManyWalletInputEnvelope = {
  data: Array<TxCreateManyWalletInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type TxCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<TxWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<TxCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<TxCreateWithoutAccountInput>>;
  createMany?: InputMaybe<TxCreateManyAccountInputEnvelope>;
};

export type TxCreateNestedManyWithoutWalletInput = {
  connect?: InputMaybe<Array<TxWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<TxCreateOrConnectWithoutWalletInput>>;
  create?: InputMaybe<Array<TxCreateWithoutWalletInput>>;
  createMany?: InputMaybe<TxCreateManyWalletInputEnvelope>;
};

export type TxCreateNestedOneWithoutApprovalsInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<TxCreateWithoutApprovalsInput>;
};

export type TxCreateNestedOneWithoutProposedCreateQuroumsInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedCreateQuroumsInput>;
  create?: InputMaybe<TxCreateWithoutProposedCreateQuroumsInput>;
};

export type TxCreateNestedOneWithoutProposedCreateWalletInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedCreateWalletInput>;
  create?: InputMaybe<TxCreateWithoutProposedCreateWalletInput>;
};

export type TxCreateNestedOneWithoutProposedRemoveQuroumsInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedRemoveQuroumsInput>;
  create?: InputMaybe<TxCreateWithoutProposedRemoveQuroumsInput>;
};

export type TxCreateNestedOneWithoutProposedRemoveWalletInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedRemoveWalletInput>;
  create?: InputMaybe<TxCreateWithoutProposedRemoveWalletInput>;
};

export type TxCreateOrConnectWithoutAccountInput = {
  create: TxCreateWithoutAccountInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutApprovalsInput = {
  create: TxCreateWithoutApprovalsInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutProposedCreateQuroumsInput = {
  create: TxCreateWithoutProposedCreateQuroumsInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutProposedCreateWalletInput = {
  create: TxCreateWithoutProposedCreateWalletInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutProposedRemoveQuroumsInput = {
  create: TxCreateWithoutProposedRemoveQuroumsInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutProposedRemoveWalletInput = {
  create: TxCreateWithoutProposedRemoveWalletInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutWalletInput = {
  create: TxCreateWithoutWalletInput;
  where: TxWhereUniqueInput;
};

export type TxCreateWithoutAccountInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateQuroums?: InputMaybe<QuorumCreateNestedManyWithoutCreateProposalInput>;
  proposedCreateWallet?: InputMaybe<WalletCreateNestedOneWithoutCreateProposalInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumCreateNestedManyWithoutRemoveProposalInput>;
  proposedRemoveWallet?: InputMaybe<WalletCreateNestedOneWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutTxsInput;
};

export type TxCreateWithoutApprovalsInput = {
  account: AccountCreateNestedOneWithoutTxsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateQuroums?: InputMaybe<QuorumCreateNestedManyWithoutCreateProposalInput>;
  proposedCreateWallet?: InputMaybe<WalletCreateNestedOneWithoutCreateProposalInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumCreateNestedManyWithoutRemoveProposalInput>;
  proposedRemoveWallet?: InputMaybe<WalletCreateNestedOneWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutTxsInput;
};

export type TxCreateWithoutProposedCreateQuroumsInput = {
  account: AccountCreateNestedOneWithoutTxsInput;
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateWallet?: InputMaybe<WalletCreateNestedOneWithoutCreateProposalInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumCreateNestedManyWithoutRemoveProposalInput>;
  proposedRemoveWallet?: InputMaybe<WalletCreateNestedOneWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutTxsInput;
};

export type TxCreateWithoutProposedCreateWalletInput = {
  account: AccountCreateNestedOneWithoutTxsInput;
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateQuroums?: InputMaybe<QuorumCreateNestedManyWithoutCreateProposalInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumCreateNestedManyWithoutRemoveProposalInput>;
  proposedRemoveWallet?: InputMaybe<WalletCreateNestedOneWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutTxsInput;
};

export type TxCreateWithoutProposedRemoveQuroumsInput = {
  account: AccountCreateNestedOneWithoutTxsInput;
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateQuroums?: InputMaybe<QuorumCreateNestedManyWithoutCreateProposalInput>;
  proposedCreateWallet?: InputMaybe<WalletCreateNestedOneWithoutCreateProposalInput>;
  proposedRemoveWallet?: InputMaybe<WalletCreateNestedOneWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutTxsInput;
};

export type TxCreateWithoutProposedRemoveWalletInput = {
  account: AccountCreateNestedOneWithoutTxsInput;
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateQuroums?: InputMaybe<QuorumCreateNestedManyWithoutCreateProposalInput>;
  proposedCreateWallet?: InputMaybe<WalletCreateNestedOneWithoutCreateProposalInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumCreateNestedManyWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
  wallet: WalletCreateNestedOneWithoutTxsInput;
};

export type TxCreateWithoutWalletInput = {
  account: AccountCreateNestedOneWithoutTxsInput;
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  proposedCreateQuroums?: InputMaybe<QuorumCreateNestedManyWithoutCreateProposalInput>;
  proposedCreateWallet?: InputMaybe<WalletCreateNestedOneWithoutCreateProposalInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumCreateNestedManyWithoutRemoveProposalInput>;
  proposedRemoveWallet?: InputMaybe<WalletCreateNestedOneWithoutRemoveProposalInput>;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
};

export type TxInput = {
  data: Scalars['Bytes'];
  salt: Scalars['Bytes8'];
  to: Scalars['Address'];
  value: Scalars['Uint256'];
};

export type TxListRelationFilter = {
  every?: InputMaybe<TxWhereInput>;
  none?: InputMaybe<TxWhereInput>;
  some?: InputMaybe<TxWhereInput>;
};

export type TxOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type TxOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  data?: InputMaybe<SortOrder>;
  hash?: InputMaybe<SortOrder>;
  proposedCreateQuroums?: InputMaybe<QuorumOrderByRelationAggregateInput>;
  proposedCreateWallet?: InputMaybe<WalletOrderByWithRelationInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumOrderByRelationAggregateInput>;
  proposedRemoveWallet?: InputMaybe<WalletOrderByWithRelationInput>;
  salt?: InputMaybe<SortOrder>;
  submissions?: InputMaybe<SubmissionOrderByRelationAggregateInput>;
  to?: InputMaybe<SortOrder>;
  value?: InputMaybe<SortOrder>;
  wallet?: InputMaybe<WalletOrderByWithRelationInput>;
  walletRef?: InputMaybe<SortOrder>;
};

export type TxRelationFilter = {
  is?: InputMaybe<TxWhereInput>;
  isNot?: InputMaybe<TxWhereInput>;
};

export type TxScalarWhereInput = {
  AND?: InputMaybe<Array<TxScalarWhereInput>>;
  NOT?: InputMaybe<Array<TxScalarWhereInput>>;
  OR?: InputMaybe<Array<TxScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  data?: InputMaybe<StringFilter>;
  hash?: InputMaybe<StringFilter>;
  salt?: InputMaybe<StringFilter>;
  to?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
  walletRef?: InputMaybe<StringFilter>;
};

export type TxUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type TxUpdateManyWithWhereWithoutAccountInput = {
  data: TxUpdateManyMutationInput;
  where: TxScalarWhereInput;
};

export type TxUpdateManyWithWhereWithoutWalletInput = {
  data: TxUpdateManyMutationInput;
  where: TxScalarWhereInput;
};

export type TxUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<TxWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<TxCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<TxCreateWithoutAccountInput>>;
  createMany?: InputMaybe<TxCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<TxWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<TxScalarWhereInput>>;
  disconnect?: InputMaybe<Array<TxWhereUniqueInput>>;
  set?: InputMaybe<Array<TxWhereUniqueInput>>;
  update?: InputMaybe<Array<TxUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<TxUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<TxUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type TxUpdateManyWithoutWalletNestedInput = {
  connect?: InputMaybe<Array<TxWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<TxCreateOrConnectWithoutWalletInput>>;
  create?: InputMaybe<Array<TxCreateWithoutWalletInput>>;
  createMany?: InputMaybe<TxCreateManyWalletInputEnvelope>;
  delete?: InputMaybe<Array<TxWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<TxScalarWhereInput>>;
  disconnect?: InputMaybe<Array<TxWhereUniqueInput>>;
  set?: InputMaybe<Array<TxWhereUniqueInput>>;
  update?: InputMaybe<Array<TxUpdateWithWhereUniqueWithoutWalletInput>>;
  updateMany?: InputMaybe<Array<TxUpdateManyWithWhereWithoutWalletInput>>;
  upsert?: InputMaybe<Array<TxUpsertWithWhereUniqueWithoutWalletInput>>;
};

export type TxUpdateOneRequiredWithoutApprovalsNestedInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<TxCreateWithoutApprovalsInput>;
  update?: InputMaybe<TxUpdateWithoutApprovalsInput>;
  upsert?: InputMaybe<TxUpsertWithoutApprovalsInput>;
};

export type TxUpdateOneWithoutProposedCreateQuroumsNestedInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedCreateQuroumsInput>;
  create?: InputMaybe<TxCreateWithoutProposedCreateQuroumsInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<TxUpdateWithoutProposedCreateQuroumsInput>;
  upsert?: InputMaybe<TxUpsertWithoutProposedCreateQuroumsInput>;
};

export type TxUpdateOneWithoutProposedCreateWalletNestedInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedCreateWalletInput>;
  create?: InputMaybe<TxCreateWithoutProposedCreateWalletInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<TxUpdateWithoutProposedCreateWalletInput>;
  upsert?: InputMaybe<TxUpsertWithoutProposedCreateWalletInput>;
};

export type TxUpdateOneWithoutProposedRemoveQuroumsNestedInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedRemoveQuroumsInput>;
  create?: InputMaybe<TxCreateWithoutProposedRemoveQuroumsInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<TxUpdateWithoutProposedRemoveQuroumsInput>;
  upsert?: InputMaybe<TxUpsertWithoutProposedRemoveQuroumsInput>;
};

export type TxUpdateOneWithoutProposedRemoveWalletNestedInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutProposedRemoveWalletInput>;
  create?: InputMaybe<TxCreateWithoutProposedRemoveWalletInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<TxUpdateWithoutProposedRemoveWalletInput>;
  upsert?: InputMaybe<TxUpsertWithoutProposedRemoveWalletInput>;
};

export type TxUpdateWithWhereUniqueWithoutAccountInput = {
  data: TxUpdateWithoutAccountInput;
  where: TxWhereUniqueInput;
};

export type TxUpdateWithWhereUniqueWithoutWalletInput = {
  data: TxUpdateWithoutWalletInput;
  where: TxWhereUniqueInput;
};

export type TxUpdateWithoutAccountInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateQuroums?: InputMaybe<QuorumUpdateManyWithoutCreateProposalNestedInput>;
  proposedCreateWallet?: InputMaybe<WalletUpdateOneWithoutCreateProposalNestedInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumUpdateManyWithoutRemoveProposalNestedInput>;
  proposedRemoveWallet?: InputMaybe<WalletUpdateOneWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutTxsNestedInput>;
};

export type TxUpdateWithoutApprovalsInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutTxsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateQuroums?: InputMaybe<QuorumUpdateManyWithoutCreateProposalNestedInput>;
  proposedCreateWallet?: InputMaybe<WalletUpdateOneWithoutCreateProposalNestedInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumUpdateManyWithoutRemoveProposalNestedInput>;
  proposedRemoveWallet?: InputMaybe<WalletUpdateOneWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutTxsNestedInput>;
};

export type TxUpdateWithoutProposedCreateQuroumsInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutTxsNestedInput>;
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateWallet?: InputMaybe<WalletUpdateOneWithoutCreateProposalNestedInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumUpdateManyWithoutRemoveProposalNestedInput>;
  proposedRemoveWallet?: InputMaybe<WalletUpdateOneWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutTxsNestedInput>;
};

export type TxUpdateWithoutProposedCreateWalletInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutTxsNestedInput>;
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateQuroums?: InputMaybe<QuorumUpdateManyWithoutCreateProposalNestedInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumUpdateManyWithoutRemoveProposalNestedInput>;
  proposedRemoveWallet?: InputMaybe<WalletUpdateOneWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutTxsNestedInput>;
};

export type TxUpdateWithoutProposedRemoveQuroumsInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutTxsNestedInput>;
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateQuroums?: InputMaybe<QuorumUpdateManyWithoutCreateProposalNestedInput>;
  proposedCreateWallet?: InputMaybe<WalletUpdateOneWithoutCreateProposalNestedInput>;
  proposedRemoveWallet?: InputMaybe<WalletUpdateOneWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutTxsNestedInput>;
};

export type TxUpdateWithoutProposedRemoveWalletInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutTxsNestedInput>;
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateQuroums?: InputMaybe<QuorumUpdateManyWithoutCreateProposalNestedInput>;
  proposedCreateWallet?: InputMaybe<WalletUpdateOneWithoutCreateProposalNestedInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumUpdateManyWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
  wallet?: InputMaybe<WalletUpdateOneRequiredWithoutTxsNestedInput>;
};

export type TxUpdateWithoutWalletInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutTxsNestedInput>;
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  proposedCreateQuroums?: InputMaybe<QuorumUpdateManyWithoutCreateProposalNestedInput>;
  proposedCreateWallet?: InputMaybe<WalletUpdateOneWithoutCreateProposalNestedInput>;
  proposedRemoveQuroums?: InputMaybe<QuorumUpdateManyWithoutRemoveProposalNestedInput>;
  proposedRemoveWallet?: InputMaybe<WalletUpdateOneWithoutRemoveProposalNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type TxUpsertWithWhereUniqueWithoutAccountInput = {
  create: TxCreateWithoutAccountInput;
  update: TxUpdateWithoutAccountInput;
  where: TxWhereUniqueInput;
};

export type TxUpsertWithWhereUniqueWithoutWalletInput = {
  create: TxCreateWithoutWalletInput;
  update: TxUpdateWithoutWalletInput;
  where: TxWhereUniqueInput;
};

export type TxUpsertWithoutApprovalsInput = {
  create: TxCreateWithoutApprovalsInput;
  update: TxUpdateWithoutApprovalsInput;
};

export type TxUpsertWithoutProposedCreateQuroumsInput = {
  create: TxCreateWithoutProposedCreateQuroumsInput;
  update: TxUpdateWithoutProposedCreateQuroumsInput;
};

export type TxUpsertWithoutProposedCreateWalletInput = {
  create: TxCreateWithoutProposedCreateWalletInput;
  update: TxUpdateWithoutProposedCreateWalletInput;
};

export type TxUpsertWithoutProposedRemoveQuroumsInput = {
  create: TxCreateWithoutProposedRemoveQuroumsInput;
  update: TxUpdateWithoutProposedRemoveQuroumsInput;
};

export type TxUpsertWithoutProposedRemoveWalletInput = {
  create: TxCreateWithoutProposedRemoveWalletInput;
  update: TxUpdateWithoutProposedRemoveWalletInput;
};

export type TxWhereInput = {
  AND?: InputMaybe<Array<TxWhereInput>>;
  NOT?: InputMaybe<Array<TxWhereInput>>;
  OR?: InputMaybe<Array<TxWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  data?: InputMaybe<StringFilter>;
  hash?: InputMaybe<StringFilter>;
  proposedCreateQuroums?: InputMaybe<QuorumListRelationFilter>;
  proposedCreateWallet?: InputMaybe<WalletRelationFilter>;
  proposedRemoveQuroums?: InputMaybe<QuorumListRelationFilter>;
  proposedRemoveWallet?: InputMaybe<WalletRelationFilter>;
  salt?: InputMaybe<StringFilter>;
  submissions?: InputMaybe<SubmissionListRelationFilter>;
  to?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
  wallet?: InputMaybe<WalletRelationFilter>;
  walletRef?: InputMaybe<StringFilter>;
};

export type TxWhereUniqueInput = {
  accountId_hash?: InputMaybe<TxAccountIdHashCompoundUniqueInput>;
};

export type User = {
  __typename?: 'User';
  _count: UserCount;
  accounts: Array<Account>;
  approvals?: Maybe<Array<Approval>>;
  approvers?: Maybe<Array<Approver>>;
  comments?: Maybe<Array<Comment>>;
  contacts?: Maybe<Array<Contact>>;
  id: Scalars['ID'];
  reactions?: Maybe<Array<Reaction>>;
};

export type UserCount = {
  __typename?: 'UserCount';
  approvals: Scalars['Int'];
  approvers: Scalars['Int'];
  comments: Scalars['Int'];
  contacts: Scalars['Int'];
  reactions: Scalars['Int'];
};

export type UserCreateInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateNestedOneWithoutApprovalsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<UserCreateWithoutApprovalsInput>;
};

export type UserCreateNestedOneWithoutApproversInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<UserCreateWithoutApproversInput>;
};

export type UserCreateNestedOneWithoutCommentsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<UserCreateWithoutCommentsInput>;
};

export type UserCreateNestedOneWithoutReactionsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<UserCreateWithoutReactionsInput>;
};

export type UserCreateOrConnectWithoutApprovalsInput = {
  create: UserCreateWithoutApprovalsInput;
  where: UserWhereUniqueInput;
};

export type UserCreateOrConnectWithoutApproversInput = {
  create: UserCreateWithoutApproversInput;
  where: UserWhereUniqueInput;
};

export type UserCreateOrConnectWithoutCommentsInput = {
  create: UserCreateWithoutCommentsInput;
  where: UserWhereUniqueInput;
};

export type UserCreateOrConnectWithoutReactionsInput = {
  create: UserCreateWithoutReactionsInput;
  where: UserWhereUniqueInput;
};

export type UserCreateWithoutApprovalsInput = {
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateWithoutApproversInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
};

export type UserOrderByWithRelationInput = {
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  contacts?: InputMaybe<ContactOrderByRelationAggregateInput>;
  id?: InputMaybe<SortOrder>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
};

export type UserRelationFilter = {
  is?: InputMaybe<UserWhereInput>;
  isNot?: InputMaybe<UserWhereInput>;
};

export type UserUpdateInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateOneRequiredWithoutApprovalsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<UserCreateWithoutApprovalsInput>;
  update?: InputMaybe<UserUpdateWithoutApprovalsInput>;
  upsert?: InputMaybe<UserUpsertWithoutApprovalsInput>;
};

export type UserUpdateOneRequiredWithoutApproversNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<UserCreateWithoutApproversInput>;
  update?: InputMaybe<UserUpdateWithoutApproversInput>;
  upsert?: InputMaybe<UserUpsertWithoutApproversInput>;
};

export type UserUpdateOneRequiredWithoutCommentsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<UserCreateWithoutCommentsInput>;
  update?: InputMaybe<UserUpdateWithoutCommentsInput>;
  upsert?: InputMaybe<UserUpsertWithoutCommentsInput>;
};

export type UserUpdateOneRequiredWithoutReactionsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<UserCreateWithoutReactionsInput>;
  update?: InputMaybe<UserUpdateWithoutReactionsInput>;
  upsert?: InputMaybe<UserUpsertWithoutReactionsInput>;
};

export type UserUpdateWithoutApprovalsInput = {
  approvers?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateWithoutApproversInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type UserUpsertWithoutApprovalsInput = {
  create: UserCreateWithoutApprovalsInput;
  update: UserUpdateWithoutApprovalsInput;
};

export type UserUpsertWithoutApproversInput = {
  create: UserCreateWithoutApproversInput;
  update: UserUpdateWithoutApproversInput;
};

export type UserUpsertWithoutCommentsInput = {
  create: UserCreateWithoutCommentsInput;
  update: UserUpdateWithoutCommentsInput;
};

export type UserUpsertWithoutReactionsInput = {
  create: UserCreateWithoutReactionsInput;
  update: UserUpdateWithoutReactionsInput;
};

export type UserWhereInput = {
  AND?: InputMaybe<Array<UserWhereInput>>;
  NOT?: InputMaybe<Array<UserWhereInput>>;
  OR?: InputMaybe<Array<UserWhereInput>>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  comments?: InputMaybe<CommentListRelationFilter>;
  contacts?: InputMaybe<ContactListRelationFilter>;
  id?: InputMaybe<StringFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
};

export type UserWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Wallet = {
  __typename?: 'Wallet';
  _count: WalletCount;
  account: Account;
  accountId: Scalars['String'];
  activeModificationProposal?: Maybe<Tx>;
  approvers?: Maybe<Array<Approver>>;
  createProposal?: Maybe<Tx>;
  createProposalHash?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  quorums?: Maybe<Array<Quorum>>;
  ref: Scalars['String'];
  removeProposal?: Maybe<Tx>;
  removeProposalAccountId?: Maybe<Scalars['String']>;
  removeProposalHash?: Maybe<Scalars['String']>;
  txs?: Maybe<Array<Tx>>;
};

export type WalletAccountIdCreateProposalHashCompoundUniqueInput = {
  accountId: Scalars['String'];
  createProposalHash: Scalars['String'];
};

export type WalletAccountIdRefCompoundUniqueInput = {
  accountId: Scalars['String'];
  ref: Scalars['String'];
};

export type WalletCount = {
  __typename?: 'WalletCount';
  approvers: Scalars['Int'];
  quorums: Scalars['Int'];
  txs: Scalars['Int'];
};

export type WalletCreateManyAccountInput = {
  createProposalHash?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  ref: Scalars['String'];
  removeProposalAccountId?: InputMaybe<Scalars['String']>;
  removeProposalHash?: InputMaybe<Scalars['String']>;
};

export type WalletCreateManyAccountInputEnvelope = {
  data: Array<WalletCreateManyAccountInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type WalletCreateNestedManyWithoutAccountInput = {
  connect?: InputMaybe<Array<WalletWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<WalletCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<WalletCreateWithoutAccountInput>>;
  createMany?: InputMaybe<WalletCreateManyAccountInputEnvelope>;
};

export type WalletCreateNestedOneWithoutApproversInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<WalletCreateWithoutApproversInput>;
};

export type WalletCreateNestedOneWithoutCreateProposalInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutCreateProposalInput>;
  create?: InputMaybe<WalletCreateWithoutCreateProposalInput>;
};

export type WalletCreateNestedOneWithoutQuorumsInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutQuorumsInput>;
  create?: InputMaybe<WalletCreateWithoutQuorumsInput>;
};

export type WalletCreateNestedOneWithoutRemoveProposalInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutRemoveProposalInput>;
  create?: InputMaybe<WalletCreateWithoutRemoveProposalInput>;
};

export type WalletCreateNestedOneWithoutTxsInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutTxsInput>;
  create?: InputMaybe<WalletCreateWithoutTxsInput>;
};

export type WalletCreateOrConnectWithoutAccountInput = {
  create: WalletCreateWithoutAccountInput;
  where: WalletWhereUniqueInput;
};

export type WalletCreateOrConnectWithoutApproversInput = {
  create: WalletCreateWithoutApproversInput;
  where: WalletWhereUniqueInput;
};

export type WalletCreateOrConnectWithoutCreateProposalInput = {
  create: WalletCreateWithoutCreateProposalInput;
  where: WalletWhereUniqueInput;
};

export type WalletCreateOrConnectWithoutQuorumsInput = {
  create: WalletCreateWithoutQuorumsInput;
  where: WalletWhereUniqueInput;
};

export type WalletCreateOrConnectWithoutRemoveProposalInput = {
  create: WalletCreateWithoutRemoveProposalInput;
  where: WalletWhereUniqueInput;
};

export type WalletCreateOrConnectWithoutTxsInput = {
  create: WalletCreateWithoutTxsInput;
  where: WalletWhereUniqueInput;
};

export type WalletCreateWithoutAccountInput = {
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutWalletInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateWalletInput>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutWalletInput>;
  ref: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveWalletInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutWalletInput>;
};

export type WalletCreateWithoutApproversInput = {
  account: AccountCreateNestedOneWithoutWalletsInput;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateWalletInput>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutWalletInput>;
  ref: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveWalletInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutWalletInput>;
};

export type WalletCreateWithoutCreateProposalInput = {
  account: AccountCreateNestedOneWithoutWalletsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutWalletInput>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutWalletInput>;
  ref: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveWalletInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutWalletInput>;
};

export type WalletCreateWithoutQuorumsInput = {
  account: AccountCreateNestedOneWithoutWalletsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutWalletInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateWalletInput>;
  name?: InputMaybe<Scalars['String']>;
  ref: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveWalletInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutWalletInput>;
};

export type WalletCreateWithoutRemoveProposalInput = {
  account: AccountCreateNestedOneWithoutWalletsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutWalletInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateWalletInput>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutWalletInput>;
  ref: Scalars['String'];
  txs?: InputMaybe<TxCreateNestedManyWithoutWalletInput>;
};

export type WalletCreateWithoutTxsInput = {
  account: AccountCreateNestedOneWithoutWalletsInput;
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutWalletInput>;
  createProposal?: InputMaybe<TxCreateNestedOneWithoutProposedCreateWalletInput>;
  name?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<QuorumCreateNestedManyWithoutWalletInput>;
  ref: Scalars['String'];
  removeProposal?: InputMaybe<TxCreateNestedOneWithoutProposedRemoveWalletInput>;
};

export type WalletId = {
  accountId: Scalars['Address'];
  ref: Scalars['Bytes4'];
};

export type WalletListRelationFilter = {
  every?: InputMaybe<WalletWhereInput>;
  none?: InputMaybe<WalletWhereInput>;
  some?: InputMaybe<WalletWhereInput>;
};

export type WalletOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type WalletOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  createProposal?: InputMaybe<TxOrderByWithRelationInput>;
  createProposalHash?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  quorums?: InputMaybe<QuorumOrderByRelationAggregateInput>;
  ref?: InputMaybe<SortOrder>;
  removeProposal?: InputMaybe<TxOrderByWithRelationInput>;
  removeProposalAccountId?: InputMaybe<SortOrder>;
  removeProposalHash?: InputMaybe<SortOrder>;
  txs?: InputMaybe<TxOrderByRelationAggregateInput>;
};

export type WalletRelationFilter = {
  is?: InputMaybe<WalletWhereInput>;
  isNot?: InputMaybe<WalletWhereInput>;
};

export type WalletRemoveProposalAccountIdRemoveProposalHashCompoundUniqueInput = {
  removeProposalAccountId: Scalars['String'];
  removeProposalHash: Scalars['String'];
};

export enum WalletScalarFieldEnum {
  AccountId = 'accountId',
  CreateProposalHash = 'createProposalHash',
  Name = 'name',
  Ref = 'ref',
  RemoveProposalAccountId = 'removeProposalAccountId',
  RemoveProposalHash = 'removeProposalHash'
}

export type WalletScalarWhereInput = {
  AND?: InputMaybe<Array<WalletScalarWhereInput>>;
  NOT?: InputMaybe<Array<WalletScalarWhereInput>>;
  OR?: InputMaybe<Array<WalletScalarWhereInput>>;
  accountId?: InputMaybe<StringFilter>;
  createProposalHash?: InputMaybe<StringNullableFilter>;
  name?: InputMaybe<StringFilter>;
  ref?: InputMaybe<StringFilter>;
  removeProposalAccountId?: InputMaybe<StringNullableFilter>;
  removeProposalHash?: InputMaybe<StringNullableFilter>;
};

export type WalletUpdateManyMutationInput = {
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type WalletUpdateManyWithWhereWithoutAccountInput = {
  data: WalletUpdateManyMutationInput;
  where: WalletScalarWhereInput;
};

export type WalletUpdateManyWithoutAccountNestedInput = {
  connect?: InputMaybe<Array<WalletWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<WalletCreateOrConnectWithoutAccountInput>>;
  create?: InputMaybe<Array<WalletCreateWithoutAccountInput>>;
  createMany?: InputMaybe<WalletCreateManyAccountInputEnvelope>;
  delete?: InputMaybe<Array<WalletWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<WalletScalarWhereInput>>;
  disconnect?: InputMaybe<Array<WalletWhereUniqueInput>>;
  set?: InputMaybe<Array<WalletWhereUniqueInput>>;
  update?: InputMaybe<Array<WalletUpdateWithWhereUniqueWithoutAccountInput>>;
  updateMany?: InputMaybe<Array<WalletUpdateManyWithWhereWithoutAccountInput>>;
  upsert?: InputMaybe<Array<WalletUpsertWithWhereUniqueWithoutAccountInput>>;
};

export type WalletUpdateOneRequiredWithoutApproversNestedInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<WalletCreateWithoutApproversInput>;
  update?: InputMaybe<WalletUpdateWithoutApproversInput>;
  upsert?: InputMaybe<WalletUpsertWithoutApproversInput>;
};

export type WalletUpdateOneRequiredWithoutQuorumsNestedInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutQuorumsInput>;
  create?: InputMaybe<WalletCreateWithoutQuorumsInput>;
  update?: InputMaybe<WalletUpdateWithoutQuorumsInput>;
  upsert?: InputMaybe<WalletUpsertWithoutQuorumsInput>;
};

export type WalletUpdateOneRequiredWithoutTxsNestedInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutTxsInput>;
  create?: InputMaybe<WalletCreateWithoutTxsInput>;
  update?: InputMaybe<WalletUpdateWithoutTxsInput>;
  upsert?: InputMaybe<WalletUpsertWithoutTxsInput>;
};

export type WalletUpdateOneWithoutCreateProposalNestedInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutCreateProposalInput>;
  create?: InputMaybe<WalletCreateWithoutCreateProposalInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<WalletUpdateWithoutCreateProposalInput>;
  upsert?: InputMaybe<WalletUpsertWithoutCreateProposalInput>;
};

export type WalletUpdateOneWithoutRemoveProposalNestedInput = {
  connect?: InputMaybe<WalletWhereUniqueInput>;
  connectOrCreate?: InputMaybe<WalletCreateOrConnectWithoutRemoveProposalInput>;
  create?: InputMaybe<WalletCreateWithoutRemoveProposalInput>;
  delete?: InputMaybe<Scalars['Boolean']>;
  disconnect?: InputMaybe<Scalars['Boolean']>;
  update?: InputMaybe<WalletUpdateWithoutRemoveProposalInput>;
  upsert?: InputMaybe<WalletUpsertWithoutRemoveProposalInput>;
};

export type WalletUpdateWithWhereUniqueWithoutAccountInput = {
  data: WalletUpdateWithoutAccountInput;
  where: WalletWhereUniqueInput;
};

export type WalletUpdateWithoutAccountInput = {
  approvers?: InputMaybe<ApproverUpdateManyWithoutWalletNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateWalletNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutWalletNestedInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveWalletNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutWalletNestedInput>;
};

export type WalletUpdateWithoutApproversInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutWalletsNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateWalletNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutWalletNestedInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveWalletNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutWalletNestedInput>;
};

export type WalletUpdateWithoutCreateProposalInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutWalletsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutWalletNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutWalletNestedInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveWalletNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutWalletNestedInput>;
};

export type WalletUpdateWithoutQuorumsInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutWalletsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutWalletNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateWalletNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveWalletNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutWalletNestedInput>;
};

export type WalletUpdateWithoutRemoveProposalInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutWalletsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutWalletNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateWalletNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutWalletNestedInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  txs?: InputMaybe<TxUpdateManyWithoutWalletNestedInput>;
};

export type WalletUpdateWithoutTxsInput = {
  account?: InputMaybe<AccountUpdateOneRequiredWithoutWalletsNestedInput>;
  approvers?: InputMaybe<ApproverUpdateManyWithoutWalletNestedInput>;
  createProposal?: InputMaybe<TxUpdateOneWithoutProposedCreateWalletNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  quorums?: InputMaybe<QuorumUpdateManyWithoutWalletNestedInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  removeProposal?: InputMaybe<TxUpdateOneWithoutProposedRemoveWalletNestedInput>;
};

export type WalletUpsertWithWhereUniqueWithoutAccountInput = {
  create: WalletCreateWithoutAccountInput;
  update: WalletUpdateWithoutAccountInput;
  where: WalletWhereUniqueInput;
};

export type WalletUpsertWithoutApproversInput = {
  create: WalletCreateWithoutApproversInput;
  update: WalletUpdateWithoutApproversInput;
};

export type WalletUpsertWithoutCreateProposalInput = {
  create: WalletCreateWithoutCreateProposalInput;
  update: WalletUpdateWithoutCreateProposalInput;
};

export type WalletUpsertWithoutQuorumsInput = {
  create: WalletCreateWithoutQuorumsInput;
  update: WalletUpdateWithoutQuorumsInput;
};

export type WalletUpsertWithoutRemoveProposalInput = {
  create: WalletCreateWithoutRemoveProposalInput;
  update: WalletUpdateWithoutRemoveProposalInput;
};

export type WalletUpsertWithoutTxsInput = {
  create: WalletCreateWithoutTxsInput;
  update: WalletUpdateWithoutTxsInput;
};

export type WalletWhereInput = {
  AND?: InputMaybe<Array<WalletWhereInput>>;
  NOT?: InputMaybe<Array<WalletWhereInput>>;
  OR?: InputMaybe<Array<WalletWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  createProposal?: InputMaybe<TxRelationFilter>;
  createProposalHash?: InputMaybe<StringNullableFilter>;
  name?: InputMaybe<StringFilter>;
  quorums?: InputMaybe<QuorumListRelationFilter>;
  ref?: InputMaybe<StringFilter>;
  removeProposal?: InputMaybe<TxRelationFilter>;
  removeProposalAccountId?: InputMaybe<StringNullableFilter>;
  removeProposalHash?: InputMaybe<StringNullableFilter>;
  txs?: InputMaybe<TxListRelationFilter>;
};

export type WalletWhereUniqueInput = {
  accountId_createProposalHash?: InputMaybe<WalletAccountIdCreateProposalHashCompoundUniqueInput>;
  accountId_ref?: InputMaybe<WalletAccountIdRefCompoundUniqueInput>;
  removeProposalAccountId_removeProposalHash?: InputMaybe<WalletRemoveProposalAccountIdRemoveProposalHashCompoundUniqueInput>;
};

export type WalletWithoutAccountInput = {
  name: Scalars['String'];
  quorums: Array<Scalars['QuorumScalar']>;
  ref: Scalars['Bytes4'];
};

export type CreateAccountMutationVariables = Exact<{
  account: Scalars['Address'];
  impl: Scalars['Address'];
  deploySalt: Scalars['Bytes32'];
  name: Scalars['String'];
  wallets: Array<WalletWithoutAccountInput> | WalletWithoutAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Account', id: string } };

export type SetAccountNameMutationVariables = Exact<{
  account: Scalars['Address'];
  name: Scalars['String'];
}>;


export type SetAccountNameMutation = { __typename?: 'Mutation', setAccountName: { __typename?: 'Account', id: string } };

export type CreateCommentMutationVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['Id'];
  content: Scalars['String'];
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', id: string, accountId: string, key: string, nonce: number, authorId: string, content: string, createdAt: any, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', id: string, accountId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null }> | null } };

export type DeleteCommentMutationVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['Id'];
  nonce: Scalars['Int'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment?: { __typename?: 'Comment', id: string } | null };

export type ReactToCommentMutationVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['Id'];
  nonce: Scalars['Int'];
  emojis: Array<Scalars['String']> | Scalars['String'];
}>;


export type ReactToCommentMutation = { __typename?: 'Mutation', reactToComment?: { __typename?: 'Reaction', id: string, accountId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null } | null };

export type DeleteContactMutationVariables = Exact<{
  addr: Scalars['Address'];
}>;


export type DeleteContactMutation = { __typename?: 'Mutation', deleteContact: { __typename?: 'DeleteContactResp', id: string } };

export type UpsertContactMutationVariables = Exact<{
  prevAddr?: InputMaybe<Scalars['Address']>;
  newAddr: Scalars['Address'];
  name: Scalars['String'];
}>;


export type UpsertContactMutation = { __typename?: 'Mutation', upsertContact?: { __typename?: 'Contact', id: string, addr: string, name: string } | null };

export type ApproveTxMutationVariables = Exact<{
  account: Scalars['Address'];
  txHash: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
}>;


export type ApproveTxMutation = { __typename?: 'Mutation', approve?: { __typename?: 'Tx', id: string } | null };

export type RevokeApprovalMutationVariables = Exact<{
  account: Scalars['Address'];
  txHash: Scalars['Bytes32'];
}>;


export type RevokeApprovalMutation = { __typename?: 'Mutation', revokeApproval: { __typename?: 'RevokeApprovalResp', id?: string | null } };

export type SubmitTxExecutionMutationVariables = Exact<{
  account: Scalars['Address'];
  txHash: Scalars['Bytes32'];
  submission: SubmissionInput;
}>;


export type SubmitTxExecutionMutation = { __typename?: 'Mutation', submitTxExecution: { __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any } };

export type ProposeTxMutationVariables = Exact<{
  account: Scalars['Address'];
  walletRef: Scalars['Bytes4'];
  tx: TxInput;
  signature: Scalars['Bytes'];
}>;


export type ProposeTxMutation = { __typename?: 'Mutation', proposeTx: { __typename?: 'Tx', id: string, accountId: string, hash: string, to: string, value: string, data: string, salt: string, walletRef: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature: string, createdAt: any }> | null, submissions?: Array<{ __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any }> | null } };

export type SetTxWallelMutationVariables = Exact<{
  account: Scalars['Address'];
  hash: Scalars['Bytes32'];
  walletRef: Scalars['Bytes4'];
}>;


export type SetTxWallelMutation = { __typename?: 'Mutation', setTxWallet?: { __typename?: 'Tx', id: string } | null };

export type RequestFundsMutationVariables = Exact<{
  recipient: Scalars['Address'];
}>;


export type RequestFundsMutation = { __typename?: 'Mutation', requestFunds: boolean };

export type DeleteWalletMutationVariables = Exact<{
  id: WalletId;
}>;


export type DeleteWalletMutation = { __typename?: 'Mutation', deleteWallet: boolean };

export type UpsertWalletMutationVariables = Exact<{
  wallet: WalletId;
  name?: InputMaybe<Scalars['String']>;
  quorums: Array<Scalars['QuorumScalar']> | Scalars['QuorumScalar'];
  txHash: Scalars['Bytes32'];
}>;


export type UpsertWalletMutation = { __typename?: 'Mutation', upsertWallet?: { __typename?: 'Wallet', id: string, name: string, quorums?: Array<{ __typename?: 'Quorum', approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, createProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null, removeProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null }> | null, createProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null, removeProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null } | null };

export type SetWalletNameMutationVariables = Exact<{
  id: WalletId;
  name: Scalars['String'];
}>;


export type SetWalletNameMutation = { __typename?: 'Mutation', setWalletName: { __typename?: 'Wallet', id: string } };

export type AccountFieldsFragment = { __typename?: 'Account', id: string, name: string, impl?: string | null, deploySalt?: string | null, wallets?: Array<{ __typename?: 'Wallet', id: string, accountId: string, ref: string }> | null };

export type AccountQueryVariables = Exact<{
  account: Scalars['Address'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, name: string, impl?: string | null, deploySalt?: string | null, wallets?: Array<{ __typename?: 'Wallet', id: string, accountId: string, ref: string }> | null } | null };

export type UserAccountsMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type UserAccountsMetadataQuery = { __typename?: 'Query', userAccounts: Array<{ __typename?: 'Account', id: string, name: string }> };

export type ContactFieldsFragment = { __typename?: 'Contact', id: string, addr: string, name: string };

export type ContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsQuery = { __typename?: 'Query', contacts: Array<{ __typename?: 'Contact', id: string, addr: string, name: string }> };

export type TxsMetadataQueryVariables = Exact<{
  accounts: Array<Scalars['Address']> | Scalars['Address'];
}>;


export type TxsMetadataQuery = { __typename?: 'Query', txs: Array<{ __typename?: 'Tx', id: string, accountId: string, hash: string, createdAt: any }> };

export type TxFieldsFragment = { __typename?: 'Tx', id: string, accountId: string, hash: string, to: string, value: string, data: string, salt: string, walletRef: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature: string, createdAt: any }> | null, submissions?: Array<{ __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any }> | null };

export type TxQueryVariables = Exact<{
  account: Scalars['Address'];
  hash: Scalars['Bytes32'];
}>;


export type TxQuery = { __typename?: 'Query', tx?: { __typename?: 'Tx', id: string, accountId: string, hash: string, to: string, value: string, data: string, salt: string, walletRef: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature: string, createdAt: any }> | null, submissions?: Array<{ __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any }> | null } | null };

export type ReactionFieldsFragment = { __typename?: 'Reaction', id: string, accountId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null };

export type CommentFieldsFragment = { __typename?: 'Comment', id: string, accountId: string, key: string, nonce: number, authorId: string, content: string, createdAt: any, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', id: string, accountId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null }> | null };

export type CommentsQueryVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['Id'];
}>;


export type CommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: string, accountId: string, key: string, nonce: number, authorId: string, content: string, createdAt: any, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', id: string, accountId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null }> | null }> };

export type ContractMethodQueryVariables = Exact<{
  contract: Scalars['Address'];
  sighash: Scalars['Bytes'];
}>;


export type ContractMethodQuery = { __typename?: 'Query', contractMethod?: { __typename?: 'ContractMethod', id: string, fragment: any } | null };

export type ProposalFieldsFragment = { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null };

export type WalletFieldsFragment = { __typename?: 'Wallet', id: string, name: string, quorums?: Array<{ __typename?: 'Quorum', approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, createProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null, removeProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null }> | null, createProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null, removeProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null };

export type WalletQueryVariables = Exact<{
  wallet: WalletId;
}>;


export type WalletQuery = { __typename?: 'Query', wallet?: { __typename?: 'Wallet', id: string, name: string, quorums?: Array<{ __typename?: 'Quorum', approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, createProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null, removeProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null }> | null, createProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null, removeProposal?: { __typename?: 'Tx', hash: string, submissions?: Array<{ __typename?: 'Submission', finalized: boolean }> | null } | null } | null };

export type WalletIdFieldsFragment = { __typename?: 'Wallet', id: string, accountId: string, ref: string };

export type UserWalletIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserWalletIdsQuery = { __typename?: 'Query', userWallets: Array<{ __typename?: 'Wallet', id: string, accountId: string, ref: string }> };

export const WalletIdFieldsFragmentDoc = gql`
    fragment WalletIdFields on Wallet {
  id
  accountId
  ref
}
    `;
export const AccountFieldsFragmentDoc = gql`
    fragment AccountFields on Account {
  id
  name
  impl
  deploySalt
  wallets {
    ...WalletIdFields
  }
}
    ${WalletIdFieldsFragmentDoc}`;
export const ContactFieldsFragmentDoc = gql`
    fragment ContactFields on Contact {
  id
  addr
  name
}
    `;
export const TxFieldsFragmentDoc = gql`
    fragment TxFields on Tx {
  id
  accountId
  hash
  to
  value
  data
  salt
  walletRef
  approvals {
    userId
    signature
    createdAt
  }
  createdAt
  submissions {
    id
    hash
    nonce
    gasLimit
    gasPrice
    finalized
    createdAt
  }
}
    `;
export const ReactionFieldsFragmentDoc = gql`
    fragment ReactionFields on Reaction {
  id
  accountId
  key
  nonce
  userId
  emojis
}
    `;
export const CommentFieldsFragmentDoc = gql`
    fragment CommentFields on Comment {
  id
  accountId
  key
  nonce
  authorId
  content
  createdAt
  updatedAt
  reactions {
    ...ReactionFields
  }
}
    ${ReactionFieldsFragmentDoc}`;
export const ProposalFieldsFragmentDoc = gql`
    fragment ProposalFields on Tx {
  hash
  submissions {
    finalized
  }
}
    `;
export const WalletFieldsFragmentDoc = gql`
    fragment WalletFields on Wallet {
  id
  name
  quorums {
    approvers {
      userId
    }
    createProposal {
      ...ProposalFields
    }
    removeProposal {
      ...ProposalFields
    }
  }
  createProposal {
    ...ProposalFields
  }
  removeProposal {
    ...ProposalFields
  }
}
    ${ProposalFieldsFragmentDoc}`;
export const CreateAccountDocument = gql`
    mutation CreateAccount($account: Address!, $impl: Address!, $deploySalt: Bytes32!, $name: String!, $wallets: [WalletWithoutAccountInput!]!) {
  createAccount(
    account: $account
    impl: $impl
    deploySalt: $deploySalt
    name: $name
    wallets: $wallets
  ) {
    id
  }
}
    `;
export type CreateAccountMutationFn = Apollo.MutationFunction<CreateAccountMutation, CreateAccountMutationVariables>;

/**
 * __useCreateAccountMutation__
 *
 * To run a mutation, you first call `useCreateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAccountMutation, { data, loading, error }] = useCreateAccountMutation({
 *   variables: {
 *      account: // value for 'account'
 *      impl: // value for 'impl'
 *      deploySalt: // value for 'deploySalt'
 *      name: // value for 'name'
 *      wallets: // value for 'wallets'
 *   },
 * });
 */
export function useCreateAccountMutation(baseOptions?: Apollo.MutationHookOptions<CreateAccountMutation, CreateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateAccountMutation, CreateAccountMutationVariables>(CreateAccountDocument, options);
      }
export type CreateAccountMutationHookResult = ReturnType<typeof useCreateAccountMutation>;
export type CreateAccountMutationResult = Apollo.MutationResult<CreateAccountMutation>;
export type CreateAccountMutationOptions = Apollo.BaseMutationOptions<CreateAccountMutation, CreateAccountMutationVariables>;
export const SetAccountNameDocument = gql`
    mutation SetAccountName($account: Address!, $name: String!) {
  setAccountName(id: $account, name: $name) {
    id
  }
}
    `;
export type SetAccountNameMutationFn = Apollo.MutationFunction<SetAccountNameMutation, SetAccountNameMutationVariables>;

/**
 * __useSetAccountNameMutation__
 *
 * To run a mutation, you first call `useSetAccountNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetAccountNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setAccountNameMutation, { data, loading, error }] = useSetAccountNameMutation({
 *   variables: {
 *      account: // value for 'account'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSetAccountNameMutation(baseOptions?: Apollo.MutationHookOptions<SetAccountNameMutation, SetAccountNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetAccountNameMutation, SetAccountNameMutationVariables>(SetAccountNameDocument, options);
      }
export type SetAccountNameMutationHookResult = ReturnType<typeof useSetAccountNameMutation>;
export type SetAccountNameMutationResult = Apollo.MutationResult<SetAccountNameMutation>;
export type SetAccountNameMutationOptions = Apollo.BaseMutationOptions<SetAccountNameMutation, SetAccountNameMutationVariables>;
export const CreateCommentDocument = gql`
    mutation CreateComment($account: Address!, $key: Id!, $content: String!) {
  createComment(account: $account, key: $key, content: $content) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;
export type CreateCommentMutationFn = Apollo.MutationFunction<CreateCommentMutation, CreateCommentMutationVariables>;

/**
 * __useCreateCommentMutation__
 *
 * To run a mutation, you first call `useCreateCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommentMutation, { data, loading, error }] = useCreateCommentMutation({
 *   variables: {
 *      account: // value for 'account'
 *      key: // value for 'key'
 *      content: // value for 'content'
 *   },
 * });
 */
export function useCreateCommentMutation(baseOptions?: Apollo.MutationHookOptions<CreateCommentMutation, CreateCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCommentMutation, CreateCommentMutationVariables>(CreateCommentDocument, options);
      }
export type CreateCommentMutationHookResult = ReturnType<typeof useCreateCommentMutation>;
export type CreateCommentMutationResult = Apollo.MutationResult<CreateCommentMutation>;
export type CreateCommentMutationOptions = Apollo.BaseMutationOptions<CreateCommentMutation, CreateCommentMutationVariables>;
export const DeleteCommentDocument = gql`
    mutation DeleteComment($account: Address!, $key: Id!, $nonce: Int!) {
  deleteComment(account: $account, key: $key, nonce: $nonce) {
    id
  }
}
    `;
export type DeleteCommentMutationFn = Apollo.MutationFunction<DeleteCommentMutation, DeleteCommentMutationVariables>;

/**
 * __useDeleteCommentMutation__
 *
 * To run a mutation, you first call `useDeleteCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCommentMutation, { data, loading, error }] = useDeleteCommentMutation({
 *   variables: {
 *      account: // value for 'account'
 *      key: // value for 'key'
 *      nonce: // value for 'nonce'
 *   },
 * });
 */
export function useDeleteCommentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCommentMutation, DeleteCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCommentMutation, DeleteCommentMutationVariables>(DeleteCommentDocument, options);
      }
export type DeleteCommentMutationHookResult = ReturnType<typeof useDeleteCommentMutation>;
export type DeleteCommentMutationResult = Apollo.MutationResult<DeleteCommentMutation>;
export type DeleteCommentMutationOptions = Apollo.BaseMutationOptions<DeleteCommentMutation, DeleteCommentMutationVariables>;
export const ReactToCommentDocument = gql`
    mutation ReactToComment($account: Address!, $key: Id!, $nonce: Int!, $emojis: [String!]!) {
  reactToComment(account: $account, key: $key, nonce: $nonce, emojis: $emojis) {
    ...ReactionFields
  }
}
    ${ReactionFieldsFragmentDoc}`;
export type ReactToCommentMutationFn = Apollo.MutationFunction<ReactToCommentMutation, ReactToCommentMutationVariables>;

/**
 * __useReactToCommentMutation__
 *
 * To run a mutation, you first call `useReactToCommentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReactToCommentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reactToCommentMutation, { data, loading, error }] = useReactToCommentMutation({
 *   variables: {
 *      account: // value for 'account'
 *      key: // value for 'key'
 *      nonce: // value for 'nonce'
 *      emojis: // value for 'emojis'
 *   },
 * });
 */
export function useReactToCommentMutation(baseOptions?: Apollo.MutationHookOptions<ReactToCommentMutation, ReactToCommentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReactToCommentMutation, ReactToCommentMutationVariables>(ReactToCommentDocument, options);
      }
export type ReactToCommentMutationHookResult = ReturnType<typeof useReactToCommentMutation>;
export type ReactToCommentMutationResult = Apollo.MutationResult<ReactToCommentMutation>;
export type ReactToCommentMutationOptions = Apollo.BaseMutationOptions<ReactToCommentMutation, ReactToCommentMutationVariables>;
export const DeleteContactDocument = gql`
    mutation DeleteContact($addr: Address!) {
  deleteContact(addr: $addr) {
    id
  }
}
    `;
export type DeleteContactMutationFn = Apollo.MutationFunction<DeleteContactMutation, DeleteContactMutationVariables>;

/**
 * __useDeleteContactMutation__
 *
 * To run a mutation, you first call `useDeleteContactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteContactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteContactMutation, { data, loading, error }] = useDeleteContactMutation({
 *   variables: {
 *      addr: // value for 'addr'
 *   },
 * });
 */
export function useDeleteContactMutation(baseOptions?: Apollo.MutationHookOptions<DeleteContactMutation, DeleteContactMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteContactMutation, DeleteContactMutationVariables>(DeleteContactDocument, options);
      }
export type DeleteContactMutationHookResult = ReturnType<typeof useDeleteContactMutation>;
export type DeleteContactMutationResult = Apollo.MutationResult<DeleteContactMutation>;
export type DeleteContactMutationOptions = Apollo.BaseMutationOptions<DeleteContactMutation, DeleteContactMutationVariables>;
export const UpsertContactDocument = gql`
    mutation UpsertContact($prevAddr: Address, $newAddr: Address!, $name: String!) {
  upsertContact(prevAddr: $prevAddr, newAddr: $newAddr, name: $name) {
    ...ContactFields
  }
}
    ${ContactFieldsFragmentDoc}`;
export type UpsertContactMutationFn = Apollo.MutationFunction<UpsertContactMutation, UpsertContactMutationVariables>;

/**
 * __useUpsertContactMutation__
 *
 * To run a mutation, you first call `useUpsertContactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertContactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertContactMutation, { data, loading, error }] = useUpsertContactMutation({
 *   variables: {
 *      prevAddr: // value for 'prevAddr'
 *      newAddr: // value for 'newAddr'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpsertContactMutation(baseOptions?: Apollo.MutationHookOptions<UpsertContactMutation, UpsertContactMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertContactMutation, UpsertContactMutationVariables>(UpsertContactDocument, options);
      }
export type UpsertContactMutationHookResult = ReturnType<typeof useUpsertContactMutation>;
export type UpsertContactMutationResult = Apollo.MutationResult<UpsertContactMutation>;
export type UpsertContactMutationOptions = Apollo.BaseMutationOptions<UpsertContactMutation, UpsertContactMutationVariables>;
export const ApproveTxDocument = gql`
    mutation ApproveTx($account: Address!, $txHash: Bytes32!, $signature: Bytes!) {
  approve(account: $account, hash: $txHash, signature: $signature) {
    id
  }
}
    `;
export type ApproveTxMutationFn = Apollo.MutationFunction<ApproveTxMutation, ApproveTxMutationVariables>;

/**
 * __useApproveTxMutation__
 *
 * To run a mutation, you first call `useApproveTxMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveTxMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveTxMutation, { data, loading, error }] = useApproveTxMutation({
 *   variables: {
 *      account: // value for 'account'
 *      txHash: // value for 'txHash'
 *      signature: // value for 'signature'
 *   },
 * });
 */
export function useApproveTxMutation(baseOptions?: Apollo.MutationHookOptions<ApproveTxMutation, ApproveTxMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApproveTxMutation, ApproveTxMutationVariables>(ApproveTxDocument, options);
      }
export type ApproveTxMutationHookResult = ReturnType<typeof useApproveTxMutation>;
export type ApproveTxMutationResult = Apollo.MutationResult<ApproveTxMutation>;
export type ApproveTxMutationOptions = Apollo.BaseMutationOptions<ApproveTxMutation, ApproveTxMutationVariables>;
export const RevokeApprovalDocument = gql`
    mutation RevokeApproval($account: Address!, $txHash: Bytes32!) {
  revokeApproval(account: $account, hash: $txHash) {
    id
  }
}
    `;
export type RevokeApprovalMutationFn = Apollo.MutationFunction<RevokeApprovalMutation, RevokeApprovalMutationVariables>;

/**
 * __useRevokeApprovalMutation__
 *
 * To run a mutation, you first call `useRevokeApprovalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRevokeApprovalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [revokeApprovalMutation, { data, loading, error }] = useRevokeApprovalMutation({
 *   variables: {
 *      account: // value for 'account'
 *      txHash: // value for 'txHash'
 *   },
 * });
 */
export function useRevokeApprovalMutation(baseOptions?: Apollo.MutationHookOptions<RevokeApprovalMutation, RevokeApprovalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RevokeApprovalMutation, RevokeApprovalMutationVariables>(RevokeApprovalDocument, options);
      }
export type RevokeApprovalMutationHookResult = ReturnType<typeof useRevokeApprovalMutation>;
export type RevokeApprovalMutationResult = Apollo.MutationResult<RevokeApprovalMutation>;
export type RevokeApprovalMutationOptions = Apollo.BaseMutationOptions<RevokeApprovalMutation, RevokeApprovalMutationVariables>;
export const SubmitTxExecutionDocument = gql`
    mutation SubmitTxExecution($account: Address!, $txHash: Bytes32!, $submission: SubmissionInput!) {
  submitTxExecution(account: $account, txHash: $txHash, submission: $submission) {
    id
    hash
    nonce
    gasLimit
    gasPrice
    finalized
    createdAt
  }
}
    `;
export type SubmitTxExecutionMutationFn = Apollo.MutationFunction<SubmitTxExecutionMutation, SubmitTxExecutionMutationVariables>;

/**
 * __useSubmitTxExecutionMutation__
 *
 * To run a mutation, you first call `useSubmitTxExecutionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitTxExecutionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitTxExecutionMutation, { data, loading, error }] = useSubmitTxExecutionMutation({
 *   variables: {
 *      account: // value for 'account'
 *      txHash: // value for 'txHash'
 *      submission: // value for 'submission'
 *   },
 * });
 */
export function useSubmitTxExecutionMutation(baseOptions?: Apollo.MutationHookOptions<SubmitTxExecutionMutation, SubmitTxExecutionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitTxExecutionMutation, SubmitTxExecutionMutationVariables>(SubmitTxExecutionDocument, options);
      }
export type SubmitTxExecutionMutationHookResult = ReturnType<typeof useSubmitTxExecutionMutation>;
export type SubmitTxExecutionMutationResult = Apollo.MutationResult<SubmitTxExecutionMutation>;
export type SubmitTxExecutionMutationOptions = Apollo.BaseMutationOptions<SubmitTxExecutionMutation, SubmitTxExecutionMutationVariables>;
export const ProposeTxDocument = gql`
    mutation ProposeTx($account: Address!, $walletRef: Bytes4!, $tx: TxInput!, $signature: Bytes!) {
  proposeTx(
    account: $account
    walletRef: $walletRef
    tx: $tx
    signature: $signature
  ) {
    ...TxFields
  }
}
    ${TxFieldsFragmentDoc}`;
export type ProposeTxMutationFn = Apollo.MutationFunction<ProposeTxMutation, ProposeTxMutationVariables>;

/**
 * __useProposeTxMutation__
 *
 * To run a mutation, you first call `useProposeTxMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useProposeTxMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [proposeTxMutation, { data, loading, error }] = useProposeTxMutation({
 *   variables: {
 *      account: // value for 'account'
 *      walletRef: // value for 'walletRef'
 *      tx: // value for 'tx'
 *      signature: // value for 'signature'
 *   },
 * });
 */
export function useProposeTxMutation(baseOptions?: Apollo.MutationHookOptions<ProposeTxMutation, ProposeTxMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ProposeTxMutation, ProposeTxMutationVariables>(ProposeTxDocument, options);
      }
export type ProposeTxMutationHookResult = ReturnType<typeof useProposeTxMutation>;
export type ProposeTxMutationResult = Apollo.MutationResult<ProposeTxMutation>;
export type ProposeTxMutationOptions = Apollo.BaseMutationOptions<ProposeTxMutation, ProposeTxMutationVariables>;
export const SetTxWallelDocument = gql`
    mutation SetTxWallel($account: Address!, $hash: Bytes32!, $walletRef: Bytes4!) {
  setTxWallet(account: $account, hash: $hash, walletRef: $walletRef) {
    id
  }
}
    `;
export type SetTxWallelMutationFn = Apollo.MutationFunction<SetTxWallelMutation, SetTxWallelMutationVariables>;

/**
 * __useSetTxWallelMutation__
 *
 * To run a mutation, you first call `useSetTxWallelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetTxWallelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setTxWallelMutation, { data, loading, error }] = useSetTxWallelMutation({
 *   variables: {
 *      account: // value for 'account'
 *      hash: // value for 'hash'
 *      walletRef: // value for 'walletRef'
 *   },
 * });
 */
export function useSetTxWallelMutation(baseOptions?: Apollo.MutationHookOptions<SetTxWallelMutation, SetTxWallelMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetTxWallelMutation, SetTxWallelMutationVariables>(SetTxWallelDocument, options);
      }
export type SetTxWallelMutationHookResult = ReturnType<typeof useSetTxWallelMutation>;
export type SetTxWallelMutationResult = Apollo.MutationResult<SetTxWallelMutation>;
export type SetTxWallelMutationOptions = Apollo.BaseMutationOptions<SetTxWallelMutation, SetTxWallelMutationVariables>;
export const RequestFundsDocument = gql`
    mutation RequestFunds($recipient: Address!) {
  requestFunds(recipient: $recipient)
}
    `;
export type RequestFundsMutationFn = Apollo.MutationFunction<RequestFundsMutation, RequestFundsMutationVariables>;

/**
 * __useRequestFundsMutation__
 *
 * To run a mutation, you first call `useRequestFundsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestFundsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestFundsMutation, { data, loading, error }] = useRequestFundsMutation({
 *   variables: {
 *      recipient: // value for 'recipient'
 *   },
 * });
 */
export function useRequestFundsMutation(baseOptions?: Apollo.MutationHookOptions<RequestFundsMutation, RequestFundsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestFundsMutation, RequestFundsMutationVariables>(RequestFundsDocument, options);
      }
export type RequestFundsMutationHookResult = ReturnType<typeof useRequestFundsMutation>;
export type RequestFundsMutationResult = Apollo.MutationResult<RequestFundsMutation>;
export type RequestFundsMutationOptions = Apollo.BaseMutationOptions<RequestFundsMutation, RequestFundsMutationVariables>;
export const DeleteWalletDocument = gql`
    mutation DeleteWallet($id: WalletId!) {
  deleteWallet(id: $id)
}
    `;
export type DeleteWalletMutationFn = Apollo.MutationFunction<DeleteWalletMutation, DeleteWalletMutationVariables>;

/**
 * __useDeleteWalletMutation__
 *
 * To run a mutation, you first call `useDeleteWalletMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWalletMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWalletMutation, { data, loading, error }] = useDeleteWalletMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteWalletMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWalletMutation, DeleteWalletMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWalletMutation, DeleteWalletMutationVariables>(DeleteWalletDocument, options);
      }
export type DeleteWalletMutationHookResult = ReturnType<typeof useDeleteWalletMutation>;
export type DeleteWalletMutationResult = Apollo.MutationResult<DeleteWalletMutation>;
export type DeleteWalletMutationOptions = Apollo.BaseMutationOptions<DeleteWalletMutation, DeleteWalletMutationVariables>;
export const UpsertWalletDocument = gql`
    mutation UpsertWallet($wallet: WalletId!, $name: String, $quorums: [QuorumScalar!]!, $txHash: Bytes32!) {
  upsertWallet(id: $wallet, name: $name, quorums: $quorums, proposalHash: $txHash) {
    ...WalletFields
  }
}
    ${WalletFieldsFragmentDoc}`;
export type UpsertWalletMutationFn = Apollo.MutationFunction<UpsertWalletMutation, UpsertWalletMutationVariables>;

/**
 * __useUpsertWalletMutation__
 *
 * To run a mutation, you first call `useUpsertWalletMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertWalletMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertWalletMutation, { data, loading, error }] = useUpsertWalletMutation({
 *   variables: {
 *      wallet: // value for 'wallet'
 *      name: // value for 'name'
 *      quorums: // value for 'quorums'
 *      txHash: // value for 'txHash'
 *   },
 * });
 */
export function useUpsertWalletMutation(baseOptions?: Apollo.MutationHookOptions<UpsertWalletMutation, UpsertWalletMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertWalletMutation, UpsertWalletMutationVariables>(UpsertWalletDocument, options);
      }
export type UpsertWalletMutationHookResult = ReturnType<typeof useUpsertWalletMutation>;
export type UpsertWalletMutationResult = Apollo.MutationResult<UpsertWalletMutation>;
export type UpsertWalletMutationOptions = Apollo.BaseMutationOptions<UpsertWalletMutation, UpsertWalletMutationVariables>;
export const SetWalletNameDocument = gql`
    mutation SetWalletName($id: WalletId!, $name: String!) {
  setWalletName(id: $id, name: $name) {
    id
  }
}
    `;
export type SetWalletNameMutationFn = Apollo.MutationFunction<SetWalletNameMutation, SetWalletNameMutationVariables>;

/**
 * __useSetWalletNameMutation__
 *
 * To run a mutation, you first call `useSetWalletNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetWalletNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setWalletNameMutation, { data, loading, error }] = useSetWalletNameMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSetWalletNameMutation(baseOptions?: Apollo.MutationHookOptions<SetWalletNameMutation, SetWalletNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetWalletNameMutation, SetWalletNameMutationVariables>(SetWalletNameDocument, options);
      }
export type SetWalletNameMutationHookResult = ReturnType<typeof useSetWalletNameMutation>;
export type SetWalletNameMutationResult = Apollo.MutationResult<SetWalletNameMutation>;
export type SetWalletNameMutationOptions = Apollo.BaseMutationOptions<SetWalletNameMutation, SetWalletNameMutationVariables>;
export const AccountDocument = gql`
    query Account($account: Address!) {
  account(id: $account) {
    ...AccountFields
  }
}
    ${AccountFieldsFragmentDoc}`;

/**
 * __useAccountQuery__
 *
 * To run a query within a React component, call `useAccountQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountQuery({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useAccountQuery(baseOptions: Apollo.QueryHookOptions<AccountQuery, AccountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountQuery, AccountQueryVariables>(AccountDocument, options);
      }
export function useAccountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountQuery, AccountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountQuery, AccountQueryVariables>(AccountDocument, options);
        }
export type AccountQueryHookResult = ReturnType<typeof useAccountQuery>;
export type AccountLazyQueryHookResult = ReturnType<typeof useAccountLazyQuery>;
export type AccountQueryResult = Apollo.QueryResult<AccountQuery, AccountQueryVariables>;
export const UserAccountsMetadataDocument = gql`
    query UserAccountsMetadata {
  userAccounts {
    id
    name
  }
}
    `;

/**
 * __useUserAccountsMetadataQuery__
 *
 * To run a query within a React component, call `useUserAccountsMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserAccountsMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserAccountsMetadataQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserAccountsMetadataQuery(baseOptions?: Apollo.QueryHookOptions<UserAccountsMetadataQuery, UserAccountsMetadataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserAccountsMetadataQuery, UserAccountsMetadataQueryVariables>(UserAccountsMetadataDocument, options);
      }
export function useUserAccountsMetadataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserAccountsMetadataQuery, UserAccountsMetadataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserAccountsMetadataQuery, UserAccountsMetadataQueryVariables>(UserAccountsMetadataDocument, options);
        }
export type UserAccountsMetadataQueryHookResult = ReturnType<typeof useUserAccountsMetadataQuery>;
export type UserAccountsMetadataLazyQueryHookResult = ReturnType<typeof useUserAccountsMetadataLazyQuery>;
export type UserAccountsMetadataQueryResult = Apollo.QueryResult<UserAccountsMetadataQuery, UserAccountsMetadataQueryVariables>;
export const ContactsDocument = gql`
    query Contacts {
  contacts {
    ...ContactFields
  }
}
    ${ContactFieldsFragmentDoc}`;

/**
 * __useContactsQuery__
 *
 * To run a query within a React component, call `useContactsQuery` and pass it any options that fit your needs.
 * When your component renders, `useContactsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContactsQuery({
 *   variables: {
 *   },
 * });
 */
export function useContactsQuery(baseOptions?: Apollo.QueryHookOptions<ContactsQuery, ContactsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContactsQuery, ContactsQueryVariables>(ContactsDocument, options);
      }
export function useContactsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContactsQuery, ContactsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContactsQuery, ContactsQueryVariables>(ContactsDocument, options);
        }
export type ContactsQueryHookResult = ReturnType<typeof useContactsQuery>;
export type ContactsLazyQueryHookResult = ReturnType<typeof useContactsLazyQuery>;
export type ContactsQueryResult = Apollo.QueryResult<ContactsQuery, ContactsQueryVariables>;
export const TxsMetadataDocument = gql`
    query TxsMetadata($accounts: [Address!]!) {
  txs(accounts: $accounts) {
    id
    accountId
    hash
    createdAt
  }
}
    `;

/**
 * __useTxsMetadataQuery__
 *
 * To run a query within a React component, call `useTxsMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useTxsMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTxsMetadataQuery({
 *   variables: {
 *      accounts: // value for 'accounts'
 *   },
 * });
 */
export function useTxsMetadataQuery(baseOptions: Apollo.QueryHookOptions<TxsMetadataQuery, TxsMetadataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TxsMetadataQuery, TxsMetadataQueryVariables>(TxsMetadataDocument, options);
      }
export function useTxsMetadataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TxsMetadataQuery, TxsMetadataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TxsMetadataQuery, TxsMetadataQueryVariables>(TxsMetadataDocument, options);
        }
export type TxsMetadataQueryHookResult = ReturnType<typeof useTxsMetadataQuery>;
export type TxsMetadataLazyQueryHookResult = ReturnType<typeof useTxsMetadataLazyQuery>;
export type TxsMetadataQueryResult = Apollo.QueryResult<TxsMetadataQuery, TxsMetadataQueryVariables>;
export const TxDocument = gql`
    query Tx($account: Address!, $hash: Bytes32!) {
  tx(account: $account, hash: $hash) {
    ...TxFields
  }
}
    ${TxFieldsFragmentDoc}`;

/**
 * __useTxQuery__
 *
 * To run a query within a React component, call `useTxQuery` and pass it any options that fit your needs.
 * When your component renders, `useTxQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTxQuery({
 *   variables: {
 *      account: // value for 'account'
 *      hash: // value for 'hash'
 *   },
 * });
 */
export function useTxQuery(baseOptions: Apollo.QueryHookOptions<TxQuery, TxQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TxQuery, TxQueryVariables>(TxDocument, options);
      }
export function useTxLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TxQuery, TxQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TxQuery, TxQueryVariables>(TxDocument, options);
        }
export type TxQueryHookResult = ReturnType<typeof useTxQuery>;
export type TxLazyQueryHookResult = ReturnType<typeof useTxLazyQuery>;
export type TxQueryResult = Apollo.QueryResult<TxQuery, TxQueryVariables>;
export const CommentsDocument = gql`
    query Comments($account: Address!, $key: Id!) {
  comments(account: $account, key: $key) {
    ...CommentFields
  }
}
    ${CommentFieldsFragmentDoc}`;

/**
 * __useCommentsQuery__
 *
 * To run a query within a React component, call `useCommentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommentsQuery({
 *   variables: {
 *      account: // value for 'account'
 *      key: // value for 'key'
 *   },
 * });
 */
export function useCommentsQuery(baseOptions: Apollo.QueryHookOptions<CommentsQuery, CommentsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CommentsQuery, CommentsQueryVariables>(CommentsDocument, options);
      }
export function useCommentsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CommentsQuery, CommentsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CommentsQuery, CommentsQueryVariables>(CommentsDocument, options);
        }
export type CommentsQueryHookResult = ReturnType<typeof useCommentsQuery>;
export type CommentsLazyQueryHookResult = ReturnType<typeof useCommentsLazyQuery>;
export type CommentsQueryResult = Apollo.QueryResult<CommentsQuery, CommentsQueryVariables>;
export const ContractMethodDocument = gql`
    query ContractMethod($contract: Address!, $sighash: Bytes!) {
  contractMethod(contract: $contract, sighash: $sighash) {
    id
    fragment
  }
}
    `;

/**
 * __useContractMethodQuery__
 *
 * To run a query within a React component, call `useContractMethodQuery` and pass it any options that fit your needs.
 * When your component renders, `useContractMethodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContractMethodQuery({
 *   variables: {
 *      contract: // value for 'contract'
 *      sighash: // value for 'sighash'
 *   },
 * });
 */
export function useContractMethodQuery(baseOptions: Apollo.QueryHookOptions<ContractMethodQuery, ContractMethodQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContractMethodQuery, ContractMethodQueryVariables>(ContractMethodDocument, options);
      }
export function useContractMethodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContractMethodQuery, ContractMethodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContractMethodQuery, ContractMethodQueryVariables>(ContractMethodDocument, options);
        }
export type ContractMethodQueryHookResult = ReturnType<typeof useContractMethodQuery>;
export type ContractMethodLazyQueryHookResult = ReturnType<typeof useContractMethodLazyQuery>;
export type ContractMethodQueryResult = Apollo.QueryResult<ContractMethodQuery, ContractMethodQueryVariables>;
export const WalletDocument = gql`
    query Wallet($wallet: WalletId!) {
  wallet(id: $wallet) {
    ...WalletFields
  }
}
    ${WalletFieldsFragmentDoc}`;

/**
 * __useWalletQuery__
 *
 * To run a query within a React component, call `useWalletQuery` and pass it any options that fit your needs.
 * When your component renders, `useWalletQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWalletQuery({
 *   variables: {
 *      wallet: // value for 'wallet'
 *   },
 * });
 */
export function useWalletQuery(baseOptions: Apollo.QueryHookOptions<WalletQuery, WalletQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<WalletQuery, WalletQueryVariables>(WalletDocument, options);
      }
export function useWalletLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<WalletQuery, WalletQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<WalletQuery, WalletQueryVariables>(WalletDocument, options);
        }
export type WalletQueryHookResult = ReturnType<typeof useWalletQuery>;
export type WalletLazyQueryHookResult = ReturnType<typeof useWalletLazyQuery>;
export type WalletQueryResult = Apollo.QueryResult<WalletQuery, WalletQueryVariables>;
export const UserWalletIdsDocument = gql`
    query UserWalletIds {
  userWallets {
    ...WalletIdFields
  }
}
    ${WalletIdFieldsFragmentDoc}`;

/**
 * __useUserWalletIdsQuery__
 *
 * To run a query within a React component, call `useUserWalletIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserWalletIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserWalletIdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserWalletIdsQuery(baseOptions?: Apollo.QueryHookOptions<UserWalletIdsQuery, UserWalletIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserWalletIdsQuery, UserWalletIdsQueryVariables>(UserWalletIdsDocument, options);
      }
export function useUserWalletIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserWalletIdsQuery, UserWalletIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserWalletIdsQuery, UserWalletIdsQueryVariables>(UserWalletIdsDocument, options);
        }
export type UserWalletIdsQueryHookResult = ReturnType<typeof useUserWalletIdsQuery>;
export type UserWalletIdsLazyQueryHookResult = ReturnType<typeof useUserWalletIdsLazyQuery>;
export type UserWalletIdsQueryResult = Apollo.QueryResult<UserWalletIdsQuery, UserWalletIdsQueryVariables>;