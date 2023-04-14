export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Ethereum address */
  Address: any;
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: any;
  /** bytes hex string */
  Bytes: any;
  /** 32-byte hex string */
  Bytes32: any;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
  /** An arbitrary-precision Decimal type */
  Decimal: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** Policy key: an unsigned integer [0, 4294967295] */
  PolicyKey: any;
  /** 256-bit unsigned integer */
  Uint256: any;
};

export enum AbiSource {
  Decompiled = 'DECOMPILED',
  Standard = 'STANDARD',
  Verified = 'VERIFIED'
}

export type Account = {
  __typename?: 'Account';
  _count: AccountCount;
  comments?: Maybe<Array<Comment>>;
  deploySalt: Scalars['String'];
  id: Scalars['String'];
  impl: Scalars['String'];
  isActive: Scalars['Boolean'];
  name: Scalars['String'];
  policies?: Maybe<Array<Policy>>;
  policyStates?: Maybe<Array<PolicyState>>;
  proposals?: Maybe<Array<Proposal>>;
};

export type AccountCount = {
  __typename?: 'AccountCount';
  comments: Scalars['Int'];
  policies: Scalars['Int'];
  policyStates: Scalars['Int'];
  proposals: Scalars['Int'];
};

export enum AccountEvent {
  Create = 'create',
  Update = 'update'
}

export type AccountOrderByWithRelationInput = {
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  deploySalt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  impl?: InputMaybe<SortOrder>;
  isActive?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  policies?: InputMaybe<PolicyOrderByRelationAggregateInput>;
  policyStates?: InputMaybe<PolicyStateOrderByRelationAggregateInput>;
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
};

export type AccountRelationFilter = {
  is?: InputMaybe<AccountWhereInput>;
  isNot?: InputMaybe<AccountWhereInput>;
};

export enum AccountScalarFieldEnum {
  DeploySalt = 'deploySalt',
  Id = 'id',
  Impl = 'impl',
  IsActive = 'isActive',
  Name = 'name'
}

export type AccountWhereInput = {
  AND?: InputMaybe<Array<AccountWhereInput>>;
  NOT?: InputMaybe<Array<AccountWhereInput>>;
  OR?: InputMaybe<Array<AccountWhereInput>>;
  comments?: InputMaybe<CommentListRelationFilter>;
  deploySalt?: InputMaybe<StringFilter>;
  id?: InputMaybe<StringFilter>;
  impl?: InputMaybe<StringFilter>;
  isActive?: InputMaybe<BoolFilter>;
  name?: InputMaybe<StringFilter>;
  policies?: InputMaybe<PolicyListRelationFilter>;
  policyStates?: InputMaybe<PolicyStateListRelationFilter>;
  proposals?: InputMaybe<ProposalListRelationFilter>;
};

export type AccountWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Approval = {
  __typename?: 'Approval';
  createdAt: Scalars['DateTime'];
  proposal: Proposal;
  proposalId: Scalars['String'];
  signature?: Maybe<Scalars['String']>;
  user: User;
  userId: Scalars['String'];
};

export type ApprovalListRelationFilter = {
  every?: InputMaybe<ApprovalWhereInput>;
  none?: InputMaybe<ApprovalWhereInput>;
  some?: InputMaybe<ApprovalWhereInput>;
};

export type ApprovalOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ApprovalWhereInput = {
  AND?: InputMaybe<Array<ApprovalWhereInput>>;
  NOT?: InputMaybe<Array<ApprovalWhereInput>>;
  OR?: InputMaybe<Array<ApprovalWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringFilter>;
  signature?: InputMaybe<StringNullableFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type Approver = {
  __typename?: 'Approver';
  id: Scalars['String'];
  state: PolicyState;
  stateId: Scalars['BigInt'];
  user: User;
  userId: Scalars['String'];
};

export type ApproverListRelationFilter = {
  every?: InputMaybe<ApproverWhereInput>;
  none?: InputMaybe<ApproverWhereInput>;
  some?: InputMaybe<ApproverWhereInput>;
};

export type ApproverOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ApproverWhereInput = {
  AND?: InputMaybe<Array<ApproverWhereInput>>;
  NOT?: InputMaybe<Array<ApproverWhereInput>>;
  OR?: InputMaybe<Array<ApproverWhereInput>>;
  state?: InputMaybe<PolicyStateRelationFilter>;
  stateId?: InputMaybe<BigIntFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type BigIntFilter = {
  equals?: InputMaybe<Scalars['BigInt']>;
  gt?: InputMaybe<Scalars['BigInt']>;
  gte?: InputMaybe<Scalars['BigInt']>;
  in?: InputMaybe<Array<Scalars['BigInt']>>;
  lt?: InputMaybe<Scalars['BigInt']>;
  lte?: InputMaybe<Scalars['BigInt']>;
  not?: InputMaybe<NestedBigIntFilter>;
  notIn?: InputMaybe<Array<Scalars['BigInt']>>;
};

export type BigIntNullableFilter = {
  equals?: InputMaybe<Scalars['BigInt']>;
  gt?: InputMaybe<Scalars['BigInt']>;
  gte?: InputMaybe<Scalars['BigInt']>;
  in?: InputMaybe<Array<Scalars['BigInt']>>;
  lt?: InputMaybe<Scalars['BigInt']>;
  lte?: InputMaybe<Scalars['BigInt']>;
  not?: InputMaybe<NestedBigIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['BigInt']>>;
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
  id: Scalars['Int'];
  key: Scalars['String'];
  reactions?: Maybe<Array<Reaction>>;
  updatedAt: Scalars['DateTime'];
};

export type CommentCount = {
  __typename?: 'CommentCount';
  reactions: Scalars['Int'];
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
  id?: InputMaybe<IntFilter>;
  key?: InputMaybe<StringFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
};

export type Contact = {
  __typename?: 'Contact';
  addr: Scalars['String'];
  name: Scalars['String'];
  user: User;
  userId: Scalars['String'];
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

export type ContactObject = {
  __typename?: 'ContactObject';
  addr: Scalars['Address'];
  id: Scalars['String'];
  name: Scalars['String'];
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

export type Contract = {
  __typename?: 'Contract';
  _count: ContractCount;
  functions?: Maybe<Array<ContractFunction>>;
  id: Scalars['String'];
};

export type ContractCount = {
  __typename?: 'ContractCount';
  functions: Scalars['Int'];
};

export type ContractFunction = {
  __typename?: 'ContractFunction';
  abi: Scalars['JSON'];
  contract?: Maybe<Contract>;
  contractId?: Maybe<Scalars['String']>;
  id: Scalars['Int'];
  selector: Scalars['String'];
  source: AbiSource;
  sourceConfidence: ContractSourceConfidence;
};

export type ContractFunctionInput = {
  contract: Scalars['Address'];
  selector: Scalars['Bytes'];
};

export type ContractInput = {
  contract: Scalars['Address'];
};

export enum ContractSourceConfidence {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium'
}

export type CreateAccountInput = {
  name: Scalars['String'];
  policies: Array<PolicyInput>;
};

export type CreatePolicyInput = {
  account: Scalars['Address'];
  /** Signers that are required to approve */
  approvers?: InputMaybe<Array<Scalars['Address']>>;
  name?: InputMaybe<Scalars['String']>;
  permissions: PermissionsInput;
  /** Defaults to all approvers */
  threshold?: InputMaybe<Scalars['Float']>;
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
  approve: Proposal;
  createAccount: Account;
  createComment: Comment;
  createPolicy: Policy;
  deleteComment: Comment;
  deleteContact: Contact;
  propose: Proposal;
  reactToComment?: Maybe<Reaction>;
  reject: Proposal;
  removePolicy: Policy;
  removeProposal: Proposal;
  requestTokens: Array<Scalars['Address']>;
  updateAccount: Account;
  updatePolicy: Policy;
  updateUser: User;
  upsertContact: ContactObject;
};


export type MutationApproveArgs = {
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
};


export type MutationCreateAccountArgs = {
  args: CreateAccountInput;
};


export type MutationCreateCommentArgs = {
  account: Scalars['Address'];
  content: Scalars['String'];
  key: Scalars['String'];
};


export type MutationCreatePolicyArgs = {
  args: CreatePolicyInput;
};


export type MutationDeleteCommentArgs = {
  id: Scalars['Float'];
};


export type MutationDeleteContactArgs = {
  addr: Scalars['Address'];
};


export type MutationProposeArgs = {
  account: Scalars['Address'];
  data?: InputMaybe<Scalars['Bytes']>;
  feeToken?: InputMaybe<Scalars['Address']>;
  gasLimit?: InputMaybe<Scalars['Uint256']>;
  nonce?: InputMaybe<Scalars['Uint256']>;
  signature?: InputMaybe<Scalars['Bytes']>;
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
};


export type MutationReactToCommentArgs = {
  emojis: Array<Scalars['String']>;
  id: Scalars['Float'];
};


export type MutationRejectArgs = {
  id: Scalars['Bytes32'];
};


export type MutationRemovePolicyArgs = {
  args: UniquePolicyInput;
};


export type MutationRemoveProposalArgs = {
  id: Scalars['Bytes32'];
};


export type MutationRequestTokensArgs = {
  recipient: Scalars['Address'];
};


export type MutationUpdateAccountArgs = {
  args: UpdateAccountInput;
};


export type MutationUpdatePolicyArgs = {
  args: UpdatePolicyInput;
};


export type MutationUpdateUserArgs = {
  name?: InputMaybe<Scalars['String']>;
  pushToken?: InputMaybe<Scalars['String']>;
};


export type MutationUpsertContactArgs = {
  name: Scalars['String'];
  newAddr: Scalars['Address'];
  prevAddr?: InputMaybe<Scalars['Address']>;
};

export type NestedBigIntFilter = {
  equals?: InputMaybe<Scalars['BigInt']>;
  gt?: InputMaybe<Scalars['BigInt']>;
  gte?: InputMaybe<Scalars['BigInt']>;
  in?: InputMaybe<Array<Scalars['BigInt']>>;
  lt?: InputMaybe<Scalars['BigInt']>;
  lte?: InputMaybe<Scalars['BigInt']>;
  not?: InputMaybe<NestedBigIntFilter>;
  notIn?: InputMaybe<Array<Scalars['BigInt']>>;
};

export type NestedBigIntNullableFilter = {
  equals?: InputMaybe<Scalars['BigInt']>;
  gt?: InputMaybe<Scalars['BigInt']>;
  gte?: InputMaybe<Scalars['BigInt']>;
  in?: InputMaybe<Array<Scalars['BigInt']>>;
  lt?: InputMaybe<Scalars['BigInt']>;
  lte?: InputMaybe<Scalars['BigInt']>;
  not?: InputMaybe<NestedBigIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['BigInt']>>;
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

export type PermissionsInput = {
  /** Targets that can be called */
  targets?: InputMaybe<Array<TargetInput>>;
};

export type Policy = {
  __typename?: 'Policy';
  _count: PolicyCount;
  account: Account;
  accountId: Scalars['String'];
  active?: Maybe<PolicyState>;
  activeId?: Maybe<Scalars['BigInt']>;
  draft?: Maybe<PolicyState>;
  draftId?: Maybe<Scalars['BigInt']>;
  id: Scalars['String'];
  key: Scalars['BigInt'];
  name: Scalars['String'];
  states?: Maybe<Array<PolicyState>>;
};

export type PolicyAccountIdKeyCompoundUniqueInput = {
  accountId: Scalars['String'];
  key: Scalars['BigInt'];
};

export type PolicyAccountIdNameCompoundUniqueInput = {
  accountId: Scalars['String'];
  name: Scalars['String'];
};

export type PolicyCount = {
  __typename?: 'PolicyCount';
  states: Scalars['Int'];
};

export type PolicyInput = {
  /** Signers that are required to approve */
  approvers?: InputMaybe<Array<Scalars['Address']>>;
  name?: InputMaybe<Scalars['String']>;
  permissions: PermissionsInput;
  /** Defaults to all approvers */
  threshold?: InputMaybe<Scalars['Float']>;
};

export type PolicyListRelationFilter = {
  every?: InputMaybe<PolicyWhereInput>;
  none?: InputMaybe<PolicyWhereInput>;
  some?: InputMaybe<PolicyWhereInput>;
};

export type PolicyOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type PolicyOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  active?: InputMaybe<PolicyStateOrderByWithRelationInput>;
  activeId?: InputMaybe<SortOrder>;
  draft?: InputMaybe<PolicyStateOrderByWithRelationInput>;
  draftId?: InputMaybe<SortOrder>;
  key?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  states?: InputMaybe<PolicyStateOrderByRelationAggregateInput>;
};

export type PolicyRelationFilter = {
  is?: InputMaybe<PolicyWhereInput>;
  isNot?: InputMaybe<PolicyWhereInput>;
};

export enum PolicyScalarFieldEnum {
  AccountId = 'accountId',
  ActiveId = 'activeId',
  DraftId = 'draftId',
  Key = 'key',
  Name = 'name'
}

export type PolicyState = {
  __typename?: 'PolicyState';
  _count: PolicyStateCount;
  account: Account;
  accountId: Scalars['String'];
  activeOf?: Maybe<Policy>;
  approvers?: Maybe<Array<Approver>>;
  createdAt: Scalars['DateTime'];
  draftOf?: Maybe<Policy>;
  id: Scalars['BigInt'];
  isRemoved: Scalars['Boolean'];
  policy: Policy;
  policyKey: Scalars['BigInt'];
  proposal?: Maybe<Proposal>;
  proposalId?: Maybe<Scalars['String']>;
  targets?: Maybe<Array<Target>>;
  threshold: Scalars['Int'];
};

export type PolicyStateCount = {
  __typename?: 'PolicyStateCount';
  approvers: Scalars['Int'];
  targets: Scalars['Int'];
};

export type PolicyStateListRelationFilter = {
  every?: InputMaybe<PolicyStateWhereInput>;
  none?: InputMaybe<PolicyStateWhereInput>;
  some?: InputMaybe<PolicyStateWhereInput>;
};

export type PolicyStateOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type PolicyStateOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  activeOf?: InputMaybe<PolicyOrderByWithRelationInput>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  draftOf?: InputMaybe<PolicyOrderByWithRelationInput>;
  id?: InputMaybe<SortOrder>;
  isRemoved?: InputMaybe<SortOrder>;
  policy?: InputMaybe<PolicyOrderByWithRelationInput>;
  policyKey?: InputMaybe<SortOrder>;
  proposal?: InputMaybe<ProposalOrderByWithRelationInput>;
  proposalId?: InputMaybe<SortOrder>;
  targets?: InputMaybe<TargetOrderByRelationAggregateInput>;
  threshold?: InputMaybe<SortOrder>;
};

export type PolicyStateRelationFilter = {
  is?: InputMaybe<PolicyStateWhereInput>;
  isNot?: InputMaybe<PolicyStateWhereInput>;
};

export type PolicyStateWhereInput = {
  AND?: InputMaybe<Array<PolicyStateWhereInput>>;
  NOT?: InputMaybe<Array<PolicyStateWhereInput>>;
  OR?: InputMaybe<Array<PolicyStateWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  activeOf?: InputMaybe<PolicyRelationFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  draftOf?: InputMaybe<PolicyRelationFilter>;
  id?: InputMaybe<BigIntFilter>;
  isRemoved?: InputMaybe<BoolFilter>;
  policy?: InputMaybe<PolicyRelationFilter>;
  policyKey?: InputMaybe<BigIntFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringNullableFilter>;
  targets?: InputMaybe<TargetListRelationFilter>;
  threshold?: InputMaybe<IntFilter>;
};

export type PolicyWhereInput = {
  AND?: InputMaybe<Array<PolicyWhereInput>>;
  NOT?: InputMaybe<Array<PolicyWhereInput>>;
  OR?: InputMaybe<Array<PolicyWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  active?: InputMaybe<PolicyStateRelationFilter>;
  activeId?: InputMaybe<BigIntNullableFilter>;
  draft?: InputMaybe<PolicyStateRelationFilter>;
  draftId?: InputMaybe<BigIntNullableFilter>;
  key?: InputMaybe<BigIntFilter>;
  name?: InputMaybe<StringFilter>;
  states?: InputMaybe<PolicyStateListRelationFilter>;
};

export type PolicyWhereUniqueInput = {
  accountId_key?: InputMaybe<PolicyAccountIdKeyCompoundUniqueInput>;
  accountId_name?: InputMaybe<PolicyAccountIdNameCompoundUniqueInput>;
  activeId?: InputMaybe<Scalars['BigInt']>;
  draftId?: InputMaybe<Scalars['BigInt']>;
};

export type Proposal = {
  __typename?: 'Proposal';
  _count: ProposalCount;
  account: Account;
  accountId: Scalars['String'];
  approvals?: Maybe<Array<Approval>>;
  createdAt: Scalars['DateTime'];
  data?: Maybe<Scalars['String']>;
  estimatedOpGas: Scalars['BigInt'];
  feeToken?: Maybe<Scalars['String']>;
  gasLimit?: Maybe<Scalars['BigInt']>;
  id: Scalars['String'];
  nonce: Scalars['BigInt'];
  policyStates?: Maybe<Array<PolicyState>>;
  proposer: User;
  proposerId: Scalars['String'];
  rejections: Array<Rejection>;
  satisfiablePolicies: Array<SatisfiablePolicy>;
  to: Scalars['String'];
  transaction?: Maybe<Transaction>;
  transactions?: Maybe<Array<Transaction>>;
  value?: Maybe<Scalars['Decimal']>;
};

export type ProposalCount = {
  __typename?: 'ProposalCount';
  approvals: Scalars['Int'];
  policyStates: Scalars['Int'];
  transactions: Scalars['Int'];
};

export enum ProposalEvent {
  Create = 'create',
  Delete = 'delete',
  Response = 'response',
  Update = 'update'
}

export type ProposalListRelationFilter = {
  every?: InputMaybe<ProposalWhereInput>;
  none?: InputMaybe<ProposalWhereInput>;
  some?: InputMaybe<ProposalWhereInput>;
};

export type ProposalOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ProposalOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  data?: InputMaybe<SortOrder>;
  estimatedOpGas?: InputMaybe<SortOrder>;
  feeToken?: InputMaybe<SortOrder>;
  gasLimit?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  nonce?: InputMaybe<SortOrder>;
  policyStates?: InputMaybe<PolicyStateOrderByRelationAggregateInput>;
  proposer?: InputMaybe<UserOrderByWithRelationInput>;
  proposerId?: InputMaybe<SortOrder>;
  to?: InputMaybe<SortOrder>;
  transactions?: InputMaybe<TransactionOrderByRelationAggregateInput>;
  value?: InputMaybe<SortOrder>;
};

export type ProposalRelationFilter = {
  is?: InputMaybe<ProposalWhereInput>;
  isNot?: InputMaybe<ProposalWhereInput>;
};

export enum ProposalScalarFieldEnum {
  AccountId = 'accountId',
  CreatedAt = 'createdAt',
  Data = 'data',
  EstimatedOpGas = 'estimatedOpGas',
  FeeToken = 'feeToken',
  GasLimit = 'gasLimit',
  Id = 'id',
  Nonce = 'nonce',
  ProposerId = 'proposerId',
  To = 'to',
  Value = 'value'
}

export enum ProposalState {
  Executed = 'Executed',
  Executing = 'Executing',
  Pending = 'Pending'
}

export type ProposalWhereInput = {
  AND?: InputMaybe<Array<ProposalWhereInput>>;
  NOT?: InputMaybe<Array<ProposalWhereInput>>;
  OR?: InputMaybe<Array<ProposalWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  data?: InputMaybe<StringNullableFilter>;
  estimatedOpGas?: InputMaybe<BigIntFilter>;
  feeToken?: InputMaybe<StringNullableFilter>;
  gasLimit?: InputMaybe<BigIntNullableFilter>;
  id?: InputMaybe<StringFilter>;
  nonce?: InputMaybe<BigIntFilter>;
  policyStates?: InputMaybe<PolicyStateListRelationFilter>;
  proposer?: InputMaybe<UserRelationFilter>;
  proposerId?: InputMaybe<StringFilter>;
  to?: InputMaybe<StringFilter>;
  transactions?: InputMaybe<TransactionListRelationFilter>;
  value?: InputMaybe<DecimalNullableFilter>;
};

export type ProposalWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: Array<Account>;
  comments: Array<Comment>;
  contact?: Maybe<ContactObject>;
  contacts: Array<ContactObject>;
  contract?: Maybe<Contract>;
  contractFunction?: Maybe<ContractFunction>;
  policies: Array<Policy>;
  policy?: Maybe<Policy>;
  proposal?: Maybe<Proposal>;
  proposals: Array<Proposal>;
  requestableTokens: Array<Scalars['Address']>;
  user: User;
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


export type QueryCommentsArgs = {
  account: Scalars['Address'];
  key: Scalars['String'];
};


export type QueryContactArgs = {
  addr: Scalars['Address'];
};


export type QueryContactsArgs = {
  cursor?: InputMaybe<ContactWhereUniqueInput>;
  distinct?: InputMaybe<Array<ContactScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<ContactOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
};


export type QueryContractArgs = {
  args: ContractInput;
};


export type QueryContractFunctionArgs = {
  args: ContractFunctionInput;
};


export type QueryPoliciesArgs = {
  cursor?: InputMaybe<PolicyWhereUniqueInput>;
  distinct?: InputMaybe<Array<PolicyScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<PolicyOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<PolicyWhereInput>;
};


export type QueryPolicyArgs = {
  args: UniquePolicyInput;
};


export type QueryProposalArgs = {
  id: Scalars['Bytes32'];
};


export type QueryProposalsArgs = {
  accounts?: InputMaybe<Array<Scalars['Address']>>;
  cursor?: InputMaybe<ProposalWhereUniqueInput>;
  distinct?: InputMaybe<Array<ProposalScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<ProposalOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  states?: InputMaybe<Array<ProposalState>>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ProposalWhereInput>;
};


export type QueryRequestableTokensArgs = {
  recipient: Scalars['Address'];
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Address']>;
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export type Reaction = {
  __typename?: 'Reaction';
  comment: Comment;
  commentId: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  emojis?: Maybe<Array<Scalars['String']>>;
  id: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
  userId: Scalars['String'];
};

export type ReactionListRelationFilter = {
  every?: InputMaybe<ReactionWhereInput>;
  none?: InputMaybe<ReactionWhereInput>;
  some?: InputMaybe<ReactionWhereInput>;
};

export type ReactionOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type ReactionWhereInput = {
  AND?: InputMaybe<Array<ReactionWhereInput>>;
  NOT?: InputMaybe<Array<ReactionWhereInput>>;
  OR?: InputMaybe<Array<ReactionWhereInput>>;
  comment?: InputMaybe<CommentRelationFilter>;
  commentId?: InputMaybe<IntFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export type Rejection = {
  __typename?: 'Rejection';
  createdAt: Scalars['DateTime'];
  proposal: Proposal;
  proposalId: Scalars['String'];
  user: User;
  userId: Scalars['String'];
};

export type SatisfiablePolicy = {
  __typename?: 'SatisfiablePolicy';
  id: Scalars['String'];
  key: Scalars['PolicyKey'];
  requiresUserAction: Scalars['Boolean'];
  satisfied: Scalars['Boolean'];
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

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

export type Subscription = {
  __typename?: 'Subscription';
  account: Account;
  proposal: Proposal;
};


export type SubscriptionAccountArgs = {
  accounts?: InputMaybe<Array<Scalars['Address']>>;
  events?: InputMaybe<AccountEvent>;
};


export type SubscriptionProposalArgs = {
  accounts?: InputMaybe<Array<Scalars['Address']>>;
  events?: InputMaybe<Array<ProposalEvent>>;
  proposals?: InputMaybe<Array<Scalars['Bytes32']>>;
};

export type Target = {
  __typename?: 'Target';
  selectors?: Maybe<Array<Scalars['String']>>;
  state: PolicyState;
  stateId: Scalars['BigInt'];
  to: Scalars['String'];
};

export type TargetInput = {
  /** Functions that can be called on target (or *) */
  selectors: Array<Scalars['String']>;
  /** Address of target (or *) */
  to: Scalars['String'];
};

export type TargetListRelationFilter = {
  every?: InputMaybe<TargetWhereInput>;
  none?: InputMaybe<TargetWhereInput>;
  some?: InputMaybe<TargetWhereInput>;
};

export type TargetOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type TargetWhereInput = {
  AND?: InputMaybe<Array<TargetWhereInput>>;
  NOT?: InputMaybe<Array<TargetWhereInput>>;
  OR?: InputMaybe<Array<TargetWhereInput>>;
  selectors?: InputMaybe<StringNullableListFilter>;
  state?: InputMaybe<PolicyStateRelationFilter>;
  stateId?: InputMaybe<BigIntFilter>;
  to?: InputMaybe<StringFilter>;
};

export type Transaction = {
  __typename?: 'Transaction';
  createdAt: Scalars['DateTime'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: Maybe<Scalars['Decimal']>;
  hash: Scalars['String'];
  /** hash */
  id: Scalars['ID'];
  proposal: Proposal;
  proposalId: Scalars['String'];
  response?: Maybe<TransactionResponse>;
};

export type TransactionListRelationFilter = {
  every?: InputMaybe<TransactionWhereInput>;
  none?: InputMaybe<TransactionWhereInput>;
  some?: InputMaybe<TransactionWhereInput>;
};

export type TransactionOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type TransactionRelationFilter = {
  is?: InputMaybe<TransactionWhereInput>;
  isNot?: InputMaybe<TransactionWhereInput>;
};

export type TransactionResponse = {
  __typename?: 'TransactionResponse';
  effectiveGasPrice: Scalars['Decimal'];
  gasUsed: Scalars['Decimal'];
  response: Scalars['String'];
  success: Scalars['Boolean'];
  timestamp: Scalars['DateTime'];
  transaction: Transaction;
  transactionHash: Scalars['String'];
};

export type TransactionResponseRelationFilter = {
  is?: InputMaybe<TransactionResponseWhereInput>;
  isNot?: InputMaybe<TransactionResponseWhereInput>;
};

export type TransactionResponseWhereInput = {
  AND?: InputMaybe<Array<TransactionResponseWhereInput>>;
  NOT?: InputMaybe<Array<TransactionResponseWhereInput>>;
  OR?: InputMaybe<Array<TransactionResponseWhereInput>>;
  effectiveGasPrice?: InputMaybe<DecimalFilter>;
  gasUsed?: InputMaybe<DecimalFilter>;
  response?: InputMaybe<StringFilter>;
  success?: InputMaybe<BoolFilter>;
  timestamp?: InputMaybe<DateTimeFilter>;
  transaction?: InputMaybe<TransactionRelationFilter>;
  transactionHash?: InputMaybe<StringFilter>;
};

export type TransactionWhereInput = {
  AND?: InputMaybe<Array<TransactionWhereInput>>;
  NOT?: InputMaybe<Array<TransactionWhereInput>>;
  OR?: InputMaybe<Array<TransactionWhereInput>>;
  createdAt?: InputMaybe<DateTimeFilter>;
  gasLimit?: InputMaybe<DecimalFilter>;
  gasPrice?: InputMaybe<DecimalNullableFilter>;
  hash?: InputMaybe<StringFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringFilter>;
  response?: InputMaybe<TransactionResponseRelationFilter>;
};

export type UniquePolicyInput = {
  account: Scalars['Address'];
  key: Scalars['PolicyKey'];
};

export type UpdateAccountInput = {
  id: Scalars['Address'];
  name: Scalars['String'];
};

export type UpdatePolicyInput = {
  account: Scalars['Address'];
  /** Signers that are required to approve */
  approvers?: InputMaybe<Array<Scalars['Address']>>;
  key: Scalars['PolicyKey'];
  name?: InputMaybe<Scalars['String']>;
  permissions?: InputMaybe<PermissionsInput>;
  /** Defaults to all approvers */
  threshold?: InputMaybe<Scalars['Float']>;
};

export type User = {
  __typename?: 'User';
  _count: UserCount;
  approvals?: Maybe<Array<Approval>>;
  approvers?: Maybe<Array<Approver>>;
  comments?: Maybe<Array<Comment>>;
  contacts?: Maybe<Array<Contact>>;
  id: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  proposals?: Maybe<Array<Proposal>>;
  reactions?: Maybe<Array<Reaction>>;
};

export type UserCount = {
  __typename?: 'UserCount';
  approvals: Scalars['Int'];
  approvers: Scalars['Int'];
  comments: Scalars['Int'];
  contacts: Scalars['Int'];
  proposals: Scalars['Int'];
  reactions: Scalars['Int'];
};

export type UserOrderByWithRelationInput = {
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  contacts?: InputMaybe<ContactOrderByRelationAggregateInput>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
  pushToken?: InputMaybe<SortOrder>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
};

export type UserRelationFilter = {
  is?: InputMaybe<UserWhereInput>;
  isNot?: InputMaybe<UserWhereInput>;
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
  name?: InputMaybe<StringNullableFilter>;
  proposals?: InputMaybe<ProposalListRelationFilter>;
  pushToken?: InputMaybe<StringNullableFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
};

export type CreateAccountMutationVariables = Exact<{
  args: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Account', id: string } };

export type AccountQueryVariables = Exact<{
  id: Scalars['Address'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, name: string, isActive: boolean, policies?: Array<{ __typename?: 'Policy', name: string, key: any }> | null } | null };

export type AccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string, name: string, isActive: boolean, policies?: Array<{ __typename?: 'Policy', name: string, key: any }> | null }> };

export type ProposeMutationVariables = Exact<{
  account: Scalars['Address'];
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
  data?: InputMaybe<Scalars['Bytes']>;
}>;


export type ProposeMutation = { __typename?: 'Mutation', propose: { __typename?: 'Proposal', id: string, to: string, value?: any | null, data?: string | null } };

export type ApproveMutationVariables = Exact<{
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
}>;


export type ApproveMutation = { __typename?: 'Mutation', approve: { __typename?: 'Proposal', id: string, to: string, value?: any | null, data?: string | null } };

export type ProposalChangesSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ProposalChangesSubscription = { __typename?: 'Subscription', proposal: { __typename?: 'Proposal', id: string, to: string, value?: any | null, data?: string | null, transaction?: { __typename?: 'Transaction', hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null } | null } };

export type ProposalQueryVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id: string, to: string, value?: any | null, data?: string | null, transaction?: { __typename?: 'Transaction', hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null } | null } | null };

export type ProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProposalsQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, to: string, value?: any | null, data?: string | null, transaction?: { __typename?: 'Transaction', hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null } | null }> };

export type FirstAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type FirstAccountQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string }> };

export type CreateTestAccountMutationVariables = Exact<{
  args: CreateAccountInput;
}>;


export type CreateTestAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Account', id: string } };

export type FirstPendingProposalQueryVariables = Exact<{
  account: Scalars['Address'];
}>;


export type FirstPendingProposalQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string }> };

export type ProposeTestMutationVariables = Exact<{
  account: Scalars['Address'];
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
}>;


export type ProposeTestMutation = { __typename?: 'Mutation', propose: { __typename?: 'Proposal', id: string } };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string, name: string }> };
