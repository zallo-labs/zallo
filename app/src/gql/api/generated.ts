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

export type AbiSource =
  | 'DECOMPILED'
  | 'STANDARD'
  | 'VERIFIED';

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

export type AccountEvent =
  | 'create'
  | 'update';

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

export type AccountScalarFieldEnum =
  | 'deploySalt'
  | 'id'
  | 'impl'
  | 'isActive'
  | 'name';

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

export type ContactScalarFieldEnum =
  | 'addr'
  | 'name'
  | 'userId';

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

export type ContractSourceConfidence =
  | 'High'
  | 'Low'
  | 'Medium';

export type CreateAccountInput = {
  name: Scalars['String'];
  policies: Array<PolicyInput>;
};

export type CreatePolicyInput = {
  account: Scalars['Address'];
  /** Signers that are required to approve */
  approvers?: InputMaybe<Array<Scalars['Address']>>;
  key?: InputMaybe<Scalars['PolicyKey']>;
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

export type ExplorerTransfer = {
  __typename?: 'ExplorerTransfer';
  amount: Scalars['Uint256'];
  from: Scalars['Address'];
  id: Scalars['String'];
  timestamp: Scalars['DateTime'];
  to: Scalars['Address'];
  token: Scalars['Address'];
  transferNumber: Scalars['Float'];
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
  account: Scalars['Address'];
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
  key?: InputMaybe<Scalars['PolicyKey']>;
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

export type PolicyScalarFieldEnum =
  | 'accountId'
  | 'activeId'
  | 'draftId'
  | 'key'
  | 'name';

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

export type ProposalEvent =
  | 'create'
  | 'delete'
  | 'response'
  | 'update';

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

export type ProposalScalarFieldEnum =
  | 'accountId'
  | 'createdAt'
  | 'data'
  | 'estimatedOpGas'
  | 'feeToken'
  | 'gasLimit'
  | 'id'
  | 'nonce'
  | 'proposerId'
  | 'to'
  | 'value';

export type ProposalState =
  | 'Executed'
  | 'Executing'
  | 'Pending';

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
  transfers: Array<ExplorerTransfer>;
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
  account: Scalars['Address'];
};


export type QueryTransfersArgs = {
  input: TransfersInput;
};


export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Address']>;
};

export type QueryMode =
  | 'default'
  | 'insensitive';

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

export type SortOrder =
  | 'asc'
  | 'desc';

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
  _count: TransactionResponseCount;
  fee: Scalars['Decimal'];
  gasPrice: Scalars['Decimal'];
  gasUsed: Scalars['Decimal'];
  response: Scalars['String'];
  success: Scalars['Boolean'];
  timestamp: Scalars['DateTime'];
  transaction: Transaction;
  transactionHash: Scalars['String'];
  transfers?: Maybe<Array<Transfer>>;
};

export type TransactionResponseCount = {
  __typename?: 'TransactionResponseCount';
  transfers: Scalars['Int'];
};

export type TransactionResponseRelationFilter = {
  is?: InputMaybe<TransactionResponseWhereInput>;
  isNot?: InputMaybe<TransactionResponseWhereInput>;
};

export type TransactionResponseWhereInput = {
  AND?: InputMaybe<Array<TransactionResponseWhereInput>>;
  NOT?: InputMaybe<Array<TransactionResponseWhereInput>>;
  OR?: InputMaybe<Array<TransactionResponseWhereInput>>;
  fee?: InputMaybe<DecimalFilter>;
  gasPrice?: InputMaybe<DecimalFilter>;
  gasUsed?: InputMaybe<DecimalFilter>;
  response?: InputMaybe<StringFilter>;
  success?: InputMaybe<BoolFilter>;
  timestamp?: InputMaybe<DateTimeFilter>;
  transaction?: InputMaybe<TransactionRelationFilter>;
  transactionHash?: InputMaybe<StringFilter>;
  transfers?: InputMaybe<TransferListRelationFilter>;
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

export type Transfer = {
  __typename?: 'Transfer';
  amount: Scalars['Decimal'];
  from: Scalars['String'];
  fromResponse: TransactionResponse;
  to: Scalars['String'];
  token: Scalars['String'];
  transactionHash: Scalars['String'];
  transferNumber: Scalars['Int'];
};

export type TransferDirection =
  | 'IN'
  | 'OUT';

export type TransferListRelationFilter = {
  every?: InputMaybe<TransferWhereInput>;
  none?: InputMaybe<TransferWhereInput>;
  some?: InputMaybe<TransferWhereInput>;
};

export type TransferWhereInput = {
  AND?: InputMaybe<Array<TransferWhereInput>>;
  NOT?: InputMaybe<Array<TransferWhereInput>>;
  OR?: InputMaybe<Array<TransferWhereInput>>;
  amount?: InputMaybe<DecimalFilter>;
  from?: InputMaybe<StringFilter>;
  fromResponse?: InputMaybe<TransactionResponseRelationFilter>;
  to?: InputMaybe<StringFilter>;
  token?: InputMaybe<StringFilter>;
  transactionHash?: InputMaybe<StringFilter>;
  transferNumber?: InputMaybe<IntFilter>;
};

export type TransfersInput = {
  account: Scalars['Address'];
  direction?: InputMaybe<TransferDirection>;
  skip?: InputMaybe<Scalars['Float']>;
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
  key?: InputMaybe<Scalars['PolicyKey']>;
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

export type PolicyStateFieldsFragment = { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null };

export type PolicyFieldsFragment = { __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null };

export type AccountFieldsFragment = { __typename?: 'Account', id: string, name: string, isActive: boolean, policies?: Array<{ __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null }> | null };

export type AccountQueryVariables = Exact<{
  id: Scalars['Address'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, name: string, isActive: boolean, policies?: Array<{ __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null }> | null } | null };

export type AccountIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type AccountIdsQuery = { __typename?: 'Query', accounts: Array<{ __typename?: 'Account', id: string }> };

export type AccountSubscriptionSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type AccountSubscriptionSubscription = { __typename?: 'Subscription', account: { __typename?: 'Account', id: string, name: string, isActive: boolean, policies?: Array<{ __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null }> | null } };

export type CreateAccountMutationVariables = Exact<{
  args: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Account', id: string, name: string, isActive: boolean, policies?: Array<{ __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null }> | null } };

export type TransfersQueryVariables = Exact<{
  input: TransfersInput;
}>;


export type TransfersQuery = { __typename?: 'Query', transfers: Array<{ __typename?: 'ExplorerTransfer', id: string, token: any, from: any, to: any, amount: any, timestamp: any }> };

export type UpdateAccountMutationVariables = Exact<{
  args: UpdateAccountInput;
}>;


export type UpdateAccountMutation = { __typename?: 'Mutation', updateAccount: { __typename?: 'Account', id: string, name: string } };

export type CommentFieldsFragment = { __typename?: 'Comment', id: number, authorId: string, content: string, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', userId: string, emojis?: Array<string> | null }> | null };

export type CommentsQueryVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['String'];
}>;


export type CommentsQuery = { __typename?: 'Query', comments: Array<{ __typename?: 'Comment', id: number, authorId: string, content: string, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', userId: string, emojis?: Array<string> | null }> | null }> };

export type CreateCommentMutationVariables = Exact<{
  account: Scalars['Address'];
  key: Scalars['String'];
  content: Scalars['String'];
}>;


export type CreateCommentMutation = { __typename?: 'Mutation', createComment: { __typename?: 'Comment', id: number, authorId: string, content: string, updatedAt: any, reactions?: Array<{ __typename?: 'Reaction', userId: string, emojis?: Array<string> | null }> | null } };

export type DeleteCommentMutationVariables = Exact<{
  id: Scalars['Float'];
}>;


export type DeleteCommentMutation = { __typename?: 'Mutation', deleteComment: { __typename?: 'Comment', id: number } };

export type ReactMutationVariables = Exact<{
  comment: Scalars['Float'];
  emojis: Array<Scalars['String']> | Scalars['String'];
}>;


export type ReactMutation = { __typename?: 'Mutation', reactToComment?: { __typename?: 'Reaction', id: string } | null };

export type ContactFieldsFragment = { __typename?: 'ContactObject', id: string, addr: any, name: string };

export type ContactsQueryVariables = Exact<{ [key: string]: never; }>;


export type ContactsQuery = { __typename?: 'Query', contacts: Array<{ __typename?: 'ContactObject', id: string, addr: any, name: string }> };

export type DeleteContactMutationVariables = Exact<{
  addr: Scalars['Address'];
}>;


export type DeleteContactMutation = { __typename?: 'Mutation', deleteContact: { __typename?: 'Contact', addr: string } };

export type UpsertContactMutationVariables = Exact<{
  name: Scalars['String'];
  newAddr: Scalars['Address'];
  prevAddr?: InputMaybe<Scalars['Address']>;
}>;


export type UpsertContactMutation = { __typename?: 'Mutation', upsertContact: { __typename?: 'ContactObject', id: string, addr: any, name: string } };

export type ContractFunctionFieldsFragment = { __typename?: 'ContractFunction', id: number, contractId?: string | null, selector: string, abi: any, source: AbiSource, sourceConfidence: ContractSourceConfidence };

export type ContractFunctionQueryVariables = Exact<{
  args: ContractFunctionInput;
}>;


export type ContractFunctionQuery = { __typename?: 'Query', contractFunction?: { __typename?: 'ContractFunction', id: number, contractId?: string | null, selector: string, abi: any, source: AbiSource, sourceConfidence: ContractSourceConfidence } | null };

export type ContractQueryVariables = Exact<{
  args: ContractInput;
}>;


export type ContractQuery = { __typename?: 'Query', contract?: { __typename?: 'Contract', id: string, functions?: Array<{ __typename?: 'ContractFunction', id: number, contractId?: string | null, selector: string, abi: any, source: AbiSource, sourceConfidence: ContractSourceConfidence }> | null } | null };

export type RequestableTokensQueryVariables = Exact<{
  account: Scalars['Address'];
}>;


export type RequestableTokensQuery = { __typename?: 'Query', requestableTokens: Array<any> };

export type RequestTokensMutationVariables = Exact<{
  account: Scalars['Address'];
}>;


export type RequestTokensMutation = { __typename?: 'Mutation', requestTokens: Array<any> };

export type CreatePolicyMutationVariables = Exact<{
  args: CreatePolicyInput;
}>;


export type CreatePolicyMutation = { __typename?: 'Mutation', createPolicy: { __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null } };

export type RemovePolicyMutationVariables = Exact<{
  args: UniquePolicyInput;
}>;


export type RemovePolicyMutation = { __typename?: 'Mutation', removePolicy: { __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null } };

export type UpdatePolicyMutationVariables = Exact<{
  args: UpdatePolicyInput;
}>;


export type UpdatePolicyMutation = { __typename?: 'Mutation', updatePolicy: { __typename?: 'Policy', id: string, key: any, name: string, active?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null, draft?: { __typename?: 'PolicyState', id: any, proposalId?: string | null, createdAt: any, isRemoved: boolean, threshold: number, approvers?: Array<{ __typename?: 'Approver', userId: string }> | null, targets?: Array<{ __typename?: 'Target', to: string, selectors?: Array<string> | null }> | null } | null } };

export type ApproveMutationVariables = Exact<{
  id: Scalars['Bytes32'];
  signature: Scalars['Bytes'];
}>;


export type ApproveMutation = { __typename?: 'Mutation', approve: { __typename?: 'Proposal', id: string, approvals?: Array<{ __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any }> | null, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }>, transaction?: { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null } | null } };

export type ApprovalFieldsFragment = { __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any };

export type RejectionFieldsFragment = { __typename?: 'Rejection', userId: string, createdAt: any };

export type TransactionFieldsFragment = { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null };

export type ProposalFieldsFragment = { __typename?: 'Proposal', id: string, accountId: string, proposerId: string, to: string, value?: any | null, data?: string | null, nonce: any, gasLimit?: any | null, estimatedOpGas: any, feeToken?: string | null, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any }> | null, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }>, satisfiablePolicies: Array<{ __typename?: 'SatisfiablePolicy', id: string, key: any, satisfied: boolean, requiresUserAction: boolean }>, transaction?: { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null } | null };

export type ProposalQueryVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type ProposalQuery = { __typename?: 'Query', proposal?: { __typename?: 'Proposal', id: string, accountId: string, proposerId: string, to: string, value?: any | null, data?: string | null, nonce: any, gasLimit?: any | null, estimatedOpGas: any, feeToken?: string | null, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any }> | null, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }>, satisfiablePolicies: Array<{ __typename?: 'SatisfiablePolicy', id: string, key: any, satisfied: boolean, requiresUserAction: boolean }>, transaction?: { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null } | null } | null };

export type ProposalSubscriptionSubscriptionVariables = Exact<{
  accounts?: InputMaybe<Array<Scalars['Address']> | Scalars['Address']>;
  proposals?: InputMaybe<Array<Scalars['Bytes32']> | Scalars['Bytes32']>;
  events?: InputMaybe<Array<ProposalEvent> | ProposalEvent>;
}>;


export type ProposalSubscriptionSubscription = { __typename?: 'Subscription', proposal: { __typename?: 'Proposal', id: string, accountId: string, proposerId: string, to: string, value?: any | null, data?: string | null, nonce: any, gasLimit?: any | null, estimatedOpGas: any, feeToken?: string | null, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any }> | null, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }>, satisfiablePolicies: Array<{ __typename?: 'SatisfiablePolicy', id: string, key: any, satisfied: boolean, requiresUserAction: boolean }>, transaction?: { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null } | null } };

export type ProposalsQueryVariables = Exact<{
  accounts?: InputMaybe<Array<Scalars['Address']> | Scalars['Address']>;
  states?: InputMaybe<Array<ProposalState> | ProposalState>;
  take?: InputMaybe<Scalars['Int']>;
  cursor?: InputMaybe<ProposalWhereUniqueInput>;
}>;


export type ProposalsQuery = { __typename?: 'Query', proposals: Array<{ __typename?: 'Proposal', id: string, accountId: string, proposerId: string, to: string, value?: any | null, data?: string | null, nonce: any, gasLimit?: any | null, estimatedOpGas: any, feeToken?: string | null, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any }> | null, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }>, satisfiablePolicies: Array<{ __typename?: 'SatisfiablePolicy', id: string, key: any, satisfied: boolean, requiresUserAction: boolean }>, transaction?: { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null } | null }> };

export type ProposeMutationVariables = Exact<{
  account: Scalars['Address'];
  to: Scalars['Address'];
  value?: InputMaybe<Scalars['Uint256']>;
  data?: InputMaybe<Scalars['Bytes']>;
  nonce?: InputMaybe<Scalars['Uint256']>;
  gasLimit?: InputMaybe<Scalars['Uint256']>;
}>;


export type ProposeMutation = { __typename?: 'Mutation', propose: { __typename?: 'Proposal', id: string, accountId: string, proposerId: string, to: string, value?: any | null, data?: string | null, nonce: any, gasLimit?: any | null, estimatedOpGas: any, feeToken?: string | null, createdAt: any, approvals?: Array<{ __typename?: 'Approval', userId: string, signature?: string | null, createdAt: any }> | null, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }>, satisfiablePolicies: Array<{ __typename?: 'SatisfiablePolicy', id: string, key: any, satisfied: boolean, requiresUserAction: boolean }>, transaction?: { __typename?: 'Transaction', id: string, hash: string, gasLimit: any, gasPrice?: any | null, createdAt: any, response?: { __typename?: 'TransactionResponse', success: boolean, response: string, gasUsed: any, gasPrice: any, fee: any, timestamp: any, transfers?: Array<{ __typename?: 'Transfer', token: string, from: string, to: string, amount: any }> | null } | null } | null } };

export type RejectMutationVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type RejectMutation = { __typename?: 'Mutation', reject: { __typename?: 'Proposal', id: string, rejections: Array<{ __typename?: 'Rejection', userId: string, createdAt: any }> } };

export type RemoveProposalMutationVariables = Exact<{
  id: Scalars['Bytes32'];
}>;


export type RemoveProposalMutation = { __typename?: 'Mutation', removeProposal: { __typename?: 'Proposal', id: string } };

export type UpdateUserMutationVariables = Exact<{
  name?: InputMaybe<Scalars['String']>;
  pushToken?: InputMaybe<Scalars['String']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, name?: string | null } };

export type UserQueryVariables = Exact<{
  id?: InputMaybe<Scalars['Address']>;
}>;


export type UserQuery = { __typename?: 'Query', user: { __typename?: 'User', id: string, name?: string | null } };

export const PolicyStateFieldsFragmentDoc = gql`
    fragment PolicyStateFields on PolicyState {
  id
  proposalId
  createdAt
  isRemoved
  threshold
  approvers {
    userId
  }
  targets {
    to
    selectors
  }
}
    `;
export const PolicyFieldsFragmentDoc = gql`
    fragment PolicyFields on Policy {
  id
  key
  name
  active {
    ...PolicyStateFields
  }
  draft {
    ...PolicyStateFields
  }
}
    ${PolicyStateFieldsFragmentDoc}`;
export const AccountFieldsFragmentDoc = gql`
    fragment AccountFields on Account {
  id
  name
  isActive
  policies {
    ...PolicyFields
  }
}
    ${PolicyFieldsFragmentDoc}`;
export const CommentFieldsFragmentDoc = gql`
    fragment CommentFields on Comment {
  id
  authorId
  content
  updatedAt
  reactions {
    userId
    emojis
  }
}
    `;
export const ContactFieldsFragmentDoc = gql`
    fragment ContactFields on ContactObject {
  id
  addr
  name
}
    `;
export const ContractFunctionFieldsFragmentDoc = gql`
    fragment ContractFunctionFields on ContractFunction {
  id
  contractId
  selector
  abi
  source
  sourceConfidence
}
    `;
export const ApprovalFieldsFragmentDoc = gql`
    fragment ApprovalFields on Approval {
  userId
  signature
  createdAt
}
    `;
export const RejectionFieldsFragmentDoc = gql`
    fragment RejectionFields on Rejection {
  userId
  createdAt
}
    `;
export const TransactionFieldsFragmentDoc = gql`
    fragment TransactionFields on Transaction {
  id
  hash
  gasLimit
  gasPrice
  createdAt
  response {
    success
    response
    gasUsed
    gasPrice
    fee
    timestamp
    transfers {
      token
      from
      to
      amount
    }
  }
}
    `;
export const ProposalFieldsFragmentDoc = gql`
    fragment ProposalFields on Proposal {
  id
  accountId
  proposerId
  to
  value
  data
  nonce
  gasLimit
  estimatedOpGas
  feeToken
  createdAt
  approvals {
    ...ApprovalFields
  }
  rejections {
    ...RejectionFields
  }
  satisfiablePolicies {
    id
    key
    satisfied
    requiresUserAction
  }
  transaction {
    ...TransactionFields
  }
}
    ${ApprovalFieldsFragmentDoc}
${RejectionFieldsFragmentDoc}
${TransactionFieldsFragmentDoc}`;
export const AccountDocument = gql`
    query Account($id: Address!) {
  account(id: $id) {
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
 *      id: // value for 'id'
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
export const AccountIdsDocument = gql`
    query AccountIds {
  accounts {
    id
  }
}
    `;

/**
 * __useAccountIdsQuery__
 *
 * To run a query within a React component, call `useAccountIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAccountIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountIdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAccountIdsQuery(baseOptions?: Apollo.QueryHookOptions<AccountIdsQuery, AccountIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AccountIdsQuery, AccountIdsQueryVariables>(AccountIdsDocument, options);
      }
export function useAccountIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AccountIdsQuery, AccountIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AccountIdsQuery, AccountIdsQueryVariables>(AccountIdsDocument, options);
        }
export type AccountIdsQueryHookResult = ReturnType<typeof useAccountIdsQuery>;
export type AccountIdsLazyQueryHookResult = ReturnType<typeof useAccountIdsLazyQuery>;
export type AccountIdsQueryResult = Apollo.QueryResult<AccountIdsQuery, AccountIdsQueryVariables>;
export const AccountSubscriptionDocument = gql`
    subscription AccountSubscription {
  account {
    ...AccountFields
  }
}
    ${AccountFieldsFragmentDoc}`;

/**
 * __useAccountSubscriptionSubscription__
 *
 * To run a query within a React component, call `useAccountSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useAccountSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAccountSubscriptionSubscription({
 *   variables: {
 *   },
 * });
 */
export function useAccountSubscriptionSubscription(baseOptions?: Apollo.SubscriptionHookOptions<AccountSubscriptionSubscription, AccountSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<AccountSubscriptionSubscription, AccountSubscriptionSubscriptionVariables>(AccountSubscriptionDocument, options);
      }
export type AccountSubscriptionSubscriptionHookResult = ReturnType<typeof useAccountSubscriptionSubscription>;
export type AccountSubscriptionSubscriptionResult = Apollo.SubscriptionResult<AccountSubscriptionSubscription>;
export const CreateAccountDocument = gql`
    mutation CreateAccount($args: CreateAccountInput!) {
  createAccount(args: $args) {
    ...AccountFields
  }
}
    ${AccountFieldsFragmentDoc}`;
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
 *      args: // value for 'args'
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
export const TransfersDocument = gql`
    query Transfers($input: TransfersInput!) {
  transfers(input: $input) {
    id
    token
    from
    to
    amount
    timestamp
  }
}
    `;

/**
 * __useTransfersQuery__
 *
 * To run a query within a React component, call `useTransfersQuery` and pass it any options that fit your needs.
 * When your component renders, `useTransfersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useTransfersQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useTransfersQuery(baseOptions: Apollo.QueryHookOptions<TransfersQuery, TransfersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<TransfersQuery, TransfersQueryVariables>(TransfersDocument, options);
      }
export function useTransfersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<TransfersQuery, TransfersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<TransfersQuery, TransfersQueryVariables>(TransfersDocument, options);
        }
export type TransfersQueryHookResult = ReturnType<typeof useTransfersQuery>;
export type TransfersLazyQueryHookResult = ReturnType<typeof useTransfersLazyQuery>;
export type TransfersQueryResult = Apollo.QueryResult<TransfersQuery, TransfersQueryVariables>;
export const UpdateAccountDocument = gql`
    mutation UpdateAccount($args: UpdateAccountInput!) {
  updateAccount(args: $args) {
    id
    name
  }
}
    `;
export type UpdateAccountMutationFn = Apollo.MutationFunction<UpdateAccountMutation, UpdateAccountMutationVariables>;

/**
 * __useUpdateAccountMutation__
 *
 * To run a mutation, you first call `useUpdateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAccountMutation, { data, loading, error }] = useUpdateAccountMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useUpdateAccountMutation(baseOptions?: Apollo.MutationHookOptions<UpdateAccountMutation, UpdateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateAccountMutation, UpdateAccountMutationVariables>(UpdateAccountDocument, options);
      }
export type UpdateAccountMutationHookResult = ReturnType<typeof useUpdateAccountMutation>;
export type UpdateAccountMutationResult = Apollo.MutationResult<UpdateAccountMutation>;
export type UpdateAccountMutationOptions = Apollo.BaseMutationOptions<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const CommentsDocument = gql`
    query Comments($account: Address!, $key: String!) {
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
export const CreateCommentDocument = gql`
    mutation CreateComment($account: Address!, $key: String!, $content: String!) {
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
export const DeleteContactDocument = gql`
    mutation DeleteContact($addr: Address!) {
  deleteContact(addr: $addr) {
    addr
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
    mutation UpsertContact($name: String!, $newAddr: Address!, $prevAddr: Address) {
  upsertContact(name: $name, prevAddr: $prevAddr, newAddr: $newAddr) {
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
export const ContractFunctionDocument = gql`
    query ContractFunction($args: ContractFunctionInput!) {
  contractFunction(args: $args) {
    ...ContractFunctionFields
  }
}
    ${ContractFunctionFieldsFragmentDoc}`;

/**
 * __useContractFunctionQuery__
 *
 * To run a query within a React component, call `useContractFunctionQuery` and pass it any options that fit your needs.
 * When your component renders, `useContractFunctionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContractFunctionQuery({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useContractFunctionQuery(baseOptions: Apollo.QueryHookOptions<ContractFunctionQuery, ContractFunctionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContractFunctionQuery, ContractFunctionQueryVariables>(ContractFunctionDocument, options);
      }
export function useContractFunctionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContractFunctionQuery, ContractFunctionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContractFunctionQuery, ContractFunctionQueryVariables>(ContractFunctionDocument, options);
        }
export type ContractFunctionQueryHookResult = ReturnType<typeof useContractFunctionQuery>;
export type ContractFunctionLazyQueryHookResult = ReturnType<typeof useContractFunctionLazyQuery>;
export type ContractFunctionQueryResult = Apollo.QueryResult<ContractFunctionQuery, ContractFunctionQueryVariables>;
export const ContractDocument = gql`
    query Contract($args: ContractInput!) {
  contract(args: $args) {
    id
    functions {
      ...ContractFunctionFields
    }
  }
}
    ${ContractFunctionFieldsFragmentDoc}`;

/**
 * __useContractQuery__
 *
 * To run a query within a React component, call `useContractQuery` and pass it any options that fit your needs.
 * When your component renders, `useContractQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContractQuery({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useContractQuery(baseOptions: Apollo.QueryHookOptions<ContractQuery, ContractQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ContractQuery, ContractQueryVariables>(ContractDocument, options);
      }
export function useContractLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ContractQuery, ContractQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ContractQuery, ContractQueryVariables>(ContractDocument, options);
        }
export type ContractQueryHookResult = ReturnType<typeof useContractQuery>;
export type ContractLazyQueryHookResult = ReturnType<typeof useContractLazyQuery>;
export type ContractQueryResult = Apollo.QueryResult<ContractQuery, ContractQueryVariables>;
export const RequestableTokensDocument = gql`
    query RequestableTokens($account: Address!) {
  requestableTokens(account: $account)
}
    `;

/**
 * __useRequestableTokensQuery__
 *
 * To run a query within a React component, call `useRequestableTokensQuery` and pass it any options that fit your needs.
 * When your component renders, `useRequestableTokensQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRequestableTokensQuery({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useRequestableTokensQuery(baseOptions: Apollo.QueryHookOptions<RequestableTokensQuery, RequestableTokensQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<RequestableTokensQuery, RequestableTokensQueryVariables>(RequestableTokensDocument, options);
      }
export function useRequestableTokensLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<RequestableTokensQuery, RequestableTokensQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<RequestableTokensQuery, RequestableTokensQueryVariables>(RequestableTokensDocument, options);
        }
export type RequestableTokensQueryHookResult = ReturnType<typeof useRequestableTokensQuery>;
export type RequestableTokensLazyQueryHookResult = ReturnType<typeof useRequestableTokensLazyQuery>;
export type RequestableTokensQueryResult = Apollo.QueryResult<RequestableTokensQuery, RequestableTokensQueryVariables>;
export const RequestTokensDocument = gql`
    mutation RequestTokens($account: Address!) {
  requestTokens(account: $account)
}
    `;
export type RequestTokensMutationFn = Apollo.MutationFunction<RequestTokensMutation, RequestTokensMutationVariables>;

/**
 * __useRequestTokensMutation__
 *
 * To run a mutation, you first call `useRequestTokensMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestTokensMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestTokensMutation, { data, loading, error }] = useRequestTokensMutation({
 *   variables: {
 *      account: // value for 'account'
 *   },
 * });
 */
export function useRequestTokensMutation(baseOptions?: Apollo.MutationHookOptions<RequestTokensMutation, RequestTokensMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestTokensMutation, RequestTokensMutationVariables>(RequestTokensDocument, options);
      }
export type RequestTokensMutationHookResult = ReturnType<typeof useRequestTokensMutation>;
export type RequestTokensMutationResult = Apollo.MutationResult<RequestTokensMutation>;
export type RequestTokensMutationOptions = Apollo.BaseMutationOptions<RequestTokensMutation, RequestTokensMutationVariables>;
export const CreatePolicyDocument = gql`
    mutation CreatePolicy($args: CreatePolicyInput!) {
  createPolicy(args: $args) {
    ...PolicyFields
  }
}
    ${PolicyFieldsFragmentDoc}`;
export type CreatePolicyMutationFn = Apollo.MutationFunction<CreatePolicyMutation, CreatePolicyMutationVariables>;

/**
 * __useCreatePolicyMutation__
 *
 * To run a mutation, you first call `useCreatePolicyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePolicyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPolicyMutation, { data, loading, error }] = useCreatePolicyMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useCreatePolicyMutation(baseOptions?: Apollo.MutationHookOptions<CreatePolicyMutation, CreatePolicyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePolicyMutation, CreatePolicyMutationVariables>(CreatePolicyDocument, options);
      }
export type CreatePolicyMutationHookResult = ReturnType<typeof useCreatePolicyMutation>;
export type CreatePolicyMutationResult = Apollo.MutationResult<CreatePolicyMutation>;
export type CreatePolicyMutationOptions = Apollo.BaseMutationOptions<CreatePolicyMutation, CreatePolicyMutationVariables>;
export const RemovePolicyDocument = gql`
    mutation RemovePolicy($args: UniquePolicyInput!) {
  removePolicy(args: $args) {
    ...PolicyFields
  }
}
    ${PolicyFieldsFragmentDoc}`;
export type RemovePolicyMutationFn = Apollo.MutationFunction<RemovePolicyMutation, RemovePolicyMutationVariables>;

/**
 * __useRemovePolicyMutation__
 *
 * To run a mutation, you first call `useRemovePolicyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePolicyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePolicyMutation, { data, loading, error }] = useRemovePolicyMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useRemovePolicyMutation(baseOptions?: Apollo.MutationHookOptions<RemovePolicyMutation, RemovePolicyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemovePolicyMutation, RemovePolicyMutationVariables>(RemovePolicyDocument, options);
      }
export type RemovePolicyMutationHookResult = ReturnType<typeof useRemovePolicyMutation>;
export type RemovePolicyMutationResult = Apollo.MutationResult<RemovePolicyMutation>;
export type RemovePolicyMutationOptions = Apollo.BaseMutationOptions<RemovePolicyMutation, RemovePolicyMutationVariables>;
export const UpdatePolicyDocument = gql`
    mutation UpdatePolicy($args: UpdatePolicyInput!) {
  updatePolicy(args: $args) {
    ...PolicyFields
  }
}
    ${PolicyFieldsFragmentDoc}`;
export type UpdatePolicyMutationFn = Apollo.MutationFunction<UpdatePolicyMutation, UpdatePolicyMutationVariables>;

/**
 * __useUpdatePolicyMutation__
 *
 * To run a mutation, you first call `useUpdatePolicyMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePolicyMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePolicyMutation, { data, loading, error }] = useUpdatePolicyMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useUpdatePolicyMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePolicyMutation, UpdatePolicyMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePolicyMutation, UpdatePolicyMutationVariables>(UpdatePolicyDocument, options);
      }
export type UpdatePolicyMutationHookResult = ReturnType<typeof useUpdatePolicyMutation>;
export type UpdatePolicyMutationResult = Apollo.MutationResult<UpdatePolicyMutation>;
export type UpdatePolicyMutationOptions = Apollo.BaseMutationOptions<UpdatePolicyMutation, UpdatePolicyMutationVariables>;
export const ApproveDocument = gql`
    mutation Approve($id: Bytes32!, $signature: Bytes!) {
  approve(id: $id, signature: $signature) {
    id
    approvals {
      ...ApprovalFields
    }
    rejections {
      ...RejectionFields
    }
    transaction {
      ...TransactionFields
    }
  }
}
    ${ApprovalFieldsFragmentDoc}
${RejectionFieldsFragmentDoc}
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
export const ProposalDocument = gql`
    query Proposal($id: Bytes32!) {
  proposal(id: $id) {
    ...ProposalFields
  }
}
    ${ProposalFieldsFragmentDoc}`;

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
export const ProposalSubscriptionDocument = gql`
    subscription ProposalSubscription($accounts: [Address!], $proposals: [Bytes32!], $events: [ProposalEvent!]) {
  proposal(accounts: $accounts, proposals: $proposals, events: $events) {
    ...ProposalFields
  }
}
    ${ProposalFieldsFragmentDoc}`;

/**
 * __useProposalSubscriptionSubscription__
 *
 * To run a query within a React component, call `useProposalSubscriptionSubscription` and pass it any options that fit your needs.
 * When your component renders, `useProposalSubscriptionSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalSubscriptionSubscription({
 *   variables: {
 *      accounts: // value for 'accounts'
 *      proposals: // value for 'proposals'
 *      events: // value for 'events'
 *   },
 * });
 */
export function useProposalSubscriptionSubscription(baseOptions?: Apollo.SubscriptionHookOptions<ProposalSubscriptionSubscription, ProposalSubscriptionSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<ProposalSubscriptionSubscription, ProposalSubscriptionSubscriptionVariables>(ProposalSubscriptionDocument, options);
      }
export type ProposalSubscriptionSubscriptionHookResult = ReturnType<typeof useProposalSubscriptionSubscription>;
export type ProposalSubscriptionSubscriptionResult = Apollo.SubscriptionResult<ProposalSubscriptionSubscription>;
export const ProposalsDocument = gql`
    query Proposals($accounts: [Address!], $states: [ProposalState!], $take: Int, $cursor: ProposalWhereUniqueInput) {
  proposals(accounts: $accounts, states: $states, take: $take, cursor: $cursor) {
    ...ProposalFields
  }
}
    ${ProposalFieldsFragmentDoc}`;

/**
 * __useProposalsQuery__
 *
 * To run a query within a React component, call `useProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsQuery({
 *   variables: {
 *      accounts: // value for 'accounts'
 *      states: // value for 'states'
 *      take: // value for 'take'
 *      cursor: // value for 'cursor'
 *   },
 * });
 */
export function useProposalsQuery(baseOptions?: Apollo.QueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
      }
export function useProposalsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
        }
export type ProposalsQueryHookResult = ReturnType<typeof useProposalsQuery>;
export type ProposalsLazyQueryHookResult = ReturnType<typeof useProposalsLazyQuery>;
export type ProposalsQueryResult = Apollo.QueryResult<ProposalsQuery, ProposalsQueryVariables>;
export const ProposeDocument = gql`
    mutation Propose($account: Address!, $to: Address!, $value: Uint256, $data: Bytes, $nonce: Uint256, $gasLimit: Uint256) {
  propose(
    account: $account
    to: $to
    value: $value
    data: $data
    nonce: $nonce
    gasLimit: $gasLimit
  ) {
    ...ProposalFields
  }
}
    ${ProposalFieldsFragmentDoc}`;
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
 *      to: // value for 'to'
 *      value: // value for 'value'
 *      data: // value for 'data'
 *      nonce: // value for 'nonce'
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
export const RejectDocument = gql`
    mutation Reject($id: Bytes32!) {
  reject(id: $id) {
    id
    rejections {
      ...RejectionFields
    }
  }
}
    ${RejectionFieldsFragmentDoc}`;
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
export const RemoveProposalDocument = gql`
    mutation RemoveProposal($id: Bytes32!) {
  removeProposal(id: $id) {
    id
  }
}
    `;
export type RemoveProposalMutationFn = Apollo.MutationFunction<RemoveProposalMutation, RemoveProposalMutationVariables>;

/**
 * __useRemoveProposalMutation__
 *
 * To run a mutation, you first call `useRemoveProposalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveProposalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeProposalMutation, { data, loading, error }] = useRemoveProposalMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveProposalMutation(baseOptions?: Apollo.MutationHookOptions<RemoveProposalMutation, RemoveProposalMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveProposalMutation, RemoveProposalMutationVariables>(RemoveProposalDocument, options);
      }
export type RemoveProposalMutationHookResult = ReturnType<typeof useRemoveProposalMutation>;
export type RemoveProposalMutationResult = Apollo.MutationResult<RemoveProposalMutation>;
export type RemoveProposalMutationOptions = Apollo.BaseMutationOptions<RemoveProposalMutation, RemoveProposalMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($name: String, $pushToken: String) {
  updateUser(name: $name, pushToken: $pushToken) {
    id
    name
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      name: // value for 'name'
 *      pushToken: // value for 'pushToken'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UserDocument = gql`
    query User($id: Address) {
  user(id: $id) {
    id
    name
  }
}
    `;

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
export function useUserQuery(baseOptions?: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
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