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
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Account = {
  __typename?: 'Account';
  /** {address} */
  id: Scalars['Bytes'];
  impl: AccountImpl;
  transfers: Array<Transfer>;
  txs: Array<Tx>;
  wallets: Array<Wallet>;
};


export type AccountTransfersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Transfer_Filter>;
};


export type AccountTxsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Tx_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Tx_Filter>;
};


export type AccountWalletsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Wallet_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Wallet_Filter>;
};

export type AccountImpl = {
  __typename?: 'AccountImpl';
  blockHash: Scalars['Bytes'];
  /** {address} */
  id: Scalars['Bytes'];
  proxies: Array<Account>;
  timestamp: Scalars['BigInt'];
};


export type AccountImplProxiesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Account_Filter>;
};

export type AccountImpl_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  proxies_?: InputMaybe<Account_Filter>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum AccountImpl_OrderBy {
  BlockHash = 'blockHash',
  Id = 'id',
  Proxies = 'proxies',
  Timestamp = 'timestamp'
}

export type Account_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  impl?: InputMaybe<Scalars['String']>;
  impl_?: InputMaybe<AccountImpl_Filter>;
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
  wallets_?: InputMaybe<Wallet_Filter>;
};

export enum Account_OrderBy {
  Id = 'id',
  Impl = 'impl',
  Transfers = 'transfers',
  Txs = 'txs',
  Wallets = 'wallets'
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
  accountImpl?: Maybe<AccountImpl>;
  accountImpls: Array<AccountImpl>;
  accounts: Array<Account>;
  quorum?: Maybe<Quorum>;
  quorumApprover?: Maybe<QuorumApprover>;
  quorumApprovers: Array<QuorumApprover>;
  quorums: Array<Quorum>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  tx?: Maybe<Tx>;
  txes: Array<Tx>;
  user?: Maybe<User>;
  users: Array<User>;
  wallet?: Maybe<Wallet>;
  wallets: Array<Wallet>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAccountImplArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAccountImplsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AccountImpl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AccountImpl_Filter>;
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


export type QueryQuorumApproverArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryQuorumApproversArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuorumApprover_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<QuorumApprover_Filter>;
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


export type QueryWalletArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryWalletsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Wallet_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Wallet_Filter>;
};

export type Quorum = {
  __typename?: 'Quorum';
  approvers: Array<QuorumApprover>;
  blockHash: Scalars['Bytes'];
  hash: Scalars['Bytes'];
  /** {wallet.id}-{hash} */
  id: Scalars['String'];
  timestamp: Scalars['BigInt'];
  wallet: Wallet;
};


export type QuorumApproversArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuorumApprover_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<QuorumApprover_Filter>;
};

export type QuorumApprover = {
  __typename?: 'QuorumApprover';
  approver: User;
  /** {quorum.id}-{approver.id} */
  id: Scalars['String'];
  quorum: Quorum;
};

export type QuorumApprover_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  approver?: InputMaybe<Scalars['String']>;
  approver_?: InputMaybe<User_Filter>;
  approver_contains?: InputMaybe<Scalars['String']>;
  approver_contains_nocase?: InputMaybe<Scalars['String']>;
  approver_ends_with?: InputMaybe<Scalars['String']>;
  approver_ends_with_nocase?: InputMaybe<Scalars['String']>;
  approver_gt?: InputMaybe<Scalars['String']>;
  approver_gte?: InputMaybe<Scalars['String']>;
  approver_in?: InputMaybe<Array<Scalars['String']>>;
  approver_lt?: InputMaybe<Scalars['String']>;
  approver_lte?: InputMaybe<Scalars['String']>;
  approver_not?: InputMaybe<Scalars['String']>;
  approver_not_contains?: InputMaybe<Scalars['String']>;
  approver_not_contains_nocase?: InputMaybe<Scalars['String']>;
  approver_not_ends_with?: InputMaybe<Scalars['String']>;
  approver_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  approver_not_in?: InputMaybe<Array<Scalars['String']>>;
  approver_not_starts_with?: InputMaybe<Scalars['String']>;
  approver_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  approver_starts_with?: InputMaybe<Scalars['String']>;
  approver_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  quorum?: InputMaybe<Scalars['String']>;
  quorum_?: InputMaybe<Quorum_Filter>;
  quorum_contains?: InputMaybe<Scalars['String']>;
  quorum_contains_nocase?: InputMaybe<Scalars['String']>;
  quorum_ends_with?: InputMaybe<Scalars['String']>;
  quorum_ends_with_nocase?: InputMaybe<Scalars['String']>;
  quorum_gt?: InputMaybe<Scalars['String']>;
  quorum_gte?: InputMaybe<Scalars['String']>;
  quorum_in?: InputMaybe<Array<Scalars['String']>>;
  quorum_lt?: InputMaybe<Scalars['String']>;
  quorum_lte?: InputMaybe<Scalars['String']>;
  quorum_not?: InputMaybe<Scalars['String']>;
  quorum_not_contains?: InputMaybe<Scalars['String']>;
  quorum_not_contains_nocase?: InputMaybe<Scalars['String']>;
  quorum_not_ends_with?: InputMaybe<Scalars['String']>;
  quorum_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  quorum_not_in?: InputMaybe<Array<Scalars['String']>>;
  quorum_not_starts_with?: InputMaybe<Scalars['String']>;
  quorum_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  quorum_starts_with?: InputMaybe<Scalars['String']>;
  quorum_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum QuorumApprover_OrderBy {
  Approver = 'approver',
  Id = 'id',
  Quorum = 'quorum'
}

export type Quorum_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  approvers_?: InputMaybe<QuorumApprover_Filter>;
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
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  wallet?: InputMaybe<Scalars['String']>;
  wallet_?: InputMaybe<Wallet_Filter>;
  wallet_contains?: InputMaybe<Scalars['String']>;
  wallet_contains_nocase?: InputMaybe<Scalars['String']>;
  wallet_ends_with?: InputMaybe<Scalars['String']>;
  wallet_ends_with_nocase?: InputMaybe<Scalars['String']>;
  wallet_gt?: InputMaybe<Scalars['String']>;
  wallet_gte?: InputMaybe<Scalars['String']>;
  wallet_in?: InputMaybe<Array<Scalars['String']>>;
  wallet_lt?: InputMaybe<Scalars['String']>;
  wallet_lte?: InputMaybe<Scalars['String']>;
  wallet_not?: InputMaybe<Scalars['String']>;
  wallet_not_contains?: InputMaybe<Scalars['String']>;
  wallet_not_contains_nocase?: InputMaybe<Scalars['String']>;
  wallet_not_ends_with?: InputMaybe<Scalars['String']>;
  wallet_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  wallet_not_in?: InputMaybe<Array<Scalars['String']>>;
  wallet_not_starts_with?: InputMaybe<Scalars['String']>;
  wallet_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  wallet_starts_with?: InputMaybe<Scalars['String']>;
  wallet_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum Quorum_OrderBy {
  Approvers = 'approvers',
  BlockHash = 'blockHash',
  Hash = 'hash',
  Id = 'id',
  Timestamp = 'timestamp',
  Wallet = 'wallet'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accountImpl?: Maybe<AccountImpl>;
  accountImpls: Array<AccountImpl>;
  accounts: Array<Account>;
  quorum?: Maybe<Quorum>;
  quorumApprover?: Maybe<QuorumApprover>;
  quorumApprovers: Array<QuorumApprover>;
  quorums: Array<Quorum>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  tx?: Maybe<Tx>;
  txes: Array<Tx>;
  user?: Maybe<User>;
  users: Array<User>;
  wallet?: Maybe<Wallet>;
  wallets: Array<Wallet>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAccountImplArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAccountImplsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AccountImpl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AccountImpl_Filter>;
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


export type SubscriptionQuorumApproverArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionQuorumApproversArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuorumApprover_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<QuorumApprover_Filter>;
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


export type SubscriptionWalletArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionWalletsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Wallet_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Wallet_Filter>;
};

export type Transfer = {
  __typename?: 'Transfer';
  account: Account;
  blockHash: Scalars['Bytes'];
  from: Scalars['Bytes'];
  /** {tx.id}-{tx.log.index} */
  id: Scalars['String'];
  timestamp: Scalars['BigInt'];
  to: Scalars['Bytes'];
  token: Scalars['Bytes'];
  transactionHash: Scalars['Bytes'];
  tx?: Maybe<Tx>;
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
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
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
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tx?: InputMaybe<Scalars['String']>;
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
  Account = 'account',
  BlockHash = 'blockHash',
  From = 'from',
  Id = 'id',
  Timestamp = 'timestamp',
  To = 'to',
  Token = 'token',
  TransactionHash = 'transactionHash',
  Tx = 'tx',
  Type = 'type',
  Value = 'value'
}

export type Tx = {
  __typename?: 'Tx';
  account: Account;
  blockHash: Scalars['Bytes'];
  executor: Scalars['Bytes'];
  hash: Scalars['Bytes'];
  /** {account.id}-{transaction.hash} */
  id: Scalars['String'];
  response: Scalars['Bytes'];
  success: Scalars['Boolean'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
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
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  response?: InputMaybe<Scalars['Bytes']>;
  response_contains?: InputMaybe<Scalars['Bytes']>;
  response_in?: InputMaybe<Array<Scalars['Bytes']>>;
  response_not?: InputMaybe<Scalars['Bytes']>;
  response_not_contains?: InputMaybe<Scalars['Bytes']>;
  response_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
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
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transfers_?: InputMaybe<Transfer_Filter>;
};

export enum Tx_OrderBy {
  Account = 'account',
  BlockHash = 'blockHash',
  Executor = 'executor',
  Hash = 'hash',
  Id = 'id',
  Response = 'response',
  Success = 'success',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  Transfers = 'transfers'
}

export type User = {
  __typename?: 'User';
  /** {address} */
  id: Scalars['Bytes'];
  quorums: Array<QuorumApprover>;
};


export type UserQuorumsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<QuorumApprover_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<QuorumApprover_Filter>;
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['Bytes']>;
  id_contains?: InputMaybe<Scalars['Bytes']>;
  id_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id_not?: InputMaybe<Scalars['Bytes']>;
  id_not_contains?: InputMaybe<Scalars['Bytes']>;
  id_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  quorums_?: InputMaybe<QuorumApprover_Filter>;
};

export enum User_OrderBy {
  Id = 'id',
  Quorums = 'quorums'
}

export type Wallet = {
  __typename?: 'Wallet';
  account: Account;
  active: Scalars['Boolean'];
  /** {account.id}-{ref} */
  id: Scalars['String'];
  quorums: Array<Quorum>;
  ref: Scalars['Bytes'];
};


export type WalletQuorumsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Quorum_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Quorum_Filter>;
};

export type Wallet_Filter = {
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
  id?: InputMaybe<Scalars['String']>;
  id_contains?: InputMaybe<Scalars['String']>;
  id_contains_nocase?: InputMaybe<Scalars['String']>;
  id_ends_with?: InputMaybe<Scalars['String']>;
  id_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_gt?: InputMaybe<Scalars['String']>;
  id_gte?: InputMaybe<Scalars['String']>;
  id_in?: InputMaybe<Array<Scalars['String']>>;
  id_lt?: InputMaybe<Scalars['String']>;
  id_lte?: InputMaybe<Scalars['String']>;
  id_not?: InputMaybe<Scalars['String']>;
  id_not_contains?: InputMaybe<Scalars['String']>;
  id_not_contains_nocase?: InputMaybe<Scalars['String']>;
  id_not_ends_with?: InputMaybe<Scalars['String']>;
  id_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  id_not_in?: InputMaybe<Array<Scalars['String']>>;
  id_not_starts_with?: InputMaybe<Scalars['String']>;
  id_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id_starts_with?: InputMaybe<Scalars['String']>;
  id_starts_with_nocase?: InputMaybe<Scalars['String']>;
  quorums?: InputMaybe<Array<Scalars['String']>>;
  quorums_?: InputMaybe<Quorum_Filter>;
  quorums_contains?: InputMaybe<Array<Scalars['String']>>;
  quorums_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  quorums_not?: InputMaybe<Array<Scalars['String']>>;
  quorums_not_contains?: InputMaybe<Array<Scalars['String']>>;
  quorums_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  ref?: InputMaybe<Scalars['Bytes']>;
  ref_contains?: InputMaybe<Scalars['Bytes']>;
  ref_in?: InputMaybe<Array<Scalars['Bytes']>>;
  ref_not?: InputMaybe<Scalars['Bytes']>;
  ref_not_contains?: InputMaybe<Scalars['Bytes']>;
  ref_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Wallet_OrderBy {
  Account = 'account',
  Active = 'active',
  Id = 'id',
  Quorums = 'quorums',
  Ref = 'ref'
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

export type TxResponseQueryVariables = Exact<{
  transactionHash: Scalars['ID'];
}>;


export type TxResponseQuery = { __typename?: 'Query', tx?: { __typename?: 'Tx', id: string, success: boolean, response: any, executor: any, blockHash: any, timestamp: any, transfers: Array<{ __typename?: 'Transfer', id: string, token: any, type: TransferType, from: any, to: any, value: any, blockHash: any, timestamp: any }> } | null };
