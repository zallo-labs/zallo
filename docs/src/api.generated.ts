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
  /** integer */
  BigNumber: any;
  /** bytes hex string */
  Bytes: any;
  /** 8-byte hex string */
  Bytes8: any;
  /** 32-byte hex string */
  Bytes32: any;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
  /** An arbitrary-precision Decimal type */
  Decimal: any;
  /** Identifier */
  Id: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** Quorum key: a 32-bit unsigned integer */
  QuorumKey: any;
  /** 256-bit unsigned integer */
  Uint256: any;
};

export type Account = {
  __typename?: 'Account';
  _count: AccountCount;
  comments?: Maybe<Array<Comment>>;
  deploySalt: Scalars['String'];
  id: Scalars['ID'];
  impl: Scalars['String'];
  isActive: Scalars['Boolean'];
  name: Scalars['String'];
  proposals?: Maybe<Array<Proposal>>;
  quorumStates?: Maybe<Array<QuorumState>>;
  quorums?: Maybe<Array<Quorum>>;
  reactions?: Maybe<Array<Reaction>>;
};

export type AccountCount = {
  __typename?: 'AccountCount';
  comments: Scalars['Int'];
  proposals: Scalars['Int'];
  quorumStates: Scalars['Int'];
  quorums: Scalars['Int'];
  reactions: Scalars['Int'];
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
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
  quorumStates?: InputMaybe<QuorumStateOrderByRelationAggregateInput>;
  quorums?: InputMaybe<QuorumOrderByRelationAggregateInput>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
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
  proposals?: InputMaybe<ProposalListRelationFilter>;
  quorumStates?: InputMaybe<QuorumStateListRelationFilter>;
  quorums?: InputMaybe<QuorumListRelationFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
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
  id: Scalars['ID'];
  quorumState: QuorumState;
  quorumStateId: Scalars['Int'];
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
  quorumState?: InputMaybe<QuorumStateRelationFilter>;
  quorumStateId?: InputMaybe<IntFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
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
  id: Scalars['ID'];
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

export type ContractMethod = {
  __typename?: 'ContractMethod';
  contract: Scalars['String'];
  fragment: Scalars['JSON'];
  id: Scalars['String'];
  sighash: Scalars['String'];
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

export type EnumLimitPeriodFilter = {
  equals?: InputMaybe<LimitPeriod>;
  in?: InputMaybe<Array<LimitPeriod>>;
  not?: InputMaybe<NestedEnumLimitPeriodFilter>;
  notIn?: InputMaybe<Array<LimitPeriod>>;
};

export type EnumSpendingFallbackFilter = {
  equals?: InputMaybe<SpendingFallback>;
  in?: InputMaybe<Array<SpendingFallback>>;
  not?: InputMaybe<NestedEnumSpendingFallbackFilter>;
  notIn?: InputMaybe<Array<SpendingFallback>>;
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

export type IntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

export enum LimitPeriod {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week'
}

export type Mutation = {
  __typename?: 'Mutation';
  approve: Proposal;
  createAccount: Account;
  createComment: Comment;
  createQuorum: Quorum;
  deleteComment: Comment;
  deleteContact: Contact;
  propose: Proposal;
  reactToComment?: Maybe<Reaction>;
  reject: Proposal;
  removeProposal: Proposal;
  removeQuorum: Quorum;
  requestApproval: Scalars['Boolean'];
  requestTokens: Array<Scalars['Address']>;
  updateAccountMetadata: Account;
  updateQuorum: Quorum;
  updateQuorumMetadata: Quorum;
  updateUser: User;
  upsertContact: ContactObject;
};


export type MutationApproveArgs = {
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
};


export type MutationCreateAccountArgs = {
  name: Scalars['String'];
  quorums: Array<QuorumInput>;
};


export type MutationCreateCommentArgs = {
  account: Scalars['Address'];
  content: Scalars['String'];
  key: Scalars['Id'];
};


export type MutationCreateQuorumArgs = {
  account: Scalars['Address'];
  approvers: Array<Scalars['Address']>;
  name?: InputMaybe<Scalars['String']>;
  proposingQuorumKey: Scalars['QuorumKey'];
  spending?: InputMaybe<SpendingInput>;
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
  gasLimit?: InputMaybe<Scalars['Uint256']>;
  quorumKey?: InputMaybe<Scalars['QuorumKey']>;
  salt?: InputMaybe<Scalars['Bytes8']>;
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


export type MutationRemoveProposalArgs = {
  id: Scalars['Bytes32'];
};


export type MutationRemoveQuorumArgs = {
  account: Scalars['Address'];
  key: Scalars['QuorumKey'];
  proposingQuorumKey?: InputMaybe<Scalars['QuorumKey']>;
};


export type MutationRequestApprovalArgs = {
  approvers: Array<Scalars['Address']>;
  id: Scalars['Bytes32'];
};


export type MutationRequestTokensArgs = {
  recipient: Scalars['Address'];
};


export type MutationUpdateAccountMetadataArgs = {
  id: Scalars['Address'];
  name: Scalars['String'];
};


export type MutationUpdateQuorumArgs = {
  account: Scalars['Address'];
  approvers: Array<Scalars['Address']>;
  key: Scalars['QuorumKey'];
  proposingQuorumKey?: InputMaybe<Scalars['QuorumKey']>;
  spending?: InputMaybe<SpendingInput>;
};


export type MutationUpdateQuorumMetadataArgs = {
  account: Scalars['Address'];
  key: Scalars['QuorumKey'];
  name: Scalars['String'];
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

export type NestedEnumLimitPeriodFilter = {
  equals?: InputMaybe<LimitPeriod>;
  in?: InputMaybe<Array<LimitPeriod>>;
  not?: InputMaybe<NestedEnumLimitPeriodFilter>;
  notIn?: InputMaybe<Array<LimitPeriod>>;
};

export type NestedEnumSpendingFallbackFilter = {
  equals?: InputMaybe<SpendingFallback>;
  in?: InputMaybe<Array<SpendingFallback>>;
  not?: InputMaybe<NestedEnumSpendingFallbackFilter>;
  notIn?: InputMaybe<Array<SpendingFallback>>;
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

export type NestedIntNullableFilter = {
  equals?: InputMaybe<Scalars['Int']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  not?: InputMaybe<NestedIntNullableFilter>;
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

export type Proposal = {
  __typename?: 'Proposal';
  _count: ProposalCount;
  account: Account;
  accountId: Scalars['String'];
  approvals?: Maybe<Array<Approval>>;
  createdAt: Scalars['DateTime'];
  data?: Maybe<Scalars['String']>;
  gasLimit?: Maybe<Scalars['Decimal']>;
  id: Scalars['ID'];
  proposer: User;
  proposerId: Scalars['String'];
  quorum: Quorum;
  quorumKey: Scalars['Int'];
  quorumStates?: Maybe<Array<QuorumState>>;
  salt: Scalars['String'];
  to: Scalars['String'];
  transaction?: Maybe<Transaction>;
  transactions?: Maybe<Array<Transaction>>;
  value?: Maybe<Scalars['String']>;
};

export type ProposalCount = {
  __typename?: 'ProposalCount';
  approvals: Scalars['Int'];
  quorumStates: Scalars['Int'];
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
  gasLimit?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  proposer?: InputMaybe<UserOrderByWithRelationInput>;
  proposerId?: InputMaybe<SortOrder>;
  quorum?: InputMaybe<QuorumOrderByWithRelationInput>;
  quorumKey?: InputMaybe<SortOrder>;
  quorumStates?: InputMaybe<QuorumStateOrderByRelationAggregateInput>;
  salt?: InputMaybe<SortOrder>;
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
  GasLimit = 'gasLimit',
  Id = 'id',
  ProposerId = 'proposerId',
  QuorumKey = 'quorumKey',
  Salt = 'salt',
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
  gasLimit?: InputMaybe<DecimalNullableFilter>;
  id?: InputMaybe<StringFilter>;
  proposer?: InputMaybe<UserRelationFilter>;
  proposerId?: InputMaybe<StringFilter>;
  quorum?: InputMaybe<QuorumRelationFilter>;
  quorumKey?: InputMaybe<IntFilter>;
  quorumStates?: InputMaybe<QuorumStateListRelationFilter>;
  salt?: InputMaybe<StringFilter>;
  to?: InputMaybe<StringFilter>;
  transactions?: InputMaybe<TransactionListRelationFilter>;
  value?: InputMaybe<StringNullableFilter>;
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
  contractMethod?: Maybe<ContractMethod>;
  proposal?: Maybe<Proposal>;
  proposals: Array<Proposal>;
  quorum?: Maybe<Quorum>;
  quorums: Array<Quorum>;
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
  key: Scalars['Id'];
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


export type QueryContractMethodArgs = {
  contract: Scalars['Address'];
  sighash: Scalars['Bytes'];
};


export type QueryProposalArgs = {
  id: Scalars['Bytes32'];
};


export type QueryProposalsArgs = {
  accounts?: InputMaybe<Array<Scalars['Address']>>;
  actionRequired?: InputMaybe<Scalars['Boolean']>;
  cursor?: InputMaybe<ProposalWhereUniqueInput>;
  distinct?: InputMaybe<Array<ProposalScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<ProposalOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  states?: InputMaybe<Array<ProposalState>>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ProposalWhereInput>;
};


export type QueryQuorumArgs = {
  account: Scalars['Address'];
  key: Scalars['QuorumKey'];
};


export type QueryQuorumsArgs = {
  cursor?: InputMaybe<QuorumWhereUniqueInput>;
  distinct?: InputMaybe<Array<QuorumScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<QuorumOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<QuorumWhereInput>;
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

export type Quorum = {
  __typename?: 'Quorum';
  _count: QuorumCount;
  account: Account;
  accountId: Scalars['String'];
  activeState?: Maybe<QuorumState>;
  activeStateId?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  key: Scalars['Int'];
  name: Scalars['String'];
  proposals?: Maybe<Array<Proposal>>;
  proposedStates: Array<QuorumState>;
  states?: Maybe<Array<QuorumState>>;
};

export type QuorumAccountIdKeyCompoundUniqueInput = {
  accountId: Scalars['String'];
  key: Scalars['Int'];
};

export type QuorumCount = {
  __typename?: 'QuorumCount';
  proposals: Scalars['Int'];
  states: Scalars['Int'];
};

export type QuorumInput = {
  approvers: Array<Scalars['Address']>;
  name: Scalars['String'];
  spending?: InputMaybe<SpendingInput>;
};

export type QuorumListRelationFilter = {
  every?: InputMaybe<QuorumWhereInput>;
  none?: InputMaybe<QuorumWhereInput>;
  some?: InputMaybe<QuorumWhereInput>;
};

export type QuorumOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type QuorumOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  activeState?: InputMaybe<QuorumStateOrderByWithRelationInput>;
  activeStateId?: InputMaybe<SortOrder>;
  key?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
  states?: InputMaybe<QuorumStateOrderByRelationAggregateInput>;
};

export type QuorumRelationFilter = {
  is?: InputMaybe<QuorumWhereInput>;
  isNot?: InputMaybe<QuorumWhereInput>;
};

export enum QuorumScalarFieldEnum {
  AccountId = 'accountId',
  ActiveStateId = 'activeStateId',
  Key = 'key',
  Name = 'name'
}

export type QuorumState = {
  __typename?: 'QuorumState';
  _count: QuorumStateCount;
  account: Account;
  accountId: Scalars['String'];
  activeStateOfQuorum?: Maybe<Quorum>;
  approvers?: Maybe<Array<Approver>>;
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  isRemoved: Scalars['Boolean'];
  limits?: Maybe<Array<TokenLimit>>;
  proposal?: Maybe<Proposal>;
  proposalId?: Maybe<Scalars['String']>;
  quorum: Quorum;
  quorumKey: Scalars['Int'];
  spendingFallback: SpendingFallback;
};

export type QuorumStateCount = {
  __typename?: 'QuorumStateCount';
  approvers: Scalars['Int'];
  limits: Scalars['Int'];
};

export type QuorumStateListRelationFilter = {
  every?: InputMaybe<QuorumStateWhereInput>;
  none?: InputMaybe<QuorumStateWhereInput>;
  some?: InputMaybe<QuorumStateWhereInput>;
};

export type QuorumStateOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type QuorumStateOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  activeStateOfQuorum?: InputMaybe<QuorumOrderByWithRelationInput>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  isRemoved?: InputMaybe<SortOrder>;
  limits?: InputMaybe<TokenLimitOrderByRelationAggregateInput>;
  proposal?: InputMaybe<ProposalOrderByWithRelationInput>;
  proposalId?: InputMaybe<SortOrder>;
  quorum?: InputMaybe<QuorumOrderByWithRelationInput>;
  quorumKey?: InputMaybe<SortOrder>;
  spendingFallback?: InputMaybe<SortOrder>;
};

export type QuorumStateRelationFilter = {
  is?: InputMaybe<QuorumStateWhereInput>;
  isNot?: InputMaybe<QuorumStateWhereInput>;
};

export type QuorumStateWhereInput = {
  AND?: InputMaybe<Array<QuorumStateWhereInput>>;
  NOT?: InputMaybe<Array<QuorumStateWhereInput>>;
  OR?: InputMaybe<Array<QuorumStateWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  activeStateOfQuorum?: InputMaybe<QuorumRelationFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  id?: InputMaybe<IntFilter>;
  isRemoved?: InputMaybe<BoolFilter>;
  limits?: InputMaybe<TokenLimitListRelationFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringNullableFilter>;
  quorum?: InputMaybe<QuorumRelationFilter>;
  quorumKey?: InputMaybe<IntFilter>;
  spendingFallback?: InputMaybe<EnumSpendingFallbackFilter>;
};

export type QuorumWhereInput = {
  AND?: InputMaybe<Array<QuorumWhereInput>>;
  NOT?: InputMaybe<Array<QuorumWhereInput>>;
  OR?: InputMaybe<Array<QuorumWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  activeState?: InputMaybe<QuorumStateRelationFilter>;
  activeStateId?: InputMaybe<IntNullableFilter>;
  key?: InputMaybe<IntFilter>;
  name?: InputMaybe<StringFilter>;
  proposals?: InputMaybe<ProposalListRelationFilter>;
  states?: InputMaybe<QuorumStateListRelationFilter>;
};

export type QuorumWhereUniqueInput = {
  accountId_key?: InputMaybe<QuorumAccountIdKeyCompoundUniqueInput>;
  activeStateId?: InputMaybe<Scalars['Int']>;
};

export type Reaction = {
  __typename?: 'Reaction';
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['String']>;
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
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringNullableFilter>;
  comment?: InputMaybe<CommentRelationFilter>;
  commentId?: InputMaybe<IntFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
  user?: InputMaybe<UserRelationFilter>;
  userId?: InputMaybe<StringFilter>;
};

export enum SortOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export enum SpendingFallback {
  Allow = 'allow',
  Deny = 'deny'
}

export type SpendingInput = {
  fallback?: InputMaybe<SpendingFallback>;
  limits?: InputMaybe<Array<TokenLimitInput>>;
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

export type Subscription = {
  __typename?: 'Subscription';
  account: Account;
  proposal: Proposal;
};


export type SubscriptionAccountArgs = {
  accounts?: InputMaybe<Array<Scalars['Address']>>;
  events?: InputMaybe<Array<AccountEvent>>;
};


export type SubscriptionProposalArgs = {
  accounts?: InputMaybe<Array<Scalars['Address']>>;
  events?: InputMaybe<Array<ProposalEvent>>;
  proposals?: InputMaybe<Array<Scalars['Bytes32']>>;
};

export type TokenLimit = {
  __typename?: 'TokenLimit';
  amount: Scalars['String'];
  period: LimitPeriod;
  quorumState: QuorumState;
  quorumStateId: Scalars['Int'];
  token: Scalars['String'];
};

export type TokenLimitInput = {
  amount: Scalars['BigNumber'];
  period: TokenLimitPeriod;
  token: Scalars['Address'];
};

export type TokenLimitListRelationFilter = {
  every?: InputMaybe<TokenLimitWhereInput>;
  none?: InputMaybe<TokenLimitWhereInput>;
  some?: InputMaybe<TokenLimitWhereInput>;
};

export type TokenLimitOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export enum TokenLimitPeriod {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week'
}

export type TokenLimitWhereInput = {
  AND?: InputMaybe<Array<TokenLimitWhereInput>>;
  NOT?: InputMaybe<Array<TokenLimitWhereInput>>;
  OR?: InputMaybe<Array<TokenLimitWhereInput>>;
  amount?: InputMaybe<StringFilter>;
  period?: InputMaybe<EnumLimitPeriodFilter>;
  quorumState?: InputMaybe<QuorumStateRelationFilter>;
  quorumStateId?: InputMaybe<IntFilter>;
  token?: InputMaybe<StringFilter>;
};

export type Transaction = {
  __typename?: 'Transaction';
  createdAt: Scalars['DateTime'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: Maybe<Scalars['Decimal']>;
  hash: Scalars['ID'];
  /** hash */
  id: Scalars['ID'];
  nonce: Scalars['Int'];
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
  response: Scalars['String'];
  success: Scalars['Boolean'];
  timestamp: Scalars['DateTime'];
  transaction: Transaction;
  transactionHash: Scalars['ID'];
};

export type TransactionResponseRelationFilter = {
  is?: InputMaybe<TransactionResponseWhereInput>;
  isNot?: InputMaybe<TransactionResponseWhereInput>;
};

export type TransactionResponseWhereInput = {
  AND?: InputMaybe<Array<TransactionResponseWhereInput>>;
  NOT?: InputMaybe<Array<TransactionResponseWhereInput>>;
  OR?: InputMaybe<Array<TransactionResponseWhereInput>>;
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
  nonce?: InputMaybe<IntFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringFilter>;
  response?: InputMaybe<TransactionResponseRelationFilter>;
};

export type User = {
  __typename?: 'User';
  _count: UserCount;
  approvals?: Maybe<Array<Approval>>;
  approvers?: Maybe<Array<Approver>>;
  comments?: Maybe<Array<Comment>>;
  contacts?: Maybe<Array<Contact>>;
  id: Scalars['ID'];
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
  name: Scalars['String'];
  quorums: Array<QuorumInput> | QuorumInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Account', id: string } };

export type AccountQueryVariables = Exact<{
  id: Scalars['Address'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, name: string, isActive: boolean, quorums?: Array<{ __typename?: 'Quorum', key: number }> | null } | null };

export type AccountsQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string, name: string, isActive: boolean, quorums?: Array<{ __typename?: 'Quorum', key: number }> | null }> };

export type ProposeMutationVariables = Exact<{
  account: Scalars['Address'];
  quorumKey?: InputMaybe<Scalars['QuorumKey']>;
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
  data?: InputMaybe<Scalars['Bytes']>;
}>;


export type ProposeMutation = { __typename?: 'Mutation', propose: { __typename?: 'Proposal', id: string, to: string, value?: string | null, data?: string | null, salt: string } };

export type ApproveMutationVariables = Exact<{
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
}>;


export type ApproveMutation = { __typename?: 'Mutation', approve: { __typename?: 'Proposal', id: string, to: string, value?: string | null, data?: string | null } };

export type ProposalChangesSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type ProposalChangesSubscription = { __typename?: 'Subscription', proposal: { __typename?: 'Proposal', id: string, to: string, value?: string | null, data?: string | null, transaction?: { __typename?: 'Transaction', hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null } | null } };

export type ProposalQueryVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id: string, to: string, value?: string | null, data?: string | null, transaction?: { __typename?: 'Transaction', hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null } | null } | null };

export type ProposalsQueryVariables = Exact<{ [key: string]: never; }>;


export type ProposalsQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, to: string, value?: string | null, data?: string | null, transaction?: { __typename?: 'Transaction', hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null } | null }> };

export type FirstAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type FirstAccountQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string }> };

export type CreateTestAccountMutationVariables = Exact<{
  name: Scalars['String'];
  quorums: Array<QuorumInput> | QuorumInput;
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
