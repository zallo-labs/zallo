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
  Bytes32: any;
  DateTime: any;
  Decimal: any;
  Id: any;
  JSON: any;
  Uint256: any;
};

export type Approval = {
  __typename?: 'Approval';
  createdAt: Scalars['DateTime'];
  safe: Safe;
  safeId: Scalars['String'];
  signature: Scalars['String'];
  tx: Tx;
  txHash: Scalars['String'];
  user: User;
  userId: Scalars['String'];
};

export type ApprovalCreateManySafeInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  txHash: Scalars['String'];
  userId: Scalars['String'];
};

export type ApprovalCreateManySafeInputEnvelope = {
  data: Array<ApprovalCreateManySafeInput>;
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
  createdAt?: InputMaybe<Scalars['DateTime']>;
  safeId: Scalars['String'];
  signature: Scalars['String'];
  txHash: Scalars['String'];
};

export type ApprovalCreateManyUserInputEnvelope = {
  data: Array<ApprovalCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApprovalCreateNestedManyWithoutSafeInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutSafeInput>>;
  createMany?: InputMaybe<ApprovalCreateManySafeInputEnvelope>;
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

export type ApprovalCreateOrConnectWithoutSafeInput = {
  create: ApprovalCreateWithoutSafeInput;
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

export type ApprovalCreateWithoutSafeInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  signature: Scalars['String'];
  tx: TxCreateNestedOneWithoutApprovalsInput;
  user: UserCreateNestedOneWithoutApprovalsInput;
};

export type ApprovalCreateWithoutTxInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  safe: SafeCreateNestedOneWithoutApprovalsInput;
  signature: Scalars['String'];
  user: UserCreateNestedOneWithoutApprovalsInput;
};

export type ApprovalCreateWithoutUserInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  safe: SafeCreateNestedOneWithoutApprovalsInput;
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

export type ApprovalSafeIdTxHashUserIdCompoundUniqueInput = {
  safeId: Scalars['String'];
  txHash: Scalars['String'];
  userId: Scalars['String'];
};

export type ApprovalScalarWhereInput = {
  AND?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  NOT?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  OR?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  safeId?: InputMaybe<StringFilter>;
  signature?: InputMaybe<StringFilter>;
  txHash?: InputMaybe<StringFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ApprovalUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type ApprovalUpdateManyWithWhereWithoutSafeInput = {
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

export type ApprovalUpdateManyWithoutSafeNestedInput = {
  connect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApprovalCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<ApprovalCreateWithoutSafeInput>>;
  createMany?: InputMaybe<ApprovalCreateManySafeInputEnvelope>;
  delete?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApprovalScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  set?: InputMaybe<Array<ApprovalWhereUniqueInput>>;
  update?: InputMaybe<Array<ApprovalUpdateWithWhereUniqueWithoutSafeInput>>;
  updateMany?: InputMaybe<Array<ApprovalUpdateManyWithWhereWithoutSafeInput>>;
  upsert?: InputMaybe<Array<ApprovalUpsertWithWhereUniqueWithoutSafeInput>>;
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

export type ApprovalUpdateWithWhereUniqueWithoutSafeInput = {
  data: ApprovalUpdateWithoutSafeInput;
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

export type ApprovalUpdateWithoutSafeInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
  tx?: InputMaybe<TxUpdateOneRequiredWithoutApprovalsNestedInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApprovalsNestedInput>;
};

export type ApprovalUpdateWithoutTxInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutApprovalsNestedInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutApprovalsNestedInput>;
};

export type ApprovalUpdateWithoutUserInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutApprovalsNestedInput>;
  signature?: InputMaybe<StringFieldUpdateOperationsInput>;
  tx?: InputMaybe<TxUpdateOneRequiredWithoutApprovalsNestedInput>;
};

export type ApprovalUpsertWithWhereUniqueWithoutSafeInput = {
  create: ApprovalCreateWithoutSafeInput;
  update: ApprovalUpdateWithoutSafeInput;
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
  createdAt?: InputMaybe<DateTimeFilter>;
  safe?: InputMaybe<SafeRelationFilter>;
  safeId?: InputMaybe<StringFilter>;
  signature?: InputMaybe<StringFilter>;
  tx?: InputMaybe<TxRelationFilter>;
  txHash?: InputMaybe<StringFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ApprovalWhereUniqueInput = {
  safeId_txHash_userId?: InputMaybe<ApprovalSafeIdTxHashUserIdCompoundUniqueInput>;
};

export type Approver = {
  __typename?: 'Approver';
  group: Group;
  groupRef: Scalars['String'];
  id: Scalars['String'];
  safeId: Scalars['String'];
  user: User;
  userId: Scalars['String'];
  weight: Scalars['Decimal'];
};

export type ApproverCreateManyGroupInput = {
  userId: Scalars['String'];
  weight: Scalars['Decimal'];
};

export type ApproverCreateManyGroupInputEnvelope = {
  data: Array<ApproverCreateManyGroupInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApproverCreateManyUserInput = {
  groupRef: Scalars['String'];
  safeId: Scalars['String'];
  weight: Scalars['Decimal'];
};

export type ApproverCreateManyUserInputEnvelope = {
  data: Array<ApproverCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ApproverCreateNestedManyWithoutGroupInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutGroupInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutGroupInput>>;
  createMany?: InputMaybe<ApproverCreateManyGroupInputEnvelope>;
};

export type ApproverCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutUserInput>>;
  createMany?: InputMaybe<ApproverCreateManyUserInputEnvelope>;
};

export type ApproverCreateOrConnectWithoutGroupInput = {
  create: ApproverCreateWithoutGroupInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverCreateOrConnectWithoutUserInput = {
  create: ApproverCreateWithoutUserInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverCreateWithoutGroupInput = {
  user: UserCreateNestedOneWithoutGroupsInput;
  weight: Scalars['Decimal'];
};

export type ApproverCreateWithoutUserInput = {
  group: GroupCreateNestedOneWithoutApproversInput;
  weight: Scalars['Decimal'];
};

export type ApproverInput = {
  addr: Scalars['Address'];
  weight: Scalars['Float'];
};

export type ApproverListRelationFilter = {
  every?: InputMaybe<ApproverWhereInput>;
  none?: InputMaybe<ApproverWhereInput>;
  some?: InputMaybe<ApproverWhereInput>;
};

export type ApproverOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ApproverSafeIdGroupRefUserIdCompoundUniqueInput = {
  groupRef: Scalars['String'];
  safeId: Scalars['String'];
  userId: Scalars['String'];
};

export type ApproverScalarWhereInput = {
  AND?: InputMaybe<Array<ApproverScalarWhereInput>>;
  NOT?: InputMaybe<Array<ApproverScalarWhereInput>>;
  OR?: InputMaybe<Array<ApproverScalarWhereInput>>;
  groupRef?: InputMaybe<StringFilter>;
  safeId?: InputMaybe<StringFilter>;
  userId?: InputMaybe<StringFilter>;
  weight?: InputMaybe<DecimalFilter>;
};

export type ApproverUpdateManyMutationInput = {
  weight?: InputMaybe<DecimalFieldUpdateOperationsInput>;
};

export type ApproverUpdateManyWithWhereWithoutGroupInput = {
  data: ApproverUpdateManyMutationInput;
  where: ApproverScalarWhereInput;
};

export type ApproverUpdateManyWithWhereWithoutUserInput = {
  data: ApproverUpdateManyMutationInput;
  where: ApproverScalarWhereInput;
};

export type ApproverUpdateManyWithoutGroupNestedInput = {
  connect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ApproverCreateOrConnectWithoutGroupInput>>;
  create?: InputMaybe<Array<ApproverCreateWithoutGroupInput>>;
  createMany?: InputMaybe<ApproverCreateManyGroupInputEnvelope>;
  delete?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ApproverScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  set?: InputMaybe<Array<ApproverWhereUniqueInput>>;
  update?: InputMaybe<Array<ApproverUpdateWithWhereUniqueWithoutGroupInput>>;
  updateMany?: InputMaybe<Array<ApproverUpdateManyWithWhereWithoutGroupInput>>;
  upsert?: InputMaybe<Array<ApproverUpsertWithWhereUniqueWithoutGroupInput>>;
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

export type ApproverUpdateWithWhereUniqueWithoutGroupInput = {
  data: ApproverUpdateWithoutGroupInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpdateWithWhereUniqueWithoutUserInput = {
  data: ApproverUpdateWithoutUserInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpdateWithoutGroupInput = {
  user?: InputMaybe<UserUpdateOneRequiredWithoutGroupsNestedInput>;
  weight?: InputMaybe<DecimalFieldUpdateOperationsInput>;
};

export type ApproverUpdateWithoutUserInput = {
  group?: InputMaybe<GroupUpdateOneRequiredWithoutApproversNestedInput>;
  weight?: InputMaybe<DecimalFieldUpdateOperationsInput>;
};

export type ApproverUpsertWithWhereUniqueWithoutGroupInput = {
  create: ApproverCreateWithoutGroupInput;
  update: ApproverUpdateWithoutGroupInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverUpsertWithWhereUniqueWithoutUserInput = {
  create: ApproverCreateWithoutUserInput;
  update: ApproverUpdateWithoutUserInput;
  where: ApproverWhereUniqueInput;
};

export type ApproverWhereInput = {
  AND?: InputMaybe<Array<ApproverWhereInput>>;
  NOT?: InputMaybe<Array<ApproverWhereInput>>;
  OR?: InputMaybe<Array<ApproverWhereInput>>;
  group?: InputMaybe<GroupRelationFilter>;
  groupRef?: InputMaybe<StringFilter>;
  safeId?: InputMaybe<StringFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
  weight?: InputMaybe<DecimalFilter>;
};

export type ApproverWhereUniqueInput = {
  safeId_groupRef_userId?: InputMaybe<ApproverSafeIdGroupRefUserIdCompoundUniqueInput>;
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
  author: User;
  authorId: Scalars['String'];
  content: Scalars['String'];
  createdAt: Scalars['DateTime'];
  id: Scalars['String'];
  key: Scalars['String'];
  nonce: Scalars['Int'];
  reactions?: Maybe<Array<Reaction>>;
  safe: Safe;
  safeId: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export type CommentCount = {
  __typename?: 'CommentCount';
  reactions: Scalars['Int'];
};

export type CommentCreateManyAuthorInput = {
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  safeId: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateManyAuthorInputEnvelope = {
  data: Array<CommentCreateManyAuthorInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type CommentCreateManySafeInput = {
  authorId: Scalars['String'];
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateManySafeInputEnvelope = {
  data: Array<CommentCreateManySafeInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type CommentCreateNestedManyWithoutAuthorInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutAuthorInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutAuthorInput>>;
  createMany?: InputMaybe<CommentCreateManyAuthorInputEnvelope>;
};

export type CommentCreateNestedManyWithoutSafeInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutSafeInput>>;
  createMany?: InputMaybe<CommentCreateManySafeInputEnvelope>;
};

export type CommentCreateNestedOneWithoutReactionsInput = {
  connect?: InputMaybe<CommentWhereUniqueInput>;
  connectOrCreate?: InputMaybe<CommentCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<CommentCreateWithoutReactionsInput>;
};

export type CommentCreateOrConnectWithoutAuthorInput = {
  create: CommentCreateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
};

export type CommentCreateOrConnectWithoutReactionsInput = {
  create: CommentCreateWithoutReactionsInput;
  where: CommentWhereUniqueInput;
};

export type CommentCreateOrConnectWithoutSafeInput = {
  create: CommentCreateWithoutSafeInput;
  where: CommentWhereUniqueInput;
};

export type CommentCreateWithoutAuthorInput = {
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutCommentInput>;
  safe: SafeCreateNestedOneWithoutCommentsInput;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateWithoutReactionsInput = {
  author: UserCreateNestedOneWithoutCommentsInput;
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  safe: SafeCreateNestedOneWithoutCommentsInput;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type CommentCreateWithoutSafeInput = {
  author: UserCreateNestedOneWithoutCommentsInput;
  content: Scalars['String'];
  createdAt?: InputMaybe<Scalars['DateTime']>;
  key: Scalars['String'];
  nonce?: InputMaybe<Scalars['Int']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutCommentInput>;
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

export type CommentSafeIdKeyNonceCompoundUniqueInput = {
  key: Scalars['String'];
  nonce: Scalars['Int'];
  safeId: Scalars['String'];
};

export type CommentScalarWhereInput = {
  AND?: InputMaybe<Array<CommentScalarWhereInput>>;
  NOT?: InputMaybe<Array<CommentScalarWhereInput>>;
  OR?: InputMaybe<Array<CommentScalarWhereInput>>;
  authorId?: InputMaybe<StringFilter>;
  content?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  safeId?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentUpdateManyMutationInput = {
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpdateManyWithWhereWithoutAuthorInput = {
  data: CommentUpdateManyMutationInput;
  where: CommentScalarWhereInput;
};

export type CommentUpdateManyWithWhereWithoutSafeInput = {
  data: CommentUpdateManyMutationInput;
  where: CommentScalarWhereInput;
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

export type CommentUpdateManyWithoutSafeNestedInput = {
  connect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<CommentCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<CommentCreateWithoutSafeInput>>;
  createMany?: InputMaybe<CommentCreateManySafeInputEnvelope>;
  delete?: InputMaybe<Array<CommentWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<CommentScalarWhereInput>>;
  disconnect?: InputMaybe<Array<CommentWhereUniqueInput>>;
  set?: InputMaybe<Array<CommentWhereUniqueInput>>;
  update?: InputMaybe<Array<CommentUpdateWithWhereUniqueWithoutSafeInput>>;
  updateMany?: InputMaybe<Array<CommentUpdateManyWithWhereWithoutSafeInput>>;
  upsert?: InputMaybe<Array<CommentUpsertWithWhereUniqueWithoutSafeInput>>;
};

export type CommentUpdateOneRequiredWithoutReactionsNestedInput = {
  connect?: InputMaybe<CommentWhereUniqueInput>;
  connectOrCreate?: InputMaybe<CommentCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<CommentCreateWithoutReactionsInput>;
  update?: InputMaybe<CommentUpdateWithoutReactionsInput>;
  upsert?: InputMaybe<CommentUpsertWithoutReactionsInput>;
};

export type CommentUpdateWithWhereUniqueWithoutAuthorInput = {
  data: CommentUpdateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpdateWithWhereUniqueWithoutSafeInput = {
  data: CommentUpdateWithoutSafeInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpdateWithoutAuthorInput = {
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutCommentNestedInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutCommentsNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpdateWithoutReactionsInput = {
  author?: InputMaybe<UserUpdateOneRequiredWithoutCommentsNestedInput>;
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutCommentsNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpdateWithoutSafeInput = {
  author?: InputMaybe<UserUpdateOneRequiredWithoutCommentsNestedInput>;
  content?: InputMaybe<StringFieldUpdateOperationsInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  key?: InputMaybe<StringFieldUpdateOperationsInput>;
  nonce?: InputMaybe<IntFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutCommentNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type CommentUpsertWithWhereUniqueWithoutAuthorInput = {
  create: CommentCreateWithoutAuthorInput;
  update: CommentUpdateWithoutAuthorInput;
  where: CommentWhereUniqueInput;
};

export type CommentUpsertWithWhereUniqueWithoutSafeInput = {
  create: CommentCreateWithoutSafeInput;
  update: CommentUpdateWithoutSafeInput;
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
  author?: InputMaybe<UserRelationFilter>;
  authorId?: InputMaybe<StringFilter>;
  content?: InputMaybe<StringFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
  safe?: InputMaybe<SafeRelationFilter>;
  safeId?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type CommentWhereUniqueInput = {
  safeId_key_nonce?: InputMaybe<CommentSafeIdKeyNonceCompoundUniqueInput>;
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

export type Group = {
  __typename?: 'Group';
  _count: GroupCount;
  approvers?: Maybe<Array<Approver>>;
  id: Scalars['String'];
  name: Scalars['String'];
  ref: Scalars['String'];
  safe: Safe;
  safeId: Scalars['String'];
};

export type GroupCount = {
  __typename?: 'GroupCount';
  approvers: Scalars['Int'];
};

export type GroupCreateManySafeInput = {
  name?: InputMaybe<Scalars['String']>;
  ref: Scalars['String'];
};

export type GroupCreateManySafeInputEnvelope = {
  data: Array<GroupCreateManySafeInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type GroupCreateNestedManyWithoutSafeInput = {
  connect?: InputMaybe<Array<GroupWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<GroupCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<GroupCreateWithoutSafeInput>>;
  createMany?: InputMaybe<GroupCreateManySafeInputEnvelope>;
};

export type GroupCreateNestedOneWithoutApproversInput = {
  connect?: InputMaybe<GroupWhereUniqueInput>;
  connectOrCreate?: InputMaybe<GroupCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<GroupCreateWithoutApproversInput>;
};

export type GroupCreateOrConnectWithoutApproversInput = {
  create: GroupCreateWithoutApproversInput;
  where: GroupWhereUniqueInput;
};

export type GroupCreateOrConnectWithoutSafeInput = {
  create: GroupCreateWithoutSafeInput;
  where: GroupWhereUniqueInput;
};

export type GroupCreateWithoutApproversInput = {
  name?: InputMaybe<Scalars['String']>;
  ref: Scalars['String'];
  safe: SafeCreateNestedOneWithoutGroupsInput;
};

export type GroupCreateWithoutSafeInput = {
  approvers?: InputMaybe<ApproverCreateNestedManyWithoutGroupInput>;
  name?: InputMaybe<Scalars['String']>;
  ref: Scalars['String'];
};

export type GroupInput = {
  approvers: Array<ApproverInput>;
  name: Scalars['String'];
  ref: Scalars['Bytes32'];
};

export type GroupListRelationFilter = {
  every?: InputMaybe<GroupWhereInput>;
  none?: InputMaybe<GroupWhereInput>;
  some?: InputMaybe<GroupWhereInput>;
};

export type GroupOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type GroupOrderByWithRelationInput = {
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  name?: InputMaybe<SortOrder>;
  ref?: InputMaybe<SortOrder>;
  safe?: InputMaybe<SafeOrderByWithRelationInput>;
  safeId?: InputMaybe<SortOrder>;
};

export type GroupRelationFilter = {
  is?: InputMaybe<GroupWhereInput>;
  isNot?: InputMaybe<GroupWhereInput>;
};

export type GroupSafeIdRefCompoundUniqueInput = {
  ref: Scalars['String'];
  safeId: Scalars['String'];
};

export enum GroupScalarFieldEnum {
  Name = 'name',
  Ref = 'ref',
  SafeId = 'safeId'
}

export type GroupScalarWhereInput = {
  AND?: InputMaybe<Array<GroupScalarWhereInput>>;
  NOT?: InputMaybe<Array<GroupScalarWhereInput>>;
  OR?: InputMaybe<Array<GroupScalarWhereInput>>;
  name?: InputMaybe<StringFilter>;
  ref?: InputMaybe<StringFilter>;
  safeId?: InputMaybe<StringFilter>;
};

export type GroupUpdateManyMutationInput = {
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type GroupUpdateManyWithWhereWithoutSafeInput = {
  data: GroupUpdateManyMutationInput;
  where: GroupScalarWhereInput;
};

export type GroupUpdateManyWithoutSafeNestedInput = {
  connect?: InputMaybe<Array<GroupWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<GroupCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<GroupCreateWithoutSafeInput>>;
  createMany?: InputMaybe<GroupCreateManySafeInputEnvelope>;
  delete?: InputMaybe<Array<GroupWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<GroupScalarWhereInput>>;
  disconnect?: InputMaybe<Array<GroupWhereUniqueInput>>;
  set?: InputMaybe<Array<GroupWhereUniqueInput>>;
  update?: InputMaybe<Array<GroupUpdateWithWhereUniqueWithoutSafeInput>>;
  updateMany?: InputMaybe<Array<GroupUpdateManyWithWhereWithoutSafeInput>>;
  upsert?: InputMaybe<Array<GroupUpsertWithWhereUniqueWithoutSafeInput>>;
};

export type GroupUpdateOneRequiredWithoutApproversNestedInput = {
  connect?: InputMaybe<GroupWhereUniqueInput>;
  connectOrCreate?: InputMaybe<GroupCreateOrConnectWithoutApproversInput>;
  create?: InputMaybe<GroupCreateWithoutApproversInput>;
  update?: InputMaybe<GroupUpdateWithoutApproversInput>;
  upsert?: InputMaybe<GroupUpsertWithoutApproversInput>;
};

export type GroupUpdateWithWhereUniqueWithoutSafeInput = {
  data: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
};

export type GroupUpdateWithoutApproversInput = {
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutGroupsNestedInput>;
};

export type GroupUpdateWithoutSafeInput = {
  approvers?: InputMaybe<ApproverUpdateManyWithoutGroupNestedInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  ref?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type GroupUpsertWithWhereUniqueWithoutSafeInput = {
  create: GroupCreateWithoutSafeInput;
  update: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
};

export type GroupUpsertWithoutApproversInput = {
  create: GroupCreateWithoutApproversInput;
  update: GroupUpdateWithoutApproversInput;
};

export type GroupWhereInput = {
  AND?: InputMaybe<Array<GroupWhereInput>>;
  NOT?: InputMaybe<Array<GroupWhereInput>>;
  OR?: InputMaybe<Array<GroupWhereInput>>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  name?: InputMaybe<StringFilter>;
  ref?: InputMaybe<StringFilter>;
  safe?: InputMaybe<SafeRelationFilter>;
  safeId?: InputMaybe<StringFilter>;
};

export type GroupWhereUniqueInput = {
  safeId_ref?: InputMaybe<GroupSafeIdRefCompoundUniqueInput>;
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
  createComment: Comment;
  deleteComment?: Maybe<Comment>;
  deleteContact: DeleteContactResp;
  proposeTx: Tx;
  reactToComment?: Maybe<Reaction>;
  requestFunds: Scalars['Boolean'];
  revokeApproval: RevokeApprovalResp;
  submitTxExecution: Submission;
  upsertContact?: Maybe<Contact>;
  upsertGroup?: Maybe<Group>;
  upsertSafe: Safe;
  upsertUser: User;
};


export type MutationApproveArgs = {
  safe: Scalars['Address'];
  signature: Scalars['Bytes'];
  txHash: Scalars['Bytes32'];
};


export type MutationCreateCommentArgs = {
  content: Scalars['String'];
  key: Scalars['Id'];
  safe: Scalars['Address'];
};


export type MutationDeleteCommentArgs = {
  key: Scalars['Id'];
  nonce: Scalars['Int'];
  safe: Scalars['Address'];
};


export type MutationDeleteContactArgs = {
  addr: Scalars['Address'];
};


export type MutationProposeTxArgs = {
  safe: Scalars['Address'];
  signature: Scalars['Bytes'];
  tx: TxInput;
};


export type MutationReactToCommentArgs = {
  emojis: Array<Scalars['String']>;
  key: Scalars['Id'];
  nonce: Scalars['Int'];
  safe: Scalars['Address'];
};


export type MutationRequestFundsArgs = {
  recipient: Scalars['Address'];
};


export type MutationRevokeApprovalArgs = {
  safe: Scalars['Address'];
  txHash: Scalars['Bytes32'];
};


export type MutationSubmitTxExecutionArgs = {
  safe: Scalars['Address'];
  submission: SubmissionInput;
  txHash: Scalars['Bytes32'];
};


export type MutationUpsertContactArgs = {
  name: Scalars['String'];
  newAddr: Scalars['Address'];
  prevAddr?: InputMaybe<Scalars['Address']>;
};


export type MutationUpsertGroupArgs = {
  group: GroupInput;
  safe: Scalars['Address'];
};


export type MutationUpsertSafeArgs = {
  deploySalt?: InputMaybe<Scalars['Bytes32']>;
  groups?: InputMaybe<Array<GroupInput>>;
  name?: InputMaybe<Scalars['String']>;
  safe: Scalars['Address'];
};


export type MutationUpsertUserArgs = {
  create: UserCreateInput;
  update: UserUpdateInput;
  where: UserWhereUniqueInput;
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
  addrName?: Maybe<Scalars['String']>;
  comments: Array<Comment>;
  contact?: Maybe<Contact>;
  contacts: Array<Contact>;
  contractMethod?: Maybe<ContractMethod>;
  group?: Maybe<Group>;
  groups: Array<Group>;
  safe?: Maybe<Safe>;
  safes: Array<Safe>;
  submissions: Array<Submission>;
  txs: Array<Tx>;
  user?: Maybe<User>;
};


export type QueryAddrNameArgs = {
  addr: Scalars['String'];
};


export type QueryCommentsArgs = {
  key: Scalars['Id'];
  safe: Scalars['Address'];
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


export type QueryGroupArgs = {
  where: GroupWhereUniqueInput;
};


export type QueryGroupsArgs = {
  cursor?: InputMaybe<GroupWhereUniqueInput>;
  distinct?: InputMaybe<Array<GroupScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<GroupOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GroupWhereInput>;
};


export type QuerySafeArgs = {
  where: SafeWhereUniqueInput;
};


export type QuerySafesArgs = {
  cursor?: InputMaybe<SafeWhereUniqueInput>;
  distinct?: InputMaybe<Array<SafeScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<SafeOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<SafeWhereInput>;
};


export type QuerySubmissionsArgs = {
  safe: Scalars['Address'];
  txHash: Scalars['Bytes32'];
};


export type QueryTxsArgs = {
  safe: Scalars['Address'];
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export type Reaction = {
  __typename?: 'Reaction';
  comment: Comment;
  createdAt: Scalars['DateTime'];
  emojis?: Maybe<Array<Scalars['String']>>;
  id: Scalars['String'];
  key: Scalars['String'];
  nonce: Scalars['Int'];
  safe: Safe;
  safeId: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
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

export type ReactionCreateManySafeInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  key: Scalars['String'];
  nonce: Scalars['Int'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  userId: Scalars['String'];
};

export type ReactionCreateManySafeInputEnvelope = {
  data: Array<ReactionCreateManySafeInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ReactionCreateManyUserInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  key: Scalars['String'];
  nonce: Scalars['Int'];
  safeId: Scalars['String'];
  updatedAt?: InputMaybe<Scalars['DateTime']>;
};

export type ReactionCreateManyUserInputEnvelope = {
  data: Array<ReactionCreateManyUserInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type ReactionCreateNestedManyWithoutCommentInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutCommentInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutCommentInput>>;
  createMany?: InputMaybe<ReactionCreateManyCommentInputEnvelope>;
};

export type ReactionCreateNestedManyWithoutSafeInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutSafeInput>>;
  createMany?: InputMaybe<ReactionCreateManySafeInputEnvelope>;
};

export type ReactionCreateNestedManyWithoutUserInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutUserInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutUserInput>>;
  createMany?: InputMaybe<ReactionCreateManyUserInputEnvelope>;
};

export type ReactionCreateOrConnectWithoutCommentInput = {
  create: ReactionCreateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionCreateOrConnectWithoutSafeInput = {
  create: ReactionCreateWithoutSafeInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionCreateOrConnectWithoutUserInput = {
  create: ReactionCreateWithoutUserInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionCreateWithoutCommentInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  safe: SafeCreateNestedOneWithoutReactionsInput;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  user: UserCreateNestedOneWithoutReactionsInput;
};

export type ReactionCreateWithoutSafeInput = {
  comment: CommentCreateNestedOneWithoutReactionsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  updatedAt?: InputMaybe<Scalars['DateTime']>;
  user: UserCreateNestedOneWithoutReactionsInput;
};

export type ReactionCreateWithoutUserInput = {
  comment: CommentCreateNestedOneWithoutReactionsInput;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  emojis?: InputMaybe<ReactionCreateemojisInput>;
  safe: SafeCreateNestedOneWithoutReactionsInput;
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

export type ReactionSafeIdKeyNonceUserIdCompoundUniqueInput = {
  key: Scalars['String'];
  nonce: Scalars['Int'];
  safeId: Scalars['String'];
  userId: Scalars['String'];
};

export type ReactionScalarWhereInput = {
  AND?: InputMaybe<Array<ReactionScalarWhereInput>>;
  NOT?: InputMaybe<Array<ReactionScalarWhereInput>>;
  OR?: InputMaybe<Array<ReactionScalarWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  safeId?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ReactionUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type ReactionUpdateManyWithWhereWithoutCommentInput = {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
};

export type ReactionUpdateManyWithWhereWithoutSafeInput = {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
};

export type ReactionUpdateManyWithWhereWithoutUserInput = {
  data: ReactionUpdateManyMutationInput;
  where: ReactionScalarWhereInput;
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

export type ReactionUpdateManyWithoutSafeNestedInput = {
  connect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<ReactionCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<ReactionCreateWithoutSafeInput>>;
  createMany?: InputMaybe<ReactionCreateManySafeInputEnvelope>;
  delete?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<ReactionScalarWhereInput>>;
  disconnect?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  set?: InputMaybe<Array<ReactionWhereUniqueInput>>;
  update?: InputMaybe<Array<ReactionUpdateWithWhereUniqueWithoutSafeInput>>;
  updateMany?: InputMaybe<Array<ReactionUpdateManyWithWhereWithoutSafeInput>>;
  upsert?: InputMaybe<Array<ReactionUpsertWithWhereUniqueWithoutSafeInput>>;
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

export type ReactionUpdateWithWhereUniqueWithoutCommentInput = {
  data: ReactionUpdateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpdateWithWhereUniqueWithoutSafeInput = {
  data: ReactionUpdateWithoutSafeInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpdateWithWhereUniqueWithoutUserInput = {
  data: ReactionUpdateWithoutUserInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpdateWithoutCommentInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutReactionsNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutReactionsNestedInput>;
};

export type ReactionUpdateWithoutSafeInput = {
  comment?: InputMaybe<CommentUpdateOneRequiredWithoutReactionsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  user?: InputMaybe<UserUpdateOneRequiredWithoutReactionsNestedInput>;
};

export type ReactionUpdateWithoutUserInput = {
  comment?: InputMaybe<CommentUpdateOneRequiredWithoutReactionsNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  emojis?: InputMaybe<ReactionUpdateemojisInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutReactionsNestedInput>;
  updatedAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
};

export type ReactionUpdateemojisInput = {
  push?: InputMaybe<Array<Scalars['String']>>;
  set?: InputMaybe<Array<Scalars['String']>>;
};

export type ReactionUpsertWithWhereUniqueWithoutCommentInput = {
  create: ReactionCreateWithoutCommentInput;
  update: ReactionUpdateWithoutCommentInput;
  where: ReactionWhereUniqueInput;
};

export type ReactionUpsertWithWhereUniqueWithoutSafeInput = {
  create: ReactionCreateWithoutSafeInput;
  update: ReactionUpdateWithoutSafeInput;
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
  comment?: InputMaybe<CommentRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  key?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  safe?: InputMaybe<SafeRelationFilter>;
  safeId?: InputMaybe<StringFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type ReactionWhereUniqueInput = {
  safeId_key_nonce_userId?: InputMaybe<ReactionSafeIdKeyNonceUserIdCompoundUniqueInput>;
};

export type RevokeApprovalResp = {
  __typename?: 'RevokeApprovalResp';
  id?: Maybe<Scalars['String']>;
};

export type Safe = {
  __typename?: 'Safe';
  _count: SafeCount;
  approvals?: Maybe<Array<Approval>>;
  comments?: Maybe<Array<Comment>>;
  deploySalt?: Maybe<Scalars['String']>;
  groups?: Maybe<Array<Group>>;
  id: Scalars['ID'];
  name: Scalars['String'];
  reactions?: Maybe<Array<Reaction>>;
  txs?: Maybe<Array<Tx>>;
};

export type SafeCount = {
  __typename?: 'SafeCount';
  approvals: Scalars['Int'];
  comments: Scalars['Int'];
  groups: Scalars['Int'];
  reactions: Scalars['Int'];
  txs: Scalars['Int'];
};

export type SafeCreateNestedOneWithoutApprovalsInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<SafeCreateWithoutApprovalsInput>;
};

export type SafeCreateNestedOneWithoutCommentsInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<SafeCreateWithoutCommentsInput>;
};

export type SafeCreateNestedOneWithoutGroupsInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutGroupsInput>;
  create?: InputMaybe<SafeCreateWithoutGroupsInput>;
};

export type SafeCreateNestedOneWithoutReactionsInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<SafeCreateWithoutReactionsInput>;
};

export type SafeCreateNestedOneWithoutTxsInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutTxsInput>;
  create?: InputMaybe<SafeCreateWithoutTxsInput>;
};

export type SafeCreateOrConnectWithoutApprovalsInput = {
  create: SafeCreateWithoutApprovalsInput;
  where: SafeWhereUniqueInput;
};

export type SafeCreateOrConnectWithoutCommentsInput = {
  create: SafeCreateWithoutCommentsInput;
  where: SafeWhereUniqueInput;
};

export type SafeCreateOrConnectWithoutGroupsInput = {
  create: SafeCreateWithoutGroupsInput;
  where: SafeWhereUniqueInput;
};

export type SafeCreateOrConnectWithoutReactionsInput = {
  create: SafeCreateWithoutReactionsInput;
  where: SafeWhereUniqueInput;
};

export type SafeCreateOrConnectWithoutTxsInput = {
  create: SafeCreateWithoutTxsInput;
  where: SafeWhereUniqueInput;
};

export type SafeCreateWithoutApprovalsInput = {
  comments?: InputMaybe<CommentCreateNestedManyWithoutSafeInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<GroupCreateNestedManyWithoutSafeInput>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutSafeInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutSafeInput>;
};

export type SafeCreateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutSafeInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<GroupCreateNestedManyWithoutSafeInput>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutSafeInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutSafeInput>;
};

export type SafeCreateWithoutGroupsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutSafeInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutSafeInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutSafeInput>;
  txs?: InputMaybe<TxCreateNestedManyWithoutSafeInput>;
};

export type SafeCreateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutSafeInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutSafeInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<GroupCreateNestedManyWithoutSafeInput>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  txs?: InputMaybe<TxCreateNestedManyWithoutSafeInput>;
};

export type SafeCreateWithoutTxsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutSafeInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutSafeInput>;
  deploySalt?: InputMaybe<Scalars['String']>;
  groups?: InputMaybe<GroupCreateNestedManyWithoutSafeInput>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutSafeInput>;
};

export type SafeOrderByWithRelationInput = {
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  deploySalt?: InputMaybe<SortOrder>;
  groups?: InputMaybe<GroupOrderByRelationAggregateInput>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
  txs?: InputMaybe<TxOrderByRelationAggregateInput>;
};

export type SafeRelationFilter = {
  is?: InputMaybe<SafeWhereInput>;
  isNot?: InputMaybe<SafeWhereInput>;
};

export enum SafeScalarFieldEnum {
  DeploySalt = 'deploySalt',
  Id = 'id',
  Name = 'name'
}

export type SafeUpdateOneRequiredWithoutApprovalsNestedInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<SafeCreateWithoutApprovalsInput>;
  update?: InputMaybe<SafeUpdateWithoutApprovalsInput>;
  upsert?: InputMaybe<SafeUpsertWithoutApprovalsInput>;
};

export type SafeUpdateOneRequiredWithoutCommentsNestedInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<SafeCreateWithoutCommentsInput>;
  update?: InputMaybe<SafeUpdateWithoutCommentsInput>;
  upsert?: InputMaybe<SafeUpsertWithoutCommentsInput>;
};

export type SafeUpdateOneRequiredWithoutGroupsNestedInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutGroupsInput>;
  create?: InputMaybe<SafeCreateWithoutGroupsInput>;
  update?: InputMaybe<SafeUpdateWithoutGroupsInput>;
  upsert?: InputMaybe<SafeUpsertWithoutGroupsInput>;
};

export type SafeUpdateOneRequiredWithoutReactionsNestedInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<SafeCreateWithoutReactionsInput>;
  update?: InputMaybe<SafeUpdateWithoutReactionsInput>;
  upsert?: InputMaybe<SafeUpsertWithoutReactionsInput>;
};

export type SafeUpdateOneRequiredWithoutTxsNestedInput = {
  connect?: InputMaybe<SafeWhereUniqueInput>;
  connectOrCreate?: InputMaybe<SafeCreateOrConnectWithoutTxsInput>;
  create?: InputMaybe<SafeCreateWithoutTxsInput>;
  update?: InputMaybe<SafeUpdateWithoutTxsInput>;
  upsert?: InputMaybe<SafeUpsertWithoutTxsInput>;
};

export type SafeUpdateWithoutApprovalsInput = {
  comments?: InputMaybe<CommentUpdateManyWithoutSafeNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  groups?: InputMaybe<GroupUpdateManyWithoutSafeNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutSafeNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutSafeNestedInput>;
};

export type SafeUpdateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutSafeNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  groups?: InputMaybe<GroupUpdateManyWithoutSafeNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutSafeNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutSafeNestedInput>;
};

export type SafeUpdateWithoutGroupsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutSafeNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutSafeNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutSafeNestedInput>;
  txs?: InputMaybe<TxUpdateManyWithoutSafeNestedInput>;
};

export type SafeUpdateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutSafeNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutSafeNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  groups?: InputMaybe<GroupUpdateManyWithoutSafeNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  txs?: InputMaybe<TxUpdateManyWithoutSafeNestedInput>;
};

export type SafeUpdateWithoutTxsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutSafeNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutSafeNestedInput>;
  deploySalt?: InputMaybe<NullableStringFieldUpdateOperationsInput>;
  groups?: InputMaybe<GroupUpdateManyWithoutSafeNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  name?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutSafeNestedInput>;
};

export type SafeUpsertWithoutApprovalsInput = {
  create: SafeCreateWithoutApprovalsInput;
  update: SafeUpdateWithoutApprovalsInput;
};

export type SafeUpsertWithoutCommentsInput = {
  create: SafeCreateWithoutCommentsInput;
  update: SafeUpdateWithoutCommentsInput;
};

export type SafeUpsertWithoutGroupsInput = {
  create: SafeCreateWithoutGroupsInput;
  update: SafeUpdateWithoutGroupsInput;
};

export type SafeUpsertWithoutReactionsInput = {
  create: SafeCreateWithoutReactionsInput;
  update: SafeUpdateWithoutReactionsInput;
};

export type SafeUpsertWithoutTxsInput = {
  create: SafeCreateWithoutTxsInput;
  update: SafeUpdateWithoutTxsInput;
};

export type SafeWhereInput = {
  AND?: InputMaybe<Array<SafeWhereInput>>;
  NOT?: InputMaybe<Array<SafeWhereInput>>;
  OR?: InputMaybe<Array<SafeWhereInput>>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  comments?: InputMaybe<CommentListRelationFilter>;
  deploySalt?: InputMaybe<StringNullableFilter>;
  groups?: InputMaybe<GroupListRelationFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
  txs?: InputMaybe<TxListRelationFilter>;
};

export type SafeWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
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
  createdAt: Scalars['DateTime'];
  finalized: Scalars['Boolean'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: Maybe<Scalars['Decimal']>;
  hash: Scalars['ID'];
  id: Scalars['String'];
  nonce: Scalars['Int'];
  safeId: Scalars['String'];
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

export type SubmissionScalarWhereInput = {
  AND?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  NOT?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  OR?: InputMaybe<Array<SubmissionScalarWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  finalized?: InputMaybe<BoolFilter>;
  gasLimit?: InputMaybe<DecimalFilter>;
  gasPrice?: InputMaybe<DecimalNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  safeId?: InputMaybe<StringFilter>;
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
  createdAt?: InputMaybe<DateTimeFilter>;
  finalized?: InputMaybe<BoolFilter>;
  gasLimit?: InputMaybe<DecimalFilter>;
  gasPrice?: InputMaybe<DecimalNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<IntFilter>;
  safeId?: InputMaybe<StringFilter>;
  tx?: InputMaybe<TxRelationFilter>;
  txHash?: InputMaybe<StringFilter>;
};

export type SubmissionWhereUniqueInput = {
  hash?: InputMaybe<Scalars['String']>;
};

export type Tx = {
  __typename?: 'Tx';
  _count: TxCount;
  approvals?: Maybe<Array<Approval>>;
  createdAt: Scalars['DateTime'];
  data: Scalars['String'];
  hash: Scalars['String'];
  id: Scalars['String'];
  safe: Safe;
  safeId: Scalars['String'];
  salt: Scalars['String'];
  submissions?: Maybe<Array<Submission>>;
  to: Scalars['String'];
  value: Scalars['String'];
};

export type TxCount = {
  __typename?: 'TxCount';
  approvals: Scalars['Int'];
  submissions: Scalars['Int'];
};

export type TxCreateManySafeInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  salt: Scalars['String'];
  to: Scalars['String'];
  value: Scalars['String'];
};

export type TxCreateManySafeInputEnvelope = {
  data: Array<TxCreateManySafeInput>;
  skipDuplicates?: InputMaybe<Scalars['Boolean']>;
};

export type TxCreateNestedManyWithoutSafeInput = {
  connect?: InputMaybe<Array<TxWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<TxCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<TxCreateWithoutSafeInput>>;
  createMany?: InputMaybe<TxCreateManySafeInputEnvelope>;
};

export type TxCreateNestedOneWithoutApprovalsInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<TxCreateWithoutApprovalsInput>;
};

export type TxCreateOrConnectWithoutApprovalsInput = {
  create: TxCreateWithoutApprovalsInput;
  where: TxWhereUniqueInput;
};

export type TxCreateOrConnectWithoutSafeInput = {
  create: TxCreateWithoutSafeInput;
  where: TxWhereUniqueInput;
};

export type TxCreateWithoutApprovalsInput = {
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  safe: SafeCreateNestedOneWithoutTxsInput;
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
};

export type TxCreateWithoutSafeInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutTxInput>;
  createdAt?: InputMaybe<Scalars['DateTime']>;
  data: Scalars['String'];
  hash: Scalars['String'];
  salt: Scalars['String'];
  submissions?: InputMaybe<SubmissionCreateNestedManyWithoutTxInput>;
  to: Scalars['String'];
  value: Scalars['String'];
};

export type TxInput = {
  data: Scalars['Bytes'];
  salt: Scalars['Bytes32'];
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

export type TxRelationFilter = {
  is?: InputMaybe<TxWhereInput>;
  isNot?: InputMaybe<TxWhereInput>;
};

export type TxSafeIdHashCompoundUniqueInput = {
  hash: Scalars['String'];
  safeId: Scalars['String'];
};

export type TxScalarWhereInput = {
  AND?: InputMaybe<Array<TxScalarWhereInput>>;
  NOT?: InputMaybe<Array<TxScalarWhereInput>>;
  OR?: InputMaybe<Array<TxScalarWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  data?: InputMaybe<StringFilter>;
  hash?: InputMaybe<StringFilter>;
  safeId?: InputMaybe<StringFilter>;
  salt?: InputMaybe<StringFilter>;
  to?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
};

export type TxUpdateManyMutationInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type TxUpdateManyWithWhereWithoutSafeInput = {
  data: TxUpdateManyMutationInput;
  where: TxScalarWhereInput;
};

export type TxUpdateManyWithoutSafeNestedInput = {
  connect?: InputMaybe<Array<TxWhereUniqueInput>>;
  connectOrCreate?: InputMaybe<Array<TxCreateOrConnectWithoutSafeInput>>;
  create?: InputMaybe<Array<TxCreateWithoutSafeInput>>;
  createMany?: InputMaybe<TxCreateManySafeInputEnvelope>;
  delete?: InputMaybe<Array<TxWhereUniqueInput>>;
  deleteMany?: InputMaybe<Array<TxScalarWhereInput>>;
  disconnect?: InputMaybe<Array<TxWhereUniqueInput>>;
  set?: InputMaybe<Array<TxWhereUniqueInput>>;
  update?: InputMaybe<Array<TxUpdateWithWhereUniqueWithoutSafeInput>>;
  updateMany?: InputMaybe<Array<TxUpdateManyWithWhereWithoutSafeInput>>;
  upsert?: InputMaybe<Array<TxUpsertWithWhereUniqueWithoutSafeInput>>;
};

export type TxUpdateOneRequiredWithoutApprovalsNestedInput = {
  connect?: InputMaybe<TxWhereUniqueInput>;
  connectOrCreate?: InputMaybe<TxCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<TxCreateWithoutApprovalsInput>;
  update?: InputMaybe<TxUpdateWithoutApprovalsInput>;
  upsert?: InputMaybe<TxUpsertWithoutApprovalsInput>;
};

export type TxUpdateWithWhereUniqueWithoutSafeInput = {
  data: TxUpdateWithoutSafeInput;
  where: TxWhereUniqueInput;
};

export type TxUpdateWithoutApprovalsInput = {
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  safe?: InputMaybe<SafeUpdateOneRequiredWithoutTxsNestedInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type TxUpdateWithoutSafeInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutTxNestedInput>;
  createdAt?: InputMaybe<DateTimeFieldUpdateOperationsInput>;
  data?: InputMaybe<StringFieldUpdateOperationsInput>;
  hash?: InputMaybe<StringFieldUpdateOperationsInput>;
  salt?: InputMaybe<StringFieldUpdateOperationsInput>;
  submissions?: InputMaybe<SubmissionUpdateManyWithoutTxNestedInput>;
  to?: InputMaybe<StringFieldUpdateOperationsInput>;
  value?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type TxUpsertWithWhereUniqueWithoutSafeInput = {
  create: TxCreateWithoutSafeInput;
  update: TxUpdateWithoutSafeInput;
  where: TxWhereUniqueInput;
};

export type TxUpsertWithoutApprovalsInput = {
  create: TxCreateWithoutApprovalsInput;
  update: TxUpdateWithoutApprovalsInput;
};

export type TxWhereInput = {
  AND?: InputMaybe<Array<TxWhereInput>>;
  NOT?: InputMaybe<Array<TxWhereInput>>;
  OR?: InputMaybe<Array<TxWhereInput>>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  data?: InputMaybe<StringFilter>;
  hash?: InputMaybe<StringFilter>;
  safe?: InputMaybe<SafeRelationFilter>;
  safeId?: InputMaybe<StringFilter>;
  salt?: InputMaybe<StringFilter>;
  submissions?: InputMaybe<SubmissionListRelationFilter>;
  to?: InputMaybe<StringFilter>;
  value?: InputMaybe<StringFilter>;
};

export type TxWhereUniqueInput = {
  safeId_hash?: InputMaybe<TxSafeIdHashCompoundUniqueInput>;
};

export type User = {
  __typename?: 'User';
  _count: UserCount;
  approvals?: Maybe<Array<Approval>>;
  comments?: Maybe<Array<Comment>>;
  contacts?: Maybe<Array<Contact>>;
  groups?: Maybe<Array<Approver>>;
  id: Scalars['ID'];
  reactions?: Maybe<Array<Reaction>>;
  safes: Array<Safe>;
};

export type UserCount = {
  __typename?: 'UserCount';
  approvals: Scalars['Int'];
  comments: Scalars['Int'];
  contacts: Scalars['Int'];
  groups: Scalars['Int'];
  reactions: Scalars['Int'];
};

export type UserCreateInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  groups?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateNestedOneWithoutApprovalsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutApprovalsInput>;
  create?: InputMaybe<UserCreateWithoutApprovalsInput>;
};

export type UserCreateNestedOneWithoutCommentsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<UserCreateWithoutCommentsInput>;
};

export type UserCreateNestedOneWithoutGroupsInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutGroupsInput>;
  create?: InputMaybe<UserCreateWithoutGroupsInput>;
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

export type UserCreateOrConnectWithoutCommentsInput = {
  create: UserCreateWithoutCommentsInput;
  where: UserWhereUniqueInput;
};

export type UserCreateOrConnectWithoutGroupsInput = {
  create: UserCreateWithoutGroupsInput;
  where: UserWhereUniqueInput;
};

export type UserCreateOrConnectWithoutReactionsInput = {
  create: UserCreateWithoutReactionsInput;
  where: UserWhereUniqueInput;
};

export type UserCreateWithoutApprovalsInput = {
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  groups?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  groups?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateWithoutGroupsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
  reactions?: InputMaybe<ReactionCreateNestedManyWithoutUserInput>;
};

export type UserCreateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalCreateNestedManyWithoutUserInput>;
  comments?: InputMaybe<CommentCreateNestedManyWithoutAuthorInput>;
  contacts?: InputMaybe<ContactCreateNestedManyWithoutUserInput>;
  groups?: InputMaybe<ApproverCreateNestedManyWithoutUserInput>;
  id: Scalars['String'];
};

export type UserOrderByWithRelationInput = {
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  contacts?: InputMaybe<ContactOrderByRelationAggregateInput>;
  groups?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  id?: InputMaybe<SortOrder>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
};

export type UserRelationFilter = {
  is?: InputMaybe<UserWhereInput>;
  isNot?: InputMaybe<UserWhereInput>;
};

export type UserUpdateInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  groups?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
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

export type UserUpdateOneRequiredWithoutCommentsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutCommentsInput>;
  create?: InputMaybe<UserCreateWithoutCommentsInput>;
  update?: InputMaybe<UserUpdateWithoutCommentsInput>;
  upsert?: InputMaybe<UserUpsertWithoutCommentsInput>;
};

export type UserUpdateOneRequiredWithoutGroupsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutGroupsInput>;
  create?: InputMaybe<UserCreateWithoutGroupsInput>;
  update?: InputMaybe<UserUpdateWithoutGroupsInput>;
  upsert?: InputMaybe<UserUpsertWithoutGroupsInput>;
};

export type UserUpdateOneRequiredWithoutReactionsNestedInput = {
  connect?: InputMaybe<UserWhereUniqueInput>;
  connectOrCreate?: InputMaybe<UserCreateOrConnectWithoutReactionsInput>;
  create?: InputMaybe<UserCreateWithoutReactionsInput>;
  update?: InputMaybe<UserUpdateWithoutReactionsInput>;
  upsert?: InputMaybe<UserUpsertWithoutReactionsInput>;
};

export type UserUpdateWithoutApprovalsInput = {
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  groups?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateWithoutCommentsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  groups?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateWithoutGroupsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
  reactions?: InputMaybe<ReactionUpdateManyWithoutUserNestedInput>;
};

export type UserUpdateWithoutReactionsInput = {
  approvals?: InputMaybe<ApprovalUpdateManyWithoutUserNestedInput>;
  comments?: InputMaybe<CommentUpdateManyWithoutAuthorNestedInput>;
  contacts?: InputMaybe<ContactUpdateManyWithoutUserNestedInput>;
  groups?: InputMaybe<ApproverUpdateManyWithoutUserNestedInput>;
  id?: InputMaybe<StringFieldUpdateOperationsInput>;
};

export type UserUpsertWithoutApprovalsInput = {
  create: UserCreateWithoutApprovalsInput;
  update: UserUpdateWithoutApprovalsInput;
};

export type UserUpsertWithoutCommentsInput = {
  create: UserCreateWithoutCommentsInput;
  update: UserUpdateWithoutCommentsInput;
};

export type UserUpsertWithoutGroupsInput = {
  create: UserCreateWithoutGroupsInput;
  update: UserUpdateWithoutGroupsInput;
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
  comments?: InputMaybe<CommentListRelationFilter>;
  contacts?: InputMaybe<ContactListRelationFilter>;
  groups?: InputMaybe<ApproverListRelationFilter>;
  id?: InputMaybe<StringFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
};

export type UserWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type CreateCommentMutationVariables = Exact<{
  safe: Scalars['Address'];
  key: Scalars['Id'];
  content: Scalars['String'];
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', id: string, safeId: string, key: string, nonce: number, authorId: string, content: string, createdAt: any, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', id: string, safeId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null }> | null } };

export type DeleteCommentMutationVariables = Exact<{
  safe: Scalars['Address'];
  key: Scalars['Id'];
  nonce: Scalars['Int'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment?: { __typename?: 'Comment', id: string } | null };

export type ReactToCommentMutationVariables = Exact<{
  safe: Scalars['Address'];
  key: Scalars['Id'];
  nonce: Scalars['Int'];
  emojis: Array<Scalars['String']> | Scalars['String'];
}>;


export type ReactToCommentMutation = { __typename?: 'Mutation', reactToComment?: { __typename?: 'Reaction', id: string, safeId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null } | null };

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

export type UpsertGroupMutationVariables = Exact<{
  safe: Scalars['Address'];
  group: GroupInput;
}>;


export type UpsertGroupMutation = { __typename?: 'Mutation', upsertGroup?: { __typename?: 'Group', id: string, ref: string, safeId: string, name: string, approvers?: Array<{ __typename?: 'Approver', userId: string, weight: any }> | null } | null };

export type SubmitTxExecutionMutationVariables = Exact<{
  safe: Scalars['Address'];
  txHash: Scalars['Bytes32'];
  submission: SubmissionInput;
}>;


export type SubmitTxExecutionMutation = { __typename?: 'Mutation', submitTxExecution: { __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any } };

export type ApproveTxMutationVariables = Exact<{
  safe: Scalars['Address'];
  txHash: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
}>;


export type ApproveTxMutation = { __typename?: 'Mutation', approve?: { __typename?: 'Tx', id: string } | null };

export type ProposeTxMutationVariables = Exact<{
  safe: Scalars['Address'];
  tx: TxInput;
  signature: Scalars['Bytes'];
}>;


export type ProposeTxMutation = { __typename?: 'Mutation', proposeTx: { __typename?: 'Tx', id: string, safeId: string, hash: string, to: string, value: string, data: string, salt: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature: string, createdAt: any }> | null, submissions?: Array<{ __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any }> | null } };

export type RevokeApprovalMutationVariables = Exact<{
  safe: Scalars['Address'];
  txHash: Scalars['Bytes32'];
}>;


export type RevokeApprovalMutation = { __typename?: 'Mutation', revokeApproval: { __typename?: 'RevokeApprovalResp', id?: string | null } };

export type UseFaucetMutationVariables = Exact<{
  recipient: Scalars['Address'];
}>;


export type UseFaucetMutation = { __typename?: 'Mutation', requestFunds: boolean };

export type UpsertSafeMutationVariables = Exact<{
  safe: Scalars['Address'];
  deploySalt?: InputMaybe<Scalars['Bytes32']>;
  name: Scalars['String'];
  groups?: InputMaybe<Array<GroupInput> | GroupInput>;
}>;


export type UpsertSafeMutation = { __typename?: 'Mutation', upsertSafe: { __typename?: 'Safe', id: string, name: string, deploySalt?: string | null, groups?: Array<{ __typename?: 'Group', id: string, ref: string, safeId: string, name: string, approvers?: Array<{ __typename?: 'Approver', userId: string, weight: any }> | null }> | null } };

export type GroupFieldsFragment = { __typename?: 'Group', id: string, ref: string, safeId: string, name: string, approvers?: Array<{ __typename?: 'Approver', userId: string, weight: any }> | null };

export type SafeFieldsFragment = { __typename?: 'Safe', id: string, name: string, deploySalt?: string | null, groups?: Array<{ __typename?: 'Group', id: string, ref: string, safeId: string, name: string, approvers?: Array<{ __typename?: 'Approver', userId: string, weight: any }> | null }> | null };

export type UserSafesQueryVariables = Exact<{ [key: string]: never; }>;


export type UserSafesQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, safes: Array<{ __typename?: 'Safe', id: string, name: string, deploySalt?: string | null, groups?: Array<{ __typename?: 'Group', id: string, ref: string, safeId: string, name: string, approvers?: Array<{ __typename?: 'Approver', userId: string, weight: any }> | null }> | null }> } | null };

export type SubmissionFieldsFragment = { __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any };

export type TxFieldsFragment = { __typename?: 'Tx', id: string, safeId: string, hash: string, to: string, value: string, data: string, salt: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature: string, createdAt: any }> | null, submissions?: Array<{ __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any }> | null };

export type ApiTxsQueryVariables = Exact<{
  safe: Scalars['Address'];
}>;


export type ApiTxsQuery = { __typename?: 'Query', txs: Array<{ __typename?: 'Tx', id: string, safeId: string, hash: string, to: string, value: string, data: string, salt: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature: string, createdAt: any }> | null, submissions?: Array<{ __typename?: 'Submission', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, finalized: boolean, createdAt: any }> | null }> };

export type ReactionFieldsFragment = { __typename?: 'Reaction', id: string, safeId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null };

export type CommentFieldsFragment = { __typename?: 'Comment', id: string, safeId: string, key: string, nonce: number, authorId: string, content: string, createdAt: any, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', id: string, safeId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null }> | null };

export type CommentsQueryVariables = Exact<{
  safe: Scalars['Address'];
  key: Scalars['Id'];
}>;


export type CommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: string, safeId: string, key: string, nonce: number, authorId: string, content: string, createdAt: any, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', id: string, safeId: string, key: string, nonce: number, userId: string, emojis?: Array<string> | null }> | null }> };

export type ContactFieldsFragment = { __typename?: 'Contact', id: string, addr: string, name: string };

export type ContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsQuery = { __typename?: 'Query', contacts: Array<{ __typename?: 'Contact', id: string, addr: string, name: string }> };

export type ContractMethodQueryVariables = Exact<{
  contract: Scalars['Address'];
  sighash: Scalars['Bytes'];
}>;


export type ContractMethodQuery = { __typename?: 'Query', contractMethod?: { __typename?: 'ContractMethod', id: string, fragment: any } | null };

export const GroupFieldsFragmentDoc = gql`
    fragment GroupFields on Group {
  id
  ref
  safeId
  approvers {
    userId
    weight
  }
  name
}
    `;
export const SafeFieldsFragmentDoc = gql`
    fragment SafeFields on Safe {
  id
  name
  deploySalt
  groups {
    ...GroupFields
  }
}
    ${GroupFieldsFragmentDoc}`;
export const SubmissionFieldsFragmentDoc = gql`
    fragment SubmissionFields on Submission {
  id
  hash
  nonce
  gasLimit
  gasPrice
  finalized
  createdAt
}
    `;
export const TxFieldsFragmentDoc = gql`
    fragment TxFields on Tx {
  id
  safeId
  hash
  to
  value
  data
  salt
  approvals {
    userId
    signature
    createdAt
  }
  createdAt
  submissions {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;
export const ReactionFieldsFragmentDoc = gql`
    fragment ReactionFields on Reaction {
  id
  safeId
  key
  nonce
  userId
  emojis
}
    `;
export const CommentFieldsFragmentDoc = gql`
    fragment CommentFields on Comment {
  id
  safeId
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
export const ContactFieldsFragmentDoc = gql`
    fragment ContactFields on Contact {
  id
  addr
  name
}
    `;
export const CreateCommentDocument = gql`
    mutation CreateComment($safe: Address!, $key: Id!, $content: String!) {
  createComment(safe: $safe, key: $key, content: $content) {
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
 *      safe: // value for 'safe'
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
    mutation DeleteComment($safe: Address!, $key: Id!, $nonce: Int!) {
  deleteComment(safe: $safe, key: $key, nonce: $nonce) {
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
 *      safe: // value for 'safe'
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
    mutation ReactToComment($safe: Address!, $key: Id!, $nonce: Int!, $emojis: [String!]!) {
  reactToComment(safe: $safe, key: $key, nonce: $nonce, emojis: $emojis) {
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
 *      safe: // value for 'safe'
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
export const UpsertGroupDocument = gql`
    mutation UpsertGroup($safe: Address!, $group: GroupInput!) {
  upsertGroup(safe: $safe, group: $group) {
    ...GroupFields
  }
}
    ${GroupFieldsFragmentDoc}`;
export type UpsertGroupMutationFn = Apollo.MutationFunction<UpsertGroupMutation, UpsertGroupMutationVariables>;

/**
 * __useUpsertGroupMutation__
 *
 * To run a mutation, you first call `useUpsertGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGroupMutation, { data, loading, error }] = useUpsertGroupMutation({
 *   variables: {
 *      safe: // value for 'safe'
 *      group: // value for 'group'
 *   },
 * });
 */
export function useUpsertGroupMutation(baseOptions?: Apollo.MutationHookOptions<UpsertGroupMutation, UpsertGroupMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertGroupMutation, UpsertGroupMutationVariables>(UpsertGroupDocument, options);
      }
export type UpsertGroupMutationHookResult = ReturnType<typeof useUpsertGroupMutation>;
export type UpsertGroupMutationResult = Apollo.MutationResult<UpsertGroupMutation>;
export type UpsertGroupMutationOptions = Apollo.BaseMutationOptions<UpsertGroupMutation, UpsertGroupMutationVariables>;
export const SubmitTxExecutionDocument = gql`
    mutation SubmitTxExecution($safe: Address!, $txHash: Bytes32!, $submission: SubmissionInput!) {
  submitTxExecution(safe: $safe, txHash: $txHash, submission: $submission) {
    ...SubmissionFields
  }
}
    ${SubmissionFieldsFragmentDoc}`;
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
 *      safe: // value for 'safe'
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
export const ApproveTxDocument = gql`
    mutation ApproveTx($safe: Address!, $txHash: Bytes32!, $signature: Bytes!) {
  approve(safe: $safe, txHash: $txHash, signature: $signature) {
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
 *      safe: // value for 'safe'
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
export const ProposeTxDocument = gql`
    mutation ProposeTx($safe: Address!, $tx: TxInput!, $signature: Bytes!) {
  proposeTx(safe: $safe, tx: $tx, signature: $signature) {
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
 *      safe: // value for 'safe'
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
export const RevokeApprovalDocument = gql`
    mutation RevokeApproval($safe: Address!, $txHash: Bytes32!) {
  revokeApproval(safe: $safe, txHash: $txHash) {
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
 *      safe: // value for 'safe'
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
export const UseFaucetDocument = gql`
    mutation UseFaucet($recipient: Address!) {
  requestFunds(recipient: $recipient)
}
    `;
export type UseFaucetMutationFn = Apollo.MutationFunction<UseFaucetMutation, UseFaucetMutationVariables>;

/**
 * __useUseFaucetMutation__
 *
 * To run a mutation, you first call `useUseFaucetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUseFaucetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [useFaucetMutation, { data, loading, error }] = useUseFaucetMutation({
 *   variables: {
 *      recipient: // value for 'recipient'
 *   },
 * });
 */
export function useUseFaucetMutation(baseOptions?: Apollo.MutationHookOptions<UseFaucetMutation, UseFaucetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UseFaucetMutation, UseFaucetMutationVariables>(UseFaucetDocument, options);
      }
export type UseFaucetMutationHookResult = ReturnType<typeof useUseFaucetMutation>;
export type UseFaucetMutationResult = Apollo.MutationResult<UseFaucetMutation>;
export type UseFaucetMutationOptions = Apollo.BaseMutationOptions<UseFaucetMutation, UseFaucetMutationVariables>;
export const UpsertSafeDocument = gql`
    mutation UpsertSafe($safe: Address!, $deploySalt: Bytes32, $name: String!, $groups: [GroupInput!]) {
  upsertSafe(safe: $safe, deploySalt: $deploySalt, name: $name, groups: $groups) {
    ...SafeFields
  }
}
    ${SafeFieldsFragmentDoc}`;
export type UpsertSafeMutationFn = Apollo.MutationFunction<UpsertSafeMutation, UpsertSafeMutationVariables>;

/**
 * __useUpsertSafeMutation__
 *
 * To run a mutation, you first call `useUpsertSafeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertSafeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertSafeMutation, { data, loading, error }] = useUpsertSafeMutation({
 *   variables: {
 *      safe: // value for 'safe'
 *      deploySalt: // value for 'deploySalt'
 *      name: // value for 'name'
 *      groups: // value for 'groups'
 *   },
 * });
 */
export function useUpsertSafeMutation(baseOptions?: Apollo.MutationHookOptions<UpsertSafeMutation, UpsertSafeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertSafeMutation, UpsertSafeMutationVariables>(UpsertSafeDocument, options);
      }
export type UpsertSafeMutationHookResult = ReturnType<typeof useUpsertSafeMutation>;
export type UpsertSafeMutationResult = Apollo.MutationResult<UpsertSafeMutation>;
export type UpsertSafeMutationOptions = Apollo.BaseMutationOptions<UpsertSafeMutation, UpsertSafeMutationVariables>;
export const UserSafesDocument = gql`
    query UserSafes {
  user {
    id
    safes {
      ...SafeFields
    }
  }
}
    ${SafeFieldsFragmentDoc}`;

/**
 * __useUserSafesQuery__
 *
 * To run a query within a React component, call `useUserSafesQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserSafesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserSafesQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserSafesQuery(baseOptions?: Apollo.QueryHookOptions<UserSafesQuery, UserSafesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserSafesQuery, UserSafesQueryVariables>(UserSafesDocument, options);
      }
export function useUserSafesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserSafesQuery, UserSafesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserSafesQuery, UserSafesQueryVariables>(UserSafesDocument, options);
        }
export type UserSafesQueryHookResult = ReturnType<typeof useUserSafesQuery>;
export type UserSafesLazyQueryHookResult = ReturnType<typeof useUserSafesLazyQuery>;
export type UserSafesQueryResult = Apollo.QueryResult<UserSafesQuery, UserSafesQueryVariables>;
export const ApiTxsDocument = gql`
    query ApiTxs($safe: Address!) {
  txs(safe: $safe) {
    ...TxFields
  }
}
    ${TxFieldsFragmentDoc}`;

/**
 * __useApiTxsQuery__
 *
 * To run a query within a React component, call `useApiTxsQuery` and pass it any options that fit your needs.
 * When your component renders, `useApiTxsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useApiTxsQuery({
 *   variables: {
 *      safe: // value for 'safe'
 *   },
 * });
 */
export function useApiTxsQuery(baseOptions: Apollo.QueryHookOptions<ApiTxsQuery, ApiTxsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ApiTxsQuery, ApiTxsQueryVariables>(ApiTxsDocument, options);
      }
export function useApiTxsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ApiTxsQuery, ApiTxsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ApiTxsQuery, ApiTxsQueryVariables>(ApiTxsDocument, options);
        }
export type ApiTxsQueryHookResult = ReturnType<typeof useApiTxsQuery>;
export type ApiTxsLazyQueryHookResult = ReturnType<typeof useApiTxsLazyQuery>;
export type ApiTxsQueryResult = Apollo.QueryResult<ApiTxsQuery, ApiTxsQueryVariables>;
export const CommentsDocument = gql`
    query Comments($safe: Address!, $key: Id!) {
  comments(safe: $safe, key: $key) {
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
 *      safe: // value for 'safe'
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