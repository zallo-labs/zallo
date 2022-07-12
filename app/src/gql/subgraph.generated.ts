/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetTransfers
// ====================================================

export interface GetTransfers_transfers {
  __typename: "Transfer";
  /**
   * {tx.id}-{tx.log.index}
   */
  id: string;
  type: TransferType;
  token: any;
  from: any;
  to: any;
  value: any;
  blockHash: any;
  timestamp: any;
}

export interface GetTransfers {
  transfers: GetTransfers_transfers[];
}

export interface GetTransfersVariables {
  safe: string;
  txs: string[];
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SQueryTxs
// ====================================================

export interface SQueryTxs_txes_transfers {
  __typename: "Transfer";
  /**
   * {tx.id}-{tx.log.index}
   */
  id: string;
  type: TransferType;
  token: any;
  from: any;
  to: any;
  value: any;
  blockHash: any;
  timestamp: any;
}

export interface SQueryTxs_txes {
  __typename: "Tx";
  /**
   * {tx.hash}
   */
  id: string;
  hash: any;
  success: boolean;
  response: any;
  executor: any;
  blockHash: any;
  timestamp: any;
  transfers: SQueryTxs_txes_transfers[];
}

export interface SQueryTxs {
  txes: SQueryTxs_txes[];
}

export interface SQueryTxsVariables {
  safe: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SQuerySafes
// ====================================================

export interface SQuerySafes_user_approvers_approverSet_group_safe_groups_approverSets_approvers_user {
  __typename: "User";
  /**
   * {address}
   */
  id: string;
}

export interface SQuerySafes_user_approvers_approverSet_group_safe_groups_approverSets_approvers {
  __typename: "Approver";
  user: SQuerySafes_user_approvers_approverSet_group_safe_groups_approverSets_approvers_user;
  weight: any;
}

export interface SQuerySafes_user_approvers_approverSet_group_safe_groups_approverSets {
  __typename: "ApproverSet";
  /**
   * {group.id}-{blockHash}
   */
  id: string;
  blockHash: any;
  timestamp: any;
  approvers: SQuerySafes_user_approvers_approverSet_group_safe_groups_approverSets_approvers[];
}

export interface SQuerySafes_user_approvers_approverSet_group_safe_groups {
  __typename: "Group";
  /**
   * {safe.id}-{hash}
   */
  id: string;
  ref: any;
  active: boolean;
  approverSets: SQuerySafes_user_approvers_approverSet_group_safe_groups_approverSets[];
}

export interface SQuerySafes_user_approvers_approverSet_group_safe {
  __typename: "Safe";
  /**
   * {address}
   */
  id: string;
  groups: SQuerySafes_user_approvers_approverSet_group_safe_groups[];
}

export interface SQuerySafes_user_approvers_approverSet_group {
  __typename: "Group";
  safe: SQuerySafes_user_approvers_approverSet_group_safe;
}

export interface SQuerySafes_user_approvers_approverSet {
  __typename: "ApproverSet";
  group: SQuerySafes_user_approvers_approverSet_group;
}

export interface SQuerySafes_user_approvers {
  __typename: "Approver";
  approverSet: SQuerySafes_user_approvers_approverSet;
}

export interface SQuerySafes_user {
  __typename: "User";
  /**
   * {address}
   */
  id: string;
  approvers: SQuerySafes_user_approvers[];
}

export interface SQuerySafes {
  user: SQuerySafes_user | null;
}

export interface SQuerySafesVariables {
  user: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: TransferFields
// ====================================================

export interface TransferFields {
  __typename: "Transfer";
  /**
   * {tx.id}-{tx.log.index}
   */
  id: string;
  type: TransferType;
  token: any;
  from: any;
  to: any;
  value: any;
  blockHash: any;
  timestamp: any;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum TransferType {
  IN = "IN",
  OUT = "OUT",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
