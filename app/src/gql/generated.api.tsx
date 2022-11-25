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
  /** Ethereum address */
  Address: any;
  /** Ethereum address set */
  AddressSet: any;
  /** whole number */
  BigNumber: any;
  /** hex string string */
  Bytes: any;
  /** 8-byte string */
  Bytes8: any;
  /** 32-byte string */
  Bytes32: any;
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: any;
  /** An arbitrary-precision Decimal type */
  Decimal: any;
  /** Identifier */
  Id: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** Ethereum address set */
  NonEmptyAddressSet: any;
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
  reactions?: Maybe<Array<Reaction>>;
  userStates?: Maybe<Array<UserState>>;
  users?: Maybe<Array<User>>;
};

export type AccountCount = {
  __typename?: 'AccountCount';
  comments: Scalars['Int'];
  proposals: Scalars['Int'];
  reactions: Scalars['Int'];
  userStates: Scalars['Int'];
  users: Scalars['Int'];
};

export type AccountOrderByWithRelationInput = {
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  deploySalt?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  impl?: InputMaybe<SortOrder>;
  isActive?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
  userStates?: InputMaybe<UserStateOrderByRelationAggregateInput>;
  users?: InputMaybe<UserOrderByRelationAggregateInput>;
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
  reactions?: InputMaybe<ReactionListRelationFilter>;
  userStates?: InputMaybe<UserStateListRelationFilter>;
  users?: InputMaybe<UserListRelationFilter>;
};

export type AccountWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Approval = {
  __typename?: 'Approval';
  createdAt: Scalars['DateTime'];
  device: Device;
  deviceId: Scalars['String'];
  proposal: Proposal;
  proposalId: Scalars['String'];
  signature?: Maybe<Scalars['String']>;
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
  device?: InputMaybe<DeviceRelationFilter>;
  deviceId?: InputMaybe<StringFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringFilter>;
  signature?: InputMaybe<StringNullableFilter>;
};

export type Approver = {
  __typename?: 'Approver';
  config: UserConfig;
  configId: Scalars['Int'];
  device: Device;
  deviceId: Scalars['String'];
  id: Scalars['String'];
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
  config?: InputMaybe<UserConfigRelationFilter>;
  configId?: InputMaybe<IntFilter>;
  device?: InputMaybe<DeviceRelationFilter>;
  deviceId?: InputMaybe<StringFilter>;
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
  author: Device;
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
  author?: InputMaybe<DeviceRelationFilter>;
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
  device: Device;
  deviceId: Scalars['String'];
  name: Scalars['String'];
};

export type ContactDeviceIdAddrCompoundUniqueInput = {
  addr: Scalars['String'];
  deviceId: Scalars['String'];
};

export type ContactListRelationFilter = {
  every?: InputMaybe<ContactWhereInput>;
  none?: InputMaybe<ContactWhereInput>;
  some?: InputMaybe<ContactWhereInput>;
};

export type ContactName_IdentifierCompoundUniqueInput = {
  deviceId: Scalars['String'];
  name: Scalars['String'];
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
  device?: InputMaybe<DeviceOrderByWithRelationInput>;
  deviceId?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
};

export enum ContactScalarFieldEnum {
  Addr = 'addr',
  DeviceId = 'deviceId',
  Name = 'name'
}

export type ContactWhereInput = {
  AND?: InputMaybe<Array<ContactWhereInput>>;
  NOT?: InputMaybe<Array<ContactWhereInput>>;
  OR?: InputMaybe<Array<ContactWhereInput>>;
  addr?: InputMaybe<StringFilter>;
  device?: InputMaybe<DeviceRelationFilter>;
  deviceId?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringFilter>;
};

export type ContactWhereUniqueInput = {
  deviceId_addr?: InputMaybe<ContactDeviceIdAddrCompoundUniqueInput>;
  name_identifier?: InputMaybe<ContactName_IdentifierCompoundUniqueInput>;
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

export type Device = {
  __typename?: 'Device';
  _count: DeviceCount;
  approvals?: Maybe<Array<Approval>>;
  approvers?: Maybe<Array<Approver>>;
  comments?: Maybe<Array<Comment>>;
  contacts?: Maybe<Array<Contact>>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  pushToken?: Maybe<Scalars['String']>;
  reactions?: Maybe<Array<Reaction>>;
  users?: Maybe<Array<User>>;
};

export type DeviceCount = {
  __typename?: 'DeviceCount';
  approvals: Scalars['Int'];
  approvers: Scalars['Int'];
  comments: Scalars['Int'];
  contacts: Scalars['Int'];
  reactions: Scalars['Int'];
  users: Scalars['Int'];
};

export type DeviceOrderByWithRelationInput = {
  approvals?: InputMaybe<ApprovalOrderByRelationAggregateInput>;
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  comments?: InputMaybe<CommentOrderByRelationAggregateInput>;
  contacts?: InputMaybe<ContactOrderByRelationAggregateInput>;
  id?: InputMaybe<SortOrder>;
  name?: InputMaybe<SortOrder>;
  pushToken?: InputMaybe<SortOrder>;
  reactions?: InputMaybe<ReactionOrderByRelationAggregateInput>;
  users?: InputMaybe<UserOrderByRelationAggregateInput>;
};

export type DeviceRelationFilter = {
  is?: InputMaybe<DeviceWhereInput>;
  isNot?: InputMaybe<DeviceWhereInput>;
};

export type DeviceWhereInput = {
  AND?: InputMaybe<Array<DeviceWhereInput>>;
  NOT?: InputMaybe<Array<DeviceWhereInput>>;
  OR?: InputMaybe<Array<DeviceWhereInput>>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  comments?: InputMaybe<CommentListRelationFilter>;
  contacts?: InputMaybe<ContactListRelationFilter>;
  id?: InputMaybe<StringFilter>;
  name?: InputMaybe<StringNullableFilter>;
  pushToken?: InputMaybe<StringNullableFilter>;
  reactions?: InputMaybe<ReactionListRelationFilter>;
  users?: InputMaybe<UserListRelationFilter>;
};

export type EnumLimitPeriodFilter = {
  equals?: InputMaybe<LimitPeriod>;
  in?: InputMaybe<Array<LimitPeriod>>;
  not?: InputMaybe<NestedEnumLimitPeriodFilter>;
  notIn?: InputMaybe<Array<LimitPeriod>>;
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

export enum LimitPeriod {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateAccount: Scalars['Boolean'];
  approve: Proposal;
  createAccount: Account;
  createComment: Comment;
  deleteComment: Comment;
  deleteContact: Scalars['Boolean'];
  propose: Proposal;
  reactToComment?: Maybe<Reaction>;
  registerPushToken: Scalars['Boolean'];
  reject?: Maybe<Proposal>;
  removeUser: User;
  requestApproval: Scalars['Boolean'];
  requestFunds: Scalars['Boolean'];
  setAccountName: Account;
  setDeviceName: Device;
  setUserName: User;
  submitExecution: Transaction;
  upsertContact: ContactObject;
  upsertUser: User;
};


export type MutationActivateAccountArgs = {
  id: Scalars['Address'];
};


export type MutationApproveArgs = {
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
};


export type MutationCreateAccountArgs = {
  name: Scalars['String'];
  users: Array<UserWithoutAccountInput>;
};


export type MutationCreateCommentArgs = {
  account: Scalars['Address'];
  content: Scalars['String'];
  key: Scalars['Id'];
};


export type MutationDeleteCommentArgs = {
  id: Scalars['Float'];
};


export type MutationDeleteContactArgs = {
  addr: Scalars['Address'];
};


export type MutationProposeArgs = {
  account: Scalars['Address'];
  config?: InputMaybe<Scalars['Float']>;
  data?: InputMaybe<Scalars['Bytes']>;
  gasLimit?: InputMaybe<Scalars['Uint256']>;
  salt?: InputMaybe<Scalars['Bytes8']>;
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
};


export type MutationReactToCommentArgs = {
  emojis: Array<Scalars['String']>;
  id: Scalars['Float'];
};


export type MutationRegisterPushTokenArgs = {
  token: Scalars['String'];
};


export type MutationRejectArgs = {
  id: Scalars['Bytes32'];
};


export type MutationRemoveUserArgs = {
  id: UserIdInput;
  proposalId?: InputMaybe<Scalars['Bytes32']>;
};


export type MutationRequestApprovalArgs = {
  approvers: Scalars['NonEmptyAddressSet'];
  id: Scalars['Bytes32'];
};


export type MutationRequestFundsArgs = {
  recipient: Scalars['Address'];
};


export type MutationSetAccountNameArgs = {
  id: Scalars['Address'];
  name: Scalars['String'];
};


export type MutationSetDeviceNameArgs = {
  name?: InputMaybe<Scalars['String']>;
};


export type MutationSetUserNameArgs = {
  id: UserIdInput;
  name: Scalars['String'];
};


export type MutationSubmitExecutionArgs = {
  proposalHash: Scalars['Bytes32'];
  submission: SubmissionInput;
};


export type MutationUpsertContactArgs = {
  name: Scalars['String'];
  newAddr: Scalars['Address'];
  prevAddr?: InputMaybe<Scalars['Address']>;
};


export type MutationUpsertUserArgs = {
  proposalId: Scalars['Bytes32'];
  user: UserInput;
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

export type Proposal = {
  __typename?: 'Proposal';
  _count: ProposalCount;
  account: Account;
  accountId: Scalars['String'];
  approvals?: Maybe<Array<Approval>>;
  config: UserConfig;
  configId: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  data: Scalars['String'];
  gasLimit?: Maybe<Scalars['Decimal']>;
  id: Scalars['ID'];
  proposer: User;
  proposerId: Scalars['String'];
  salt: Scalars['String'];
  to: Scalars['String'];
  transaction?: Maybe<Transaction>;
  transactions?: Maybe<Array<Transaction>>;
  userStates?: Maybe<Array<UserState>>;
  value: Scalars['String'];
};

export type ProposalCount = {
  __typename?: 'ProposalCount';
  approvals: Scalars['Int'];
  transactions: Scalars['Int'];
  userStates: Scalars['Int'];
};

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
  config?: InputMaybe<UserConfigOrderByWithRelationInput>;
  configId?: InputMaybe<SortOrder>;
  createdAt?: InputMaybe<SortOrder>;
  data?: InputMaybe<SortOrder>;
  gasLimit?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  proposer?: InputMaybe<UserOrderByWithRelationInput>;
  proposerId?: InputMaybe<SortOrder>;
  salt?: InputMaybe<SortOrder>;
  to?: InputMaybe<SortOrder>;
  transactions?: InputMaybe<TransactionOrderByRelationAggregateInput>;
  userStates?: InputMaybe<UserStateOrderByRelationAggregateInput>;
  value?: InputMaybe<SortOrder>;
};

export type ProposalRelationFilter = {
  is?: InputMaybe<ProposalWhereInput>;
  isNot?: InputMaybe<ProposalWhereInput>;
};

export enum ProposalScalarFieldEnum {
  AccountId = 'accountId',
  ConfigId = 'configId',
  CreatedAt = 'createdAt',
  Data = 'data',
  GasLimit = 'gasLimit',
  Id = 'id',
  ProposerId = 'proposerId',
  Salt = 'salt',
  To = 'to',
  Value = 'value'
}

export enum ProposalStatus {
  AwaitingOther = 'AwaitingOther',
  AwaitingUser = 'AwaitingUser',
  Executed = 'Executed'
}

export type ProposalWhereInput = {
  AND?: InputMaybe<Array<ProposalWhereInput>>;
  NOT?: InputMaybe<Array<ProposalWhereInput>>;
  OR?: InputMaybe<Array<ProposalWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  approvals?: InputMaybe<ApprovalListRelationFilter>;
  config?: InputMaybe<UserConfigRelationFilter>;
  configId?: InputMaybe<IntFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  data?: InputMaybe<StringFilter>;
  gasLimit?: InputMaybe<DecimalNullableFilter>;
  id?: InputMaybe<StringFilter>;
  proposer?: InputMaybe<UserRelationFilter>;
  proposerId?: InputMaybe<StringFilter>;
  salt?: InputMaybe<StringFilter>;
  to?: InputMaybe<StringFilter>;
  transactions?: InputMaybe<TransactionListRelationFilter>;
  userStates?: InputMaybe<UserStateListRelationFilter>;
  value?: InputMaybe<StringFilter>;
};

export type ProposalWhereUniqueInput = {
  id?: InputMaybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  accounts: Array<Account>;
  canRequestFunds: Scalars['Boolean'];
  comments: Array<Comment>;
  contact?: Maybe<ContactObject>;
  contacts: Array<ContactObject>;
  contractMethod?: Maybe<ContractMethod>;
  device?: Maybe<Device>;
  proposal?: Maybe<Proposal>;
  proposals: Array<Proposal>;
  user: User;
  users: Array<User>;
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


export type QueryCanRequestFundsArgs = {
  recipient: Scalars['Address'];
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


export type QueryDeviceArgs = {
  addr?: InputMaybe<Scalars['Address']>;
};


export type QueryProposalArgs = {
  id: Scalars['Bytes32'];
};


export type QueryProposalsArgs = {
  accounts?: InputMaybe<Scalars['AddressSet']>;
  cursor?: InputMaybe<ProposalWhereUniqueInput>;
  distinct?: InputMaybe<Array<ProposalScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<ProposalOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  status?: InputMaybe<ProposalStatus>;
  take?: InputMaybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id: UserIdInput;
};


export type QueryUsersArgs = {
  cursor?: InputMaybe<UserWhereUniqueInput>;
  distinct?: InputMaybe<Array<UserScalarFieldEnum>>;
  orderBy?: InputMaybe<Array<UserOrderByWithRelationInput>>;
  skip?: InputMaybe<Scalars['Int']>;
  take?: InputMaybe<Scalars['Int']>;
};

export enum QueryMode {
  Default = 'default',
  Insensitive = 'insensitive'
}

export type Reaction = {
  __typename?: 'Reaction';
  account?: Maybe<Account>;
  accountId?: Maybe<Scalars['String']>;
  comment: Comment;
  commentId: Scalars['Int'];
  createdAt: Scalars['DateTime'];
  device: Device;
  deviceId: Scalars['String'];
  emojis?: Maybe<Array<Scalars['String']>>;
  id: Scalars['String'];
  updatedAt: Scalars['DateTime'];
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
  device?: InputMaybe<DeviceRelationFilter>;
  deviceId?: InputMaybe<StringFilter>;
  emojis?: InputMaybe<StringNullableListFilter>;
  updatedAt?: InputMaybe<DateTimeFilter>;
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

export type SubmissionInput = {
  hash: Scalars['Bytes32'];
};

export type TokenLimit = {
  __typename?: 'TokenLimit';
  amount: Scalars['String'];
  config: UserConfig;
  configId: Scalars['Int'];
  period: LimitPeriod;
  token: Scalars['String'];
};

export type TokenLimitInput = {
  amount: Scalars['BigNumber'];
  period: LimitPeriod;
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

export type TokenLimitWhereInput = {
  AND?: InputMaybe<Array<TokenLimitWhereInput>>;
  NOT?: InputMaybe<Array<TokenLimitWhereInput>>;
  OR?: InputMaybe<Array<TokenLimitWhereInput>>;
  amount?: InputMaybe<StringFilter>;
  config?: InputMaybe<UserConfigRelationFilter>;
  configId?: InputMaybe<IntFilter>;
  period?: InputMaybe<EnumLimitPeriodFilter>;
  token?: InputMaybe<StringFilter>;
};

export type Transaction = {
  __typename?: 'Transaction';
  createdAt: Scalars['DateTime'];
  gasLimit: Scalars['Decimal'];
  gasPrice?: Maybe<Scalars['Decimal']>;
  hash: Scalars['ID'];
  id: Scalars['String'];
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
  account: Account;
  accountId: Scalars['String'];
  activeState?: Maybe<UserState>;
  device: Device;
  deviceId: Scalars['String'];
  id: Scalars['String'];
  latestState?: Maybe<UserState>;
  name: Scalars['String'];
  proposals?: Maybe<Array<Proposal>>;
  proposedState?: Maybe<UserState>;
  states?: Maybe<Array<UserState>>;
};

export type UserAccountIdDeviceIdCompoundUniqueInput = {
  accountId: Scalars['String'];
  deviceId: Scalars['String'];
};

export type UserConfig = {
  __typename?: 'UserConfig';
  _count: UserConfigCount;
  approvers?: Maybe<Array<Approver>>;
  id: Scalars['ID'];
  limits?: Maybe<Array<TokenLimit>>;
  proposals?: Maybe<Array<Proposal>>;
  spendingAllowlisted: Scalars['Boolean'];
  state: UserState;
  stateId: Scalars['Int'];
};

export type UserConfigCount = {
  __typename?: 'UserConfigCount';
  approvers: Scalars['Int'];
  limits: Scalars['Int'];
  proposals: Scalars['Int'];
};

export type UserConfigInput = {
  approvers: Array<Scalars['Address']>;
  limits?: InputMaybe<Array<TokenLimitInput>>;
  spendingAllowlisted?: InputMaybe<Scalars['Boolean']>;
};

export type UserConfigListRelationFilter = {
  every?: InputMaybe<UserConfigWhereInput>;
  none?: InputMaybe<UserConfigWhereInput>;
  some?: InputMaybe<UserConfigWhereInput>;
};

export type UserConfigOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type UserConfigOrderByWithRelationInput = {
  approvers?: InputMaybe<ApproverOrderByRelationAggregateInput>;
  id?: InputMaybe<SortOrder>;
  limits?: InputMaybe<TokenLimitOrderByRelationAggregateInput>;
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
  spendingAllowlisted?: InputMaybe<SortOrder>;
  state?: InputMaybe<UserStateOrderByWithRelationInput>;
  stateId?: InputMaybe<SortOrder>;
};

export type UserConfigRelationFilter = {
  is?: InputMaybe<UserConfigWhereInput>;
  isNot?: InputMaybe<UserConfigWhereInput>;
};

export type UserConfigWhereInput = {
  AND?: InputMaybe<Array<UserConfigWhereInput>>;
  NOT?: InputMaybe<Array<UserConfigWhereInput>>;
  OR?: InputMaybe<Array<UserConfigWhereInput>>;
  approvers?: InputMaybe<ApproverListRelationFilter>;
  id?: InputMaybe<IntFilter>;
  limits?: InputMaybe<TokenLimitListRelationFilter>;
  proposals?: InputMaybe<ProposalListRelationFilter>;
  spendingAllowlisted?: InputMaybe<BoolFilter>;
  state?: InputMaybe<UserStateRelationFilter>;
  stateId?: InputMaybe<IntFilter>;
};

export type UserCount = {
  __typename?: 'UserCount';
  proposals: Scalars['Int'];
  states: Scalars['Int'];
};

export type UserIdInput = {
  account: Scalars['Address'];
  device: Scalars['Address'];
};

export type UserInput = {
  configs: Array<UserConfigInput>;
  id: UserIdInput;
  name: Scalars['String'];
};

export type UserListRelationFilter = {
  every?: InputMaybe<UserWhereInput>;
  none?: InputMaybe<UserWhereInput>;
  some?: InputMaybe<UserWhereInput>;
};

export type UserOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type UserOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  device?: InputMaybe<DeviceOrderByWithRelationInput>;
  deviceId?: InputMaybe<SortOrder>;
  latestState?: InputMaybe<UserStateOrderByWithRelationInput>;
  name?: InputMaybe<SortOrder>;
  proposals?: InputMaybe<ProposalOrderByRelationAggregateInput>;
  states?: InputMaybe<UserStateOrderByRelationAggregateInput>;
};

export type UserRelationFilter = {
  is?: InputMaybe<UserWhereInput>;
  isNot?: InputMaybe<UserWhereInput>;
};

export enum UserScalarFieldEnum {
  AccountId = 'accountId',
  DeviceId = 'deviceId',
  Name = 'name'
}

export type UserState = {
  __typename?: 'UserState';
  _count: UserStateCount;
  account: Account;
  accountId: Scalars['String'];
  configs?: Maybe<Array<UserConfig>>;
  createdAt: Scalars['DateTime'];
  deviceId: Scalars['String'];
  id: Scalars['ID'];
  isDeleted: Scalars['Boolean'];
  latestOfUser?: Maybe<User>;
  latestOfUserDeviceId?: Maybe<Scalars['String']>;
  proposal?: Maybe<Proposal>;
  proposalId?: Maybe<Scalars['String']>;
  user: User;
};

export type UserStateCount = {
  __typename?: 'UserStateCount';
  configs: Scalars['Int'];
};

export type UserStateListRelationFilter = {
  every?: InputMaybe<UserStateWhereInput>;
  none?: InputMaybe<UserStateWhereInput>;
  some?: InputMaybe<UserStateWhereInput>;
};

export type UserStateOrderByRelationAggregateInput = {
  _count?: InputMaybe<SortOrder>;
};

export type UserStateOrderByWithRelationInput = {
  account?: InputMaybe<AccountOrderByWithRelationInput>;
  accountId?: InputMaybe<SortOrder>;
  configs?: InputMaybe<UserConfigOrderByRelationAggregateInput>;
  createdAt?: InputMaybe<SortOrder>;
  deviceId?: InputMaybe<SortOrder>;
  id?: InputMaybe<SortOrder>;
  isDeleted?: InputMaybe<SortOrder>;
  latestOfUser?: InputMaybe<UserOrderByWithRelationInput>;
  latestOfUserDeviceId?: InputMaybe<SortOrder>;
  proposal?: InputMaybe<ProposalOrderByWithRelationInput>;
  proposalId?: InputMaybe<SortOrder>;
  user?: InputMaybe<UserOrderByWithRelationInput>;
};

export type UserStateRelationFilter = {
  is?: InputMaybe<UserStateWhereInput>;
  isNot?: InputMaybe<UserStateWhereInput>;
};

export type UserStateWhereInput = {
  AND?: InputMaybe<Array<UserStateWhereInput>>;
  NOT?: InputMaybe<Array<UserStateWhereInput>>;
  OR?: InputMaybe<Array<UserStateWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  configs?: InputMaybe<UserConfigListRelationFilter>;
  createdAt?: InputMaybe<DateTimeFilter>;
  deviceId?: InputMaybe<StringFilter>;
  id?: InputMaybe<IntFilter>;
  isDeleted?: InputMaybe<BoolFilter>;
  latestOfUser?: InputMaybe<UserRelationFilter>;
  latestOfUserDeviceId?: InputMaybe<StringNullableFilter>;
  proposal?: InputMaybe<ProposalRelationFilter>;
  proposalId?: InputMaybe<StringNullableFilter>;
  user?: InputMaybe<UserRelationFilter>;
};

export type UserWhereInput = {
  AND?: InputMaybe<Array<UserWhereInput>>;
  NOT?: InputMaybe<Array<UserWhereInput>>;
  OR?: InputMaybe<Array<UserWhereInput>>;
  account?: InputMaybe<AccountRelationFilter>;
  accountId?: InputMaybe<StringFilter>;
  device?: InputMaybe<DeviceRelationFilter>;
  deviceId?: InputMaybe<StringFilter>;
  latestState?: InputMaybe<UserStateRelationFilter>;
  name?: InputMaybe<StringFilter>;
  proposals?: InputMaybe<ProposalListRelationFilter>;
  states?: InputMaybe<UserStateListRelationFilter>;
};

export type UserWhereUniqueInput = {
  accountId_deviceId?: InputMaybe<UserAccountIdDeviceIdCompoundUniqueInput>;
};

export type UserWithoutAccountInput = {
  configs: Array<UserConfigInput>;
  device: Scalars['Address'];
  name: Scalars['String'];
};

export type ActivateAccountMutationVariables = Exact<{
  account: Scalars['Address'];
}>;


export type ActivateAccountMutation = { __typename?: 'Mutation', activateAccount: boolean };

export type CreateAccountMutationVariables = Exact<{
  name: Scalars['String'];
  users: Array<UserWithoutAccountInput> | UserWithoutAccountInput;
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


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', id: string } };

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['Float'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: { __typename?: 'Comment', id: string } };

export type ReactMutationVariables = Exact<{
  comment: Scalars['Float'];
  emojis: Array<Scalars['String']> | Scalars['String'];
}>;


export type ReactMutation = { __typename?: 'Mutation', reactToComment?: { __typename?: 'Reaction', id: string } | null };

export type DeleteContactMutationVariables = Exact<{
  addr: Scalars['Address'];
}>;


export type DeleteContactMutation = { __typename?: 'Mutation', deleteContact: boolean };

export type UpsertContactMutationVariables = Exact<{
  name: Scalars['String'];
  newAddr: Scalars['Address'];
  prevAddr?: InputMaybe<Scalars['Address']>;
}>;


export type UpsertContactMutation = { __typename?: 'Mutation', upsertContact: { __typename?: 'ContactObject', id: string } };

export type ApproveMutationVariables = Exact<{
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
}>;


export type ApproveMutation = { __typename?: 'Mutation', approve: { __typename?: 'Proposal', id: string, transactions?: Array<{ __typename?: 'Transaction', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null }> | null } };

export type RejectMutationVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type RejectMutation = { __typename?: 'Mutation', reject?: { __typename?: 'Proposal', id: string } | null };

export type SubmitExecutionMutationVariables = Exact<{
  proposalHash: Scalars['Bytes32'];
  submission: SubmissionInput;
}>;


export type SubmitExecutionMutation = { __typename?: 'Mutation', submitExecution: { __typename?: 'Transaction', id: string } };

export type ProposeMutationVariables = Exact<{
  account: Scalars['Address'];
  config?: InputMaybe<Scalars['Float']>;
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
  data?: InputMaybe<Scalars['Bytes']>;
  salt?: InputMaybe<Scalars['Bytes8']>;
  gasLimit?: InputMaybe<Scalars['Uint256']>;
}>;


export type ProposeMutation = { __typename?: 'Mutation', propose: { __typename?: 'Proposal', id: string, transactions?: Array<{ __typename?: 'Transaction', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null }> | null } };

export type RequestApprovalMutationVariables = Exact<{
  id: Scalars['Bytes32'];
  approvers: Scalars['NonEmptyAddressSet'];
}>;


export type RequestApprovalMutation = { __typename?: 'Mutation', requestApproval: boolean };

export type RequestFundsMutationVariables = Exact<{
  recipient: Scalars['Address'];
}>;


export type RequestFundsMutation = { __typename?: 'Mutation', requestFunds: boolean };

export type RegisterPushTokenMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type RegisterPushTokenMutation = { __typename?: 'Mutation', registerPushToken: boolean };

export type SetDeviceNameMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
}>;


export type SetDeviceNameMutation = { __typename?: 'Mutation', setDeviceName: { __typename?: 'Device', id: string } };

export type RemoveUserMutationVariables = Exact<{
  id: UserIdInput;
  proposalId: Scalars['Bytes32'];
}>;


export type RemoveUserMutation = { __typename?: 'Mutation', removeUser: { __typename?: 'User', id: string } };

export type UpsertUserMutationVariables = Exact<{
  user: UserInput;
  proposalId: Scalars['Bytes32'];
}>;


export type UpsertUserMutation = { __typename?: 'Mutation', upsertUser: { __typename?: 'User', id: string } };

export type SetUserNameMutationVariables = Exact<{
  user: UserIdInput;
  name: Scalars['String'];
}>;


export type SetUserNameMutation = { __typename?: 'Mutation', setUserName: { __typename?: 'User', id: string } };

export type AccountQueryVariables = Exact<{
  account: Scalars['Address'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, isActive: boolean, name: string, users?: Array<{ __typename?: 'User', deviceId: string, name: string }> | null } | null };

export type ContactFieldsFragment = { __typename?: 'ContactObject', id: string, addr: any, name: string };

export type ContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsQuery = { __typename?: 'Query', contacts: Array<{ __typename?: 'ContactObject', id: string, addr: any, name: string }> };

export type TransactionFieldsFragment = { __typename?: 'Transaction', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null };

export type ProposalQueryVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id: string, accountId: string, proposerId: string, to: string, value: string, data: string, salt: string, createdAt: any, approvals?: Array<{ __typename?: 'Approval', deviceId: string, signature?: string | null, createdAt: any }> | null, transactions?: Array<{ __typename?: 'Transaction', id: string, hash: string, nonce: number, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, timestamp: any } | null }> | null } | null };

export type ProposalsMetadataQueryVariables = Exact<{
  accounts?: InputMaybe<Scalars['AddressSet']>;
  status?: InputMaybe<ProposalStatus>;
}>;


export type ProposalsMetadataQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, accountId: string, createdAt: any }> };

export type CanRequestFundsQueryVariables = Exact<{
  recipient: Scalars['Address'];
}>;


export type CanRequestFundsQuery = { __typename?: 'Query', canRequestFunds: boolean };

export type CommentsQueryVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['Id'];
}>;


export type CommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: string, authorId: string, content: string, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', deviceId: string, emojis?: Array<string> | null }> | null }> };

export type ContractMethodQueryVariables = Exact<{
  contract: Scalars['Address'];
  sighash: Scalars['Bytes'];
}>;


export type ContractMethodQuery = { __typename?: 'Query', contractMethod?: { __typename?: 'ContractMethod', id: string, fragment: any } | null };

export type DeviceMetaQueryVariables = Exact<{
  addr?: InputMaybe<Scalars['Address']>;
}>;


export type DeviceMetaQuery = { __typename?: 'Query', device?: { __typename?: 'Device', id: string, name?: string | null } | null };

export type UserQueryVariables = Exact<{
  id: UserIdInput;
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, accountId: string, deviceId: string, name: string, activeState?: { __typename?: 'UserState', proposalId?: string | null, configs?: Array<{ __typename?: 'UserConfig', id: string, spendingAllowlisted: boolean, approvers?: Array<{ __typename?: 'Approver', deviceId: string }> | null, limits?: Array<{ __typename?: 'TokenLimit', token: string, amount: string, period: LimitPeriod }> | null }> | null } | null, proposedState?: { __typename?: 'UserState', proposalId?: string | null, configs?: Array<{ __typename?: 'UserConfig', id: string, spendingAllowlisted: boolean, approvers?: Array<{ __typename?: 'Approver', deviceId: string }> | null, limits?: Array<{ __typename?: 'TokenLimit', token: string, amount: string, period: LimitPeriod }> | null }> | null } | null } };

export type UserStateFieldsFragment = { __typename?: 'UserState', proposalId?: string | null, configs?: Array<{ __typename?: 'UserConfig', id: string, spendingAllowlisted: boolean, approvers?: Array<{ __typename?: 'Approver', deviceId: string }> | null, limits?: Array<{ __typename?: 'TokenLimit', token: string, amount: string, period: LimitPeriod }> | null }> | null };

export type UserIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type UserIdsQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, accountId: string }> };

export const ContactFieldsFragmentDoc = gql`
    fragment ContactFields on ContactObject {
  id
  addr
  name
}
    `;
export const TransactionFieldsFragmentDoc = gql`
    fragment TransactionFields on Transaction {
  id
  hash
  nonce
  gasLimit
  gasPrice
  createdAt
  response {
    success
    response
    timestamp
  }
}
    `;
export const UserStateFieldsFragmentDoc = gql`
    fragment UserStateFields on UserState {
  proposalId
  configs {
    id
    approvers {
      deviceId
    }
    spendingAllowlisted
    limits {
      token
      amount
      period
    }
  }
}
    `;
export const ActivateAccountDocument = gql`
    mutation ActivateAccount($account: Address!) {
  activateAccount(id: $account)
}
    `;
export type ActivateAccountMutationFn = Apollo.MutationFunction<ActivateAccountMutation, ActivateAccountMutationVariables>;

/**
 * __useActivateAccountMutation__
 *
 * To run a mutation, you first call `useActivateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useActivateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [activateAccountMutation, { data, loading, error }] = useActivateAccountMutation({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useActivateAccountMutation(baseOptions?: Apollo.MutationHookOptions<ActivateAccountMutation, ActivateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ActivateAccountMutation, ActivateAccountMutationVariables>(ActivateAccountDocument, options);
      }
export type ActivateAccountMutationHookResult = ReturnType<typeof useActivateAccountMutation>;
export type ActivateAccountMutationResult = Apollo.MutationResult<ActivateAccountMutation>;
export type ActivateAccountMutationOptions = Apollo.BaseMutationOptions<ActivateAccountMutation, ActivateAccountMutationVariables>;
export const CreateAccountDocument = gql`
    mutation CreateAccount($name: String!, $users: [UserWithoutAccountInput!]!) {
  createAccount(name: $name, users: $users) {
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
 *      name: // value for 'name'
 *      users: // value for 'users'
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
    id
  }
}
    `;
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
    mutation DeleteComment($id: Float!) {
  deleteComment(id: $id) {
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
 *      id: // value for 'id'
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
export const ReactDocument = gql`
    mutation React($comment: Float!, $emojis: [String!]!) {
  reactToComment(id: $comment, emojis: $emojis) {
    id
  }
}
    `;
export type ReactMutationFn = Apollo.MutationFunction<ReactMutation, ReactMutationVariables>;

/**
 * __useReactMutation__
 *
 * To run a mutation, you first call `useReactMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useReactMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [reactMutation, { data, loading, error }] = useReactMutation({
 *   variables: {
 *      comment: // value for 'comment'
 *      emojis: // value for 'emojis'
 *   },
 * });
 */
export function useReactMutation(baseOptions?: Apollo.MutationHookOptions<ReactMutation, ReactMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ReactMutation, ReactMutationVariables>(ReactDocument, options);
      }
export type ReactMutationHookResult = ReturnType<typeof useReactMutation>;
export type ReactMutationResult = Apollo.MutationResult<ReactMutation>;
export type ReactMutationOptions = Apollo.BaseMutationOptions<ReactMutation, ReactMutationVariables>;
export const DeleteContactDocument = gql`
    mutation DeleteContact($addr: Address!) {
  deleteContact(addr: $addr)
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
    mutation UpsertContact($name: String!, $newAddr: Address!, $prevAddr: Address) {
  upsertContact(name: $name, prevAddr: $prevAddr, newAddr: $newAddr) {
    id
  }
}
    `;
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
 *      name: // value for 'name'
 *      newAddr: // value for 'newAddr'
 *      prevAddr: // value for 'prevAddr'
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
export const ApproveDocument = gql`
    mutation Approve($id: Bytes32!, $signature: Bytes!) {
  approve(id: $id, signature: $signature) {
    id
    transactions {
      ...TransactionFields
    }
  }
}
    ${TransactionFieldsFragmentDoc}`;
export type ApproveMutationFn = Apollo.MutationFunction<ApproveMutation, ApproveMutationVariables>;

/**
 * __useApproveMutation__
 *
 * To run a mutation, you first call `useApproveMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApproveMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approveMutation, { data, loading, error }] = useApproveMutation({
 *   variables: {
 *      id: // value for 'id'
 *      signature: // value for 'signature'
 *   },
 * });
 */
export function useApproveMutation(baseOptions?: Apollo.MutationHookOptions<ApproveMutation, ApproveMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApproveMutation, ApproveMutationVariables>(ApproveDocument, options);
      }
export type ApproveMutationHookResult = ReturnType<typeof useApproveMutation>;
export type ApproveMutationResult = Apollo.MutationResult<ApproveMutation>;
export type ApproveMutationOptions = Apollo.BaseMutationOptions<ApproveMutation, ApproveMutationVariables>;
export const RejectDocument = gql`
    mutation Reject($id: Bytes32!) {
  reject(id: $id) {
    id
  }
}
    `;
export type RejectMutationFn = Apollo.MutationFunction<RejectMutation, RejectMutationVariables>;

/**
 * __useRejectMutation__
 *
 * To run a mutation, you first call `useRejectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRejectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rejectMutation, { data, loading, error }] = useRejectMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRejectMutation(baseOptions?: Apollo.MutationHookOptions<RejectMutation, RejectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RejectMutation, RejectMutationVariables>(RejectDocument, options);
      }
export type RejectMutationHookResult = ReturnType<typeof useRejectMutation>;
export type RejectMutationResult = Apollo.MutationResult<RejectMutation>;
export type RejectMutationOptions = Apollo.BaseMutationOptions<RejectMutation, RejectMutationVariables>;
export const SubmitExecutionDocument = gql`
    mutation SubmitExecution($proposalHash: Bytes32!, $submission: SubmissionInput!) {
  submitExecution(proposalHash: $proposalHash, submission: $submission) {
    id
  }
}
    `;
export type SubmitExecutionMutationFn = Apollo.MutationFunction<SubmitExecutionMutation, SubmitExecutionMutationVariables>;

/**
 * __useSubmitExecutionMutation__
 *
 * To run a mutation, you first call `useSubmitExecutionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitExecutionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitExecutionMutation, { data, loading, error }] = useSubmitExecutionMutation({
 *   variables: {
 *      proposalHash: // value for 'proposalHash'
 *      submission: // value for 'submission'
 *   },
 * });
 */
export function useSubmitExecutionMutation(baseOptions?: Apollo.MutationHookOptions<SubmitExecutionMutation, SubmitExecutionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitExecutionMutation, SubmitExecutionMutationVariables>(SubmitExecutionDocument, options);
      }
export type SubmitExecutionMutationHookResult = ReturnType<typeof useSubmitExecutionMutation>;
export type SubmitExecutionMutationResult = Apollo.MutationResult<SubmitExecutionMutation>;
export type SubmitExecutionMutationOptions = Apollo.BaseMutationOptions<SubmitExecutionMutation, SubmitExecutionMutationVariables>;
export const ProposeDocument = gql`
    mutation Propose($account: Address!, $config: Float, $to: Address!, $value: Uint256, $data: Bytes, $salt: Bytes8, $gasLimit: Uint256) {
  propose(
    account: $account
    config: $config
    to: $to
    value: $value
    data: $data
    salt: $salt
    gasLimit: $gasLimit
  ) {
    id
    transactions {
      ...TransactionFields
    }
  }
}
    ${TransactionFieldsFragmentDoc}`;
export type ProposeMutationFn = Apollo.MutationFunction<ProposeMutation, ProposeMutationVariables>;

/**
 * __useProposeMutation__
 *
 * To run a mutation, you first call `useProposeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useProposeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [proposeMutation, { data, loading, error }] = useProposeMutation({
 *   variables: {
 *      account: // value for 'account'
 *      config: // value for 'config'
 *      to: // value for 'to'
 *      value: // value for 'value'
 *      data: // value for 'data'
 *      salt: // value for 'salt'
 *      gasLimit: // value for 'gasLimit'
 *   },
 * });
 */
export function useProposeMutation(baseOptions?: Apollo.MutationHookOptions<ProposeMutation, ProposeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ProposeMutation, ProposeMutationVariables>(ProposeDocument, options);
      }
export type ProposeMutationHookResult = ReturnType<typeof useProposeMutation>;
export type ProposeMutationResult = Apollo.MutationResult<ProposeMutation>;
export type ProposeMutationOptions = Apollo.BaseMutationOptions<ProposeMutation, ProposeMutationVariables>;
export const RequestApprovalDocument = gql`
    mutation RequestApproval($id: Bytes32!, $approvers: NonEmptyAddressSet!) {
  requestApproval(id: $id, approvers: $approvers)
}
    `;
export type RequestApprovalMutationFn = Apollo.MutationFunction<RequestApprovalMutation, RequestApprovalMutationVariables>;

/**
 * __useRequestApprovalMutation__
 *
 * To run a mutation, you first call `useRequestApprovalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestApprovalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestApprovalMutation, { data, loading, error }] = useRequestApprovalMutation({
 *   variables: {
 *      id: // value for 'id'
 *      approvers: // value for 'approvers'
 *   },
 * });
 */
export function useRequestApprovalMutation(baseOptions?: Apollo.MutationHookOptions<RequestApprovalMutation, RequestApprovalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestApprovalMutation, RequestApprovalMutationVariables>(RequestApprovalDocument, options);
      }
export type RequestApprovalMutationHookResult = ReturnType<typeof useRequestApprovalMutation>;
export type RequestApprovalMutationResult = Apollo.MutationResult<RequestApprovalMutation>;
export type RequestApprovalMutationOptions = Apollo.BaseMutationOptions<RequestApprovalMutation, RequestApprovalMutationVariables>;
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
export const RegisterPushTokenDocument = gql`
    mutation RegisterPushToken($token: String!) {
  registerPushToken(token: $token)
}
    `;
export type RegisterPushTokenMutationFn = Apollo.MutationFunction<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>;

/**
 * __useRegisterPushTokenMutation__
 *
 * To run a mutation, you first call `useRegisterPushTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterPushTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerPushTokenMutation, { data, loading, error }] = useRegisterPushTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useRegisterPushTokenMutation(baseOptions?: Apollo.MutationHookOptions<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>(RegisterPushTokenDocument, options);
      }
export type RegisterPushTokenMutationHookResult = ReturnType<typeof useRegisterPushTokenMutation>;
export type RegisterPushTokenMutationResult = Apollo.MutationResult<RegisterPushTokenMutation>;
export type RegisterPushTokenMutationOptions = Apollo.BaseMutationOptions<RegisterPushTokenMutation, RegisterPushTokenMutationVariables>;
export const SetDeviceNameDocument = gql`
    mutation SetDeviceName($name: String) {
  setDeviceName(name: $name) {
    id
  }
}
    `;
export type SetDeviceNameMutationFn = Apollo.MutationFunction<SetDeviceNameMutation, SetDeviceNameMutationVariables>;

/**
 * __useSetDeviceNameMutation__
 *
 * To run a mutation, you first call `useSetDeviceNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetDeviceNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setDeviceNameMutation, { data, loading, error }] = useSetDeviceNameMutation({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSetDeviceNameMutation(baseOptions?: Apollo.MutationHookOptions<SetDeviceNameMutation, SetDeviceNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetDeviceNameMutation, SetDeviceNameMutationVariables>(SetDeviceNameDocument, options);
      }
export type SetDeviceNameMutationHookResult = ReturnType<typeof useSetDeviceNameMutation>;
export type SetDeviceNameMutationResult = Apollo.MutationResult<SetDeviceNameMutation>;
export type SetDeviceNameMutationOptions = Apollo.BaseMutationOptions<SetDeviceNameMutation, SetDeviceNameMutationVariables>;
export const RemoveUserDocument = gql`
    mutation RemoveUser($id: UserIdInput!, $proposalId: Bytes32!) {
  removeUser(id: $id, proposalId: $proposalId) {
    id
  }
}
    `;
export type RemoveUserMutationFn = Apollo.MutationFunction<RemoveUserMutation, RemoveUserMutationVariables>;

/**
 * __useRemoveUserMutation__
 *
 * To run a mutation, you first call `useRemoveUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeUserMutation, { data, loading, error }] = useRemoveUserMutation({
 *   variables: {
 *      id: // value for 'id'
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useRemoveUserMutation(baseOptions?: Apollo.MutationHookOptions<RemoveUserMutation, RemoveUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveUserMutation, RemoveUserMutationVariables>(RemoveUserDocument, options);
      }
export type RemoveUserMutationHookResult = ReturnType<typeof useRemoveUserMutation>;
export type RemoveUserMutationResult = Apollo.MutationResult<RemoveUserMutation>;
export type RemoveUserMutationOptions = Apollo.BaseMutationOptions<RemoveUserMutation, RemoveUserMutationVariables>;
export const UpsertUserDocument = gql`
    mutation UpsertUser($user: UserInput!, $proposalId: Bytes32!) {
  upsertUser(user: $user, proposalId: $proposalId) {
    id
  }
}
    `;
export type UpsertUserMutationFn = Apollo.MutationFunction<UpsertUserMutation, UpsertUserMutationVariables>;

/**
 * __useUpsertUserMutation__
 *
 * To run a mutation, you first call `useUpsertUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUserMutation, { data, loading, error }] = useUpsertUserMutation({
 *   variables: {
 *      user: // value for 'user'
 *      proposalId: // value for 'proposalId'
 *   },
 * });
 */
export function useUpsertUserMutation(baseOptions?: Apollo.MutationHookOptions<UpsertUserMutation, UpsertUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpsertUserMutation, UpsertUserMutationVariables>(UpsertUserDocument, options);
      }
export type UpsertUserMutationHookResult = ReturnType<typeof useUpsertUserMutation>;
export type UpsertUserMutationResult = Apollo.MutationResult<UpsertUserMutation>;
export type UpsertUserMutationOptions = Apollo.BaseMutationOptions<UpsertUserMutation, UpsertUserMutationVariables>;
export const SetUserNameDocument = gql`
    mutation SetUserName($user: UserIdInput!, $name: String!) {
  setUserName(id: $user, name: $name) {
    id
  }
}
    `;
export type SetUserNameMutationFn = Apollo.MutationFunction<SetUserNameMutation, SetUserNameMutationVariables>;

/**
 * __useSetUserNameMutation__
 *
 * To run a mutation, you first call `useSetUserNameMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetUserNameMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setUserNameMutation, { data, loading, error }] = useSetUserNameMutation({
 *   variables: {
 *      user: // value for 'user'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useSetUserNameMutation(baseOptions?: Apollo.MutationHookOptions<SetUserNameMutation, SetUserNameMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetUserNameMutation, SetUserNameMutationVariables>(SetUserNameDocument, options);
      }
export type SetUserNameMutationHookResult = ReturnType<typeof useSetUserNameMutation>;
export type SetUserNameMutationResult = Apollo.MutationResult<SetUserNameMutation>;
export type SetUserNameMutationOptions = Apollo.BaseMutationOptions<SetUserNameMutation, SetUserNameMutationVariables>;
export const AccountDocument = gql`
    query Account($account: Address!) {
  account(id: $account) {
    id
    isActive
    name
    users {
      deviceId
      name
    }
  }
}
    `;

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
export const ProposalDocument = gql`
    query Proposal($id: Bytes32!) {
  proposal(id: $id) {
    id
    accountId
    proposerId
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
    transactions {
      ...TransactionFields
    }
  }
}
    ${TransactionFieldsFragmentDoc}`;

/**
 * __useProposalQuery__
 *
 * To run a query within a React component, call `useProposalQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProposalQuery(baseOptions: Apollo.QueryHookOptions<ProposalQuery, ProposalQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, options);
      }
export function useProposalLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalQuery, ProposalQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalQuery, ProposalQueryVariables>(ProposalDocument, options);
        }
export type ProposalQueryHookResult = ReturnType<typeof useProposalQuery>;
export type ProposalLazyQueryHookResult = ReturnType<typeof useProposalLazyQuery>;
export type ProposalQueryResult = Apollo.QueryResult<ProposalQuery, ProposalQueryVariables>;
export const ProposalsMetadataDocument = gql`
    query ProposalsMetadata($accounts: AddressSet, $status: ProposalStatus) {
  proposals(accounts: $accounts, status: $status) {
    id
    accountId
    createdAt
  }
}
    `;

/**
 * __useProposalsMetadataQuery__
 *
 * To run a query within a React component, call `useProposalsMetadataQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsMetadataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsMetadataQuery({
 *   variables: {
 *      accounts: // value for 'accounts'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useProposalsMetadataQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>(ProposalsMetadataDocument, options);
      }
export function useProposalsMetadataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>(ProposalsMetadataDocument, options);
        }
export type ProposalsMetadataQueryHookResult = ReturnType<typeof useProposalsMetadataQuery>;
export type ProposalsMetadataLazyQueryHookResult = ReturnType<typeof useProposalsMetadataLazyQuery>;
export type ProposalsMetadataQueryResult = Apollo.QueryResult<ProposalsMetadataQuery, ProposalsMetadataQueryVariables>;
export const CanRequestFundsDocument = gql`
    query CanRequestFunds($recipient: Address!) {
  canRequestFunds(recipient: $recipient)
}
    `;

/**
 * __useCanRequestFundsQuery__
 *
 * To run a query within a React component, call `useCanRequestFundsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCanRequestFundsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanRequestFundsQuery({
 *   variables: {
 *      recipient: // value for 'recipient'
 *   },
 * });
 */
export function useCanRequestFundsQuery(baseOptions: Apollo.QueryHookOptions<CanRequestFundsQuery, CanRequestFundsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CanRequestFundsQuery, CanRequestFundsQueryVariables>(CanRequestFundsDocument, options);
      }
export function useCanRequestFundsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CanRequestFundsQuery, CanRequestFundsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CanRequestFundsQuery, CanRequestFundsQueryVariables>(CanRequestFundsDocument, options);
        }
export type CanRequestFundsQueryHookResult = ReturnType<typeof useCanRequestFundsQuery>;
export type CanRequestFundsLazyQueryHookResult = ReturnType<typeof useCanRequestFundsLazyQuery>;
export type CanRequestFundsQueryResult = Apollo.QueryResult<CanRequestFundsQuery, CanRequestFundsQueryVariables>;
export const CommentsDocument = gql`
    query Comments($account: Address!, $key: Id!) {
  comments(account: $account, key: $key) {
    id
    authorId
    content
    updatedAt
    reactions {
      deviceId
      emojis
    }
  }
}
    `;

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
export const DeviceMetaDocument = gql`
    query DeviceMeta($addr: Address) {
  device(addr: $addr) {
    id
    name
  }
}
    `;

/**
 * __useDeviceMetaQuery__
 *
 * To run a query within a React component, call `useDeviceMetaQuery` and pass it any options that fit your needs.
 * When your component renders, `useDeviceMetaQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDeviceMetaQuery({
 *   variables: {
 *      addr: // value for 'addr'
 *   },
 * });
 */
export function useDeviceMetaQuery(baseOptions?: Apollo.QueryHookOptions<DeviceMetaQuery, DeviceMetaQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<DeviceMetaQuery, DeviceMetaQueryVariables>(DeviceMetaDocument, options);
      }
export function useDeviceMetaLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<DeviceMetaQuery, DeviceMetaQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<DeviceMetaQuery, DeviceMetaQueryVariables>(DeviceMetaDocument, options);
        }
export type DeviceMetaQueryHookResult = ReturnType<typeof useDeviceMetaQuery>;
export type DeviceMetaLazyQueryHookResult = ReturnType<typeof useDeviceMetaLazyQuery>;
export type DeviceMetaQueryResult = Apollo.QueryResult<DeviceMetaQuery, DeviceMetaQueryVariables>;
export const UserDocument = gql`
    query User($id: UserIdInput!) {
  user(id: $id) {
    id
    accountId
    deviceId
    name
    activeState {
      ...UserStateFields
    }
    proposedState {
      ...UserStateFields
    }
  }
}
    ${UserStateFieldsFragmentDoc}`;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useUserQuery(baseOptions: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, options);
      }
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, options);
        }
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;
export const UserIdsDocument = gql`
    query UserIds {
  users {
    id
    accountId
  }
}
    `;

/**
 * __useUserIdsQuery__
 *
 * To run a query within a React component, call `useUserIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserIdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserIdsQuery(baseOptions?: Apollo.QueryHookOptions<UserIdsQuery, UserIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserIdsQuery, UserIdsQueryVariables>(UserIdsDocument, options);
      }
export function useUserIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserIdsQuery, UserIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserIdsQuery, UserIdsQueryVariables>(UserIdsDocument, options);
        }
export type UserIdsQueryHookResult = ReturnType<typeof useUserIdsQuery>;
export type UserIdsLazyQueryHookResult = ReturnType<typeof useUserIdsLazyQuery>;
export type UserIdsQueryResult = Apollo.QueryResult<UserIdsQuery, UserIdsQueryVariables>;