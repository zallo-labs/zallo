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
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Account = {
  __typename?: 'Account';
  active: Scalars['Boolean'];
  /** {safe.id}-{hash} */
  id: Scalars['ID'];
  quorums: Array<Quorum>;
  ref: Scalars['Bytes'];
  safe: Safe;
};


export type AccountQuorumsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Quorum_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Quorum_Filter>;
};

export type Account_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  active?: InputMaybe<Scalars['Boolean']>;
  active_in?: InputMaybe<Array<Scalars['Boolean']>>;
  active_not?: InputMaybe<Scalars['Boolean']>;
  active_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  quorums_?: InputMaybe<Quorum_Filter>;
  ref?: InputMaybe<Scalars['Bytes']>;
  ref_contains?: InputMaybe<Scalars['Bytes']>;
  ref_in?: InputMaybe<Array<Scalars['Bytes']>>;
  ref_not?: InputMaybe<Scalars['Bytes']>;
  ref_not_contains?: InputMaybe<Scalars['Bytes']>;
  ref_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  safe?: InputMaybe<Scalars['String']>;
  safe_?: InputMaybe<Safe_Filter>;
  safe_contains?: InputMaybe<Scalars['String']>;
  safe_contains_nocase?: InputMaybe<Scalars['String']>;
  safe_ends_with?: InputMaybe<Scalars['String']>;
  safe_ends_with_nocase?: InputMaybe<Scalars['String']>;
  safe_gt?: InputMaybe<Scalars['String']>;
  safe_gte?: InputMaybe<Scalars['String']>;
  safe_in?: InputMaybe<Array<Scalars['String']>>;
  safe_lt?: InputMaybe<Scalars['String']>;
  safe_lte?: InputMaybe<Scalars['String']>;
  safe_not?: InputMaybe<Scalars['String']>;
  safe_not_contains?: InputMaybe<Scalars['String']>;
  safe_not_contains_nocase?: InputMaybe<Scalars['String']>;
  safe_not_ends_with?: InputMaybe<Scalars['String']>;
  safe_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  safe_not_in?: InputMaybe<Array<Scalars['String']>>;
  safe_not_starts_with?: InputMaybe<Scalars['String']>;
  safe_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  safe_starts_with?: InputMaybe<Scalars['String']>;
  safe_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Account_OrderBy {
  Active = 'active',
  Id = 'id',
  Quorums = 'quorums',
  Ref = 'ref',
  Safe = 'safe'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  quorum?: Maybe<Quorum>;
  quorums: Array<Quorum>;
  safe?: Maybe<Safe>;
  safeImpl?: Maybe<SafeImpl>;
  safeImpls: Array<SafeImpl>;
  safes: Array<Safe>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  tx?: Maybe<Tx>;
  txes: Array<Tx>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type QueryQuorumArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryQuorumsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Quorum_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Quorum_Filter>;
};


export type QuerySafeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySafeImplArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySafeImplsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SafeImpl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SafeImpl_Filter>;
};


export type QuerySafesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Safe_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Safe_Filter>;
};


export type QueryTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transfer_Filter>;
};


export type QueryTxArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTxesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Tx_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Tx_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Quorum = {
  __typename?: 'Quorum';
  account: Account;
  active: Scalars['Boolean'];
  approvers: Array<User>;
  blockHash: Scalars['Bytes'];
  hash: Scalars['Bytes'];
  /** {account.id}-{hash} */
  id: Scalars['ID'];
  timestamp: Scalars['BigInt'];
};


export type QuorumApproversArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<User_Filter>;
};

export type Quorum_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  active?: InputMaybe<Scalars['Boolean']>;
  active_in?: InputMaybe<Array<Scalars['Boolean']>>;
  active_not?: InputMaybe<Scalars['Boolean']>;
  active_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  approvers?: InputMaybe<Array<Scalars['String']>>;
  approvers_?: InputMaybe<User_Filter>;
  approvers_contains?: InputMaybe<Array<Scalars['String']>>;
  approvers_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  approvers_not?: InputMaybe<Array<Scalars['String']>>;
  approvers_not_contains?: InputMaybe<Array<Scalars['String']>>;
  approvers_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  hash?: InputMaybe<Scalars['Bytes']>;
  hash_contains?: InputMaybe<Scalars['Bytes']>;
  hash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  hash_not?: InputMaybe<Scalars['Bytes']>;
  hash_not_contains?: InputMaybe<Scalars['Bytes']>;
  hash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Quorum_OrderBy {
  Account = 'account',
  Active = 'active',
  Approvers = 'approvers',
  BlockHash = 'blockHash',
  Hash = 'hash',
  Id = 'id',
  Timestamp = 'timestamp'
}

export type Safe = {
  __typename?: 'Safe';
  accounts: Array<Account>;
  /** {address} */
  id: Scalars['ID'];
  impl: SafeImpl;
  transfers: Array<Transfer>;
  txs: Array<Tx>;
};


export type SafeAccountsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Account_Filter>;
};


export type SafeTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};


export type SafeTxsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Tx_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Tx_Filter>;
};

export type SafeImpl = {
  __typename?: 'SafeImpl';
  blockHash: Scalars['Bytes'];
  /** {address} */
  id: Scalars['ID'];
  proxies: Array<Safe>;
  timestamp: Scalars['BigInt'];
};


export type SafeImplProxiesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Safe_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Safe_Filter>;
};

export type SafeImpl_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  proxies_?: InputMaybe<Safe_Filter>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum SafeImpl_OrderBy {
  BlockHash = 'blockHash',
  Id = 'id',
  Proxies = 'proxies',
  Timestamp = 'timestamp'
}

export type Safe_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  accounts_?: InputMaybe<Account_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  impl?: InputMaybe<Scalars['String']>;
  impl_?: InputMaybe<SafeImpl_Filter>;
  impl_contains?: InputMaybe<Scalars['String']>;
  impl_contains_nocase?: InputMaybe<Scalars['String']>;
  impl_ends_with?: InputMaybe<Scalars['String']>;
  impl_ends_with_nocase?: InputMaybe<Scalars['String']>;
  impl_gt?: InputMaybe<Scalars['String']>;
  impl_gte?: InputMaybe<Scalars['String']>;
  impl_in?: InputMaybe<Array<Scalars['String']>>;
  impl_lt?: InputMaybe<Scalars['String']>;
  impl_lte?: InputMaybe<Scalars['String']>;
  impl_not?: InputMaybe<Scalars['String']>;
  impl_not_contains?: InputMaybe<Scalars['String']>;
  impl_not_contains_nocase?: InputMaybe<Scalars['String']>;
  impl_not_ends_with?: InputMaybe<Scalars['String']>;
  impl_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  impl_not_in?: InputMaybe<Array<Scalars['String']>>;
  impl_not_starts_with?: InputMaybe<Scalars['String']>;
  impl_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  impl_starts_with?: InputMaybe<Scalars['String']>;
  impl_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transfers_?: InputMaybe<Transfer_Filter>;
  txs_?: InputMaybe<Tx_Filter>;
};

export enum Safe_OrderBy {
  Accounts = 'accounts',
  Id = 'id',
  Impl = 'impl',
  Transfers = 'transfers',
  Txs = 'txs'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  quorum?: Maybe<Quorum>;
  quorums: Array<Quorum>;
  safe?: Maybe<Safe>;
  safeImpl?: Maybe<SafeImpl>;
  safeImpls: Array<SafeImpl>;
  safes: Array<Safe>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  tx?: Maybe<Tx>;
  txes: Array<Tx>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type SubscriptionQuorumArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionQuorumsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Quorum_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Quorum_Filter>;
};


export type SubscriptionSafeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionSafeImplArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionSafeImplsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SafeImpl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SafeImpl_Filter>;
};


export type SubscriptionSafesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Safe_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Safe_Filter>;
};


export type SubscriptionTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transfer_Filter>;
};


export type SubscriptionTxArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTxesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Tx_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Tx_Filter>;
};


export type SubscriptionUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Transfer = {
  __typename?: 'Transfer';
  blockHash: Scalars['Bytes'];
  from: Scalars['Bytes'];
  /** {tx.id}-{tx.log.index} */
  id: Scalars['ID'];
  safe: Safe;
  timestamp: Scalars['BigInt'];
  to: Scalars['Bytes'];
  token: Scalars['Bytes'];
  tx?: Maybe<Tx>;
  txHash: Scalars['Bytes'];
  type: TransferType;
  value: Scalars['BigInt'];
};

export enum TransferType {
  In = 'IN',
  Out = 'OUT'
}

export type Transfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  from?: InputMaybe<Scalars['Bytes']>;
  from_contains?: InputMaybe<Scalars['Bytes']>;
  from_in?: InputMaybe<Array<Scalars['Bytes']>>;
  from_not?: InputMaybe<Scalars['Bytes']>;
  from_not_contains?: InputMaybe<Scalars['Bytes']>;
  from_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  safe?: InputMaybe<Scalars['String']>;
  safe_?: InputMaybe<Safe_Filter>;
  safe_contains?: InputMaybe<Scalars['String']>;
  safe_contains_nocase?: InputMaybe<Scalars['String']>;
  safe_ends_with?: InputMaybe<Scalars['String']>;
  safe_ends_with_nocase?: InputMaybe<Scalars['String']>;
  safe_gt?: InputMaybe<Scalars['String']>;
  safe_gte?: InputMaybe<Scalars['String']>;
  safe_in?: InputMaybe<Array<Scalars['String']>>;
  safe_lt?: InputMaybe<Scalars['String']>;
  safe_lte?: InputMaybe<Scalars['String']>;
  safe_not?: InputMaybe<Scalars['String']>;
  safe_not_contains?: InputMaybe<Scalars['String']>;
  safe_not_contains_nocase?: InputMaybe<Scalars['String']>;
  safe_not_ends_with?: InputMaybe<Scalars['String']>;
  safe_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  safe_not_in?: InputMaybe<Array<Scalars['String']>>;
  safe_not_starts_with?: InputMaybe<Scalars['String']>;
  safe_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  safe_starts_with?: InputMaybe<Scalars['String']>;
  safe_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  to?: InputMaybe<Scalars['Bytes']>;
  to_contains?: InputMaybe<Scalars['Bytes']>;
  to_in?: InputMaybe<Array<Scalars['Bytes']>>;
  to_not?: InputMaybe<Scalars['Bytes']>;
  to_not_contains?: InputMaybe<Scalars['Bytes']>;
  to_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  token?: InputMaybe<Scalars['Bytes']>;
  token_contains?: InputMaybe<Scalars['Bytes']>;
  token_in?: InputMaybe<Array<Scalars['Bytes']>>;
  token_not?: InputMaybe<Scalars['Bytes']>;
  token_not_contains?: InputMaybe<Scalars['Bytes']>;
  token_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tx?: InputMaybe<Scalars['String']>;
  txHash?: InputMaybe<Scalars['Bytes']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  txHash_not?: InputMaybe<Scalars['Bytes']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tx_?: InputMaybe<Tx_Filter>;
  tx_contains?: InputMaybe<Scalars['String']>;
  tx_contains_nocase?: InputMaybe<Scalars['String']>;
  tx_ends_with?: InputMaybe<Scalars['String']>;
  tx_ends_with_nocase?: InputMaybe<Scalars['String']>;
  tx_gt?: InputMaybe<Scalars['String']>;
  tx_gte?: InputMaybe<Scalars['String']>;
  tx_in?: InputMaybe<Array<Scalars['String']>>;
  tx_lt?: InputMaybe<Scalars['String']>;
  tx_lte?: InputMaybe<Scalars['String']>;
  tx_not?: InputMaybe<Scalars['String']>;
  tx_not_contains?: InputMaybe<Scalars['String']>;
  tx_not_contains_nocase?: InputMaybe<Scalars['String']>;
  tx_not_ends_with?: InputMaybe<Scalars['String']>;
  tx_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  tx_not_in?: InputMaybe<Array<Scalars['String']>>;
  tx_not_starts_with?: InputMaybe<Scalars['String']>;
  tx_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tx_starts_with?: InputMaybe<Scalars['String']>;
  tx_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<TransferType>;
  type_in?: InputMaybe<Array<TransferType>>;
  type_not?: InputMaybe<TransferType>;
  type_not_in?: InputMaybe<Array<TransferType>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Transfer_OrderBy {
  BlockHash = 'blockHash',
  From = 'from',
  Id = 'id',
  Safe = 'safe',
  Timestamp = 'timestamp',
  To = 'to',
  Token = 'token',
  Tx = 'tx',
  TxHash = 'txHash',
  Type = 'type',
  Value = 'value'
}

export type Tx = {
  __typename?: 'Tx';
  blockHash: Scalars['Bytes'];
  executor: Scalars['Bytes'];
  hash: Scalars['Bytes'];
  /** {tx.hash} */
  id: Scalars['ID'];
  response: Scalars['Bytes'];
  safe: Safe;
  success: Scalars['Boolean'];
  timestamp: Scalars['BigInt'];
  transfers: Array<Transfer>;
};


export type TxTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};

export type Tx_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  executor?: InputMaybe<Scalars['Bytes']>;
  executor_contains?: InputMaybe<Scalars['Bytes']>;
  executor_in?: InputMaybe<Array<Scalars['Bytes']>>;
  executor_not?: InputMaybe<Scalars['Bytes']>;
  executor_not_contains?: InputMaybe<Scalars['Bytes']>;
  executor_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  hash?: InputMaybe<Scalars['Bytes']>;
  hash_contains?: InputMaybe<Scalars['Bytes']>;
  hash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  hash_not?: InputMaybe<Scalars['Bytes']>;
  hash_not_contains?: InputMaybe<Scalars['Bytes']>;
  hash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  response?: InputMaybe<Scalars['Bytes']>;
  response_contains?: InputMaybe<Scalars['Bytes']>;
  response_in?: InputMaybe<Array<Scalars['Bytes']>>;
  response_not?: InputMaybe<Scalars['Bytes']>;
  response_not_contains?: InputMaybe<Scalars['Bytes']>;
  response_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  safe?: InputMaybe<Scalars['String']>;
  safe_?: InputMaybe<Safe_Filter>;
  safe_contains?: InputMaybe<Scalars['String']>;
  safe_contains_nocase?: InputMaybe<Scalars['String']>;
  safe_ends_with?: InputMaybe<Scalars['String']>;
  safe_ends_with_nocase?: InputMaybe<Scalars['String']>;
  safe_gt?: InputMaybe<Scalars['String']>;
  safe_gte?: InputMaybe<Scalars['String']>;
  safe_in?: InputMaybe<Array<Scalars['String']>>;
  safe_lt?: InputMaybe<Scalars['String']>;
  safe_lte?: InputMaybe<Scalars['String']>;
  safe_not?: InputMaybe<Scalars['String']>;
  safe_not_contains?: InputMaybe<Scalars['String']>;
  safe_not_contains_nocase?: InputMaybe<Scalars['String']>;
  safe_not_ends_with?: InputMaybe<Scalars['String']>;
  safe_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  safe_not_in?: InputMaybe<Array<Scalars['String']>>;
  safe_not_starts_with?: InputMaybe<Scalars['String']>;
  safe_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  safe_starts_with?: InputMaybe<Scalars['String']>;
  safe_starts_with_nocase?: InputMaybe<Scalars['String']>;
  success?: InputMaybe<Scalars['Boolean']>;
  success_in?: InputMaybe<Array<Scalars['Boolean']>>;
  success_not?: InputMaybe<Scalars['Boolean']>;
  success_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transfers_?: InputMaybe<Transfer_Filter>;
};

export enum Tx_OrderBy {
  BlockHash = 'blockHash',
  Executor = 'executor',
  Hash = 'hash',
  Id = 'id',
  Response = 'response',
  Safe = 'safe',
  Success = 'success',
  Timestamp = 'timestamp',
  Transfers = 'transfers'
}

export type User = {
  __typename?: 'User';
  /** {address} */
  id: Scalars['ID'];
  quorums: Array<Quorum>;
};


export type UserQuorumsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Quorum_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Quorum_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  quorums_?: InputMaybe<Quorum_Filter>;
};

export enum User_OrderBy {
  Id = 'id',
  Quorums = 'quorums'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type UserAccountsQueryVariables = Exact<{
  user: Scalars['ID'];
}>;


export type UserAccountsQuery = { __typename?: 'Query', user?: { __typename?: 'User', quorums: Array<{ __typename?: 'Quorum', account: { __typename?: 'Account', id: string, ref: any, safe: { __typename?: 'Safe', id: string }, quorums: Array<{ __typename?: 'Quorum', id: string, hash: any, timestamp: any, approvers: Array<{ __typename?: 'User', id: string }> }> } }> } | null };

export type SafeQueryVariables = Exact<{
  safe: Scalars['ID'];
}>;


export type SafeQuery = { __typename?: 'Query', safe?: { __typename?: 'Safe', impl: { __typename?: 'SafeImpl', id: string } } | null };

export type TransferFieldsFragment = { __typename?: 'Transfer', id: string, type: TransferType, token: any, from: any, to: any, value: any, blockHash: any, timestamp: any };

export type TransfersQueryVariables = Exact<{
  safe: Scalars['String'];
  txs: Array<Scalars['String']> | Scalars['String'];
}>;


export type TransfersQuery = { __typename?: 'Query', transfers: Array<{ __typename?: 'Transfer', id: string, type: TransferType, token: any, from: any, to: any, value: any, blockHash: any, timestamp: any }> };

export type SubTxsQueryVariables = Exact<{
  safe: Scalars['String'];
}>;


export type SubTxsQuery = { __typename?: 'Query', txes: Array<{ __typename?: 'Tx', id: string, hash: any, success: boolean, response: any, executor: any, blockHash: any, timestamp: any, transfers: Array<{ __typename?: 'Transfer', id: string, type: TransferType, token: any, from: any, to: any, value: any, blockHash: any, timestamp: any }> }> };

export const TransferFieldsFragmentDoc = gql`
    fragment TransferFields on Transfer {
  id
  type
  token
  from
  to
  value
  blockHash
  timestamp
}
    `;
export const UserAccountsDocument = gql`
    query UserAccounts($user: ID!) {
  user(id: $user) {
    quorums(where: {active: true}) {
      account {
        id
        ref
        safe {
          id
        }
        quorums(where: {active: true}) {
          id
          hash
          approvers {
            id
          }
          timestamp
        }
      }
    }
  }
}
    `;

/**
 * __useUserAccountsQuery__
 *
 * To run a query within a React component, call `useUserAccountsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserAccountsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserAccountsQuery({
 *   variables: {
 *      user: // value for 'user'
 *   },
 * });
 */
export function useUserAccountsQuery(baseOptions: Apollo.QueryHookOptions<UserAccountsQuery, UserAccountsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserAccountsQuery, UserAccountsQueryVariables>(UserAccountsDocument, options);
      }
export function useUserAccountsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserAccountsQuery, UserAccountsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserAccountsQuery, UserAccountsQueryVariables>(UserAccountsDocument, options);
        }
export type UserAccountsQueryHookResult = ReturnType<typeof useUserAccountsQuery>;
export type UserAccountsLazyQueryHookResult = ReturnType<typeof useUserAccountsLazyQuery>;
export type UserAccountsQueryResult = Apollo.QueryResult<UserAccountsQuery, UserAccountsQueryVariables>;
export const SafeDocument = gql`
    query Safe($safe: ID!) {
  safe(id: $safe) {
    impl {
      id
    }
  }
}
    `;

/**
 * __useSafeQuery__
 *
 * To run a query within a React component, call `useSafeQuery` and pass it any options that fit your needs.
 * When your component renders, `useSafeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSafeQuery({
 *   variables: {
 *      safe: // value for 'safe'
 *   },
 * });
 */
export function useSafeQuery(baseOptions: Apollo.QueryHookOptions<SafeQuery, SafeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SafeQuery, SafeQueryVariables>(SafeDocument, options);
      }
export function useSafeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SafeQuery, SafeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SafeQuery, SafeQueryVariables>(SafeDocument, options);
        }
export type SafeQueryHookResult = ReturnType<typeof useSafeQuery>;
export type SafeLazyQueryHookResult = ReturnType<typeof useSafeLazyQuery>;
export type SafeQueryResult = Apollo.QueryResult<SafeQuery, SafeQueryVariables>;
export const TransfersDocument = gql`
    query Transfers($safe: String!, $txs: [String!]!) {
  transfers(where: {safe: $safe, tx_not_in: $txs}) {
    ...TransferFields
  }
}
    ${TransferFieldsFragmentDoc}`;

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
 *      safe: // value for 'safe'
 *      txs: // value for 'txs'
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
export const SubTxsDocument = gql`
    query SubTxs($safe: String!) {
  txes(where: {safe: $safe}) {
    id
    hash
    success
    response
    executor
    blockHash
    timestamp
    transfers {
      ...TransferFields
    }
  }
}
    ${TransferFieldsFragmentDoc}`;

/**
 * __useSubTxsQuery__
 *
 * To run a query within a React component, call `useSubTxsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSubTxsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSubTxsQuery({
 *   variables: {
 *      safe: // value for 'safe'
 *   },
 * });
 */
export function useSubTxsQuery(baseOptions: Apollo.QueryHookOptions<SubTxsQuery, SubTxsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SubTxsQuery, SubTxsQueryVariables>(SubTxsDocument, options);
      }
export function useSubTxsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SubTxsQuery, SubTxsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SubTxsQuery, SubTxsQueryVariables>(SubTxsDocument, options);
        }
export type SubTxsQueryHookResult = ReturnType<typeof useSubTxsQuery>;
export type SubTxsLazyQueryHookResult = ReturnType<typeof useSubTxsLazyQuery>;
export type SubTxsQueryResult = Apollo.QueryResult<SubTxsQuery, SubTxsQueryVariables>;