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
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubSafes
// ====================================================

export interface GetSubSafes_approver_groups_group_safe_groups_approvers_approver {
  __typename: "Approver";
  /**
   * {address}
   */
  id: string;
}

export interface GetSubSafes_approver_groups_group_safe_groups_approvers {
  __typename: "GroupApprover";
  approver: GetSubSafes_approver_groups_group_safe_groups_approvers_approver;
  weight: any;
}

export interface GetSubSafes_approver_groups_group_safe_groups {
  __typename: "Group";
  /**
   * {safe.id}-{hash}
   */
  id: string;
  hash: any;
  active: boolean;
  approvers: GetSubSafes_approver_groups_group_safe_groups_approvers[];
}

export interface GetSubSafes_approver_groups_group_safe {
  __typename: "Safe";
  /**
   * {address}
   */
  id: string;
  groups: GetSubSafes_approver_groups_group_safe_groups[];
}

export interface GetSubSafes_approver_groups_group {
  __typename: "Group";
  safe: GetSubSafes_approver_groups_group_safe;
}

export interface GetSubSafes_approver_groups {
  __typename: "GroupApprover";
  group: GetSubSafes_approver_groups_group;
}

export interface GetSubSafes_approver {
  __typename: "Approver";
  groups: GetSubSafes_approver_groups[];
}

export interface GetSubSafes {
  approver: GetSubSafes_approver | null;
}

export interface GetSubSafesVariables {
  approver: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubTxs
// ====================================================

export interface GetSubTxs_txes_transfers {
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

export interface GetSubTxs_txes {
  __typename: "Tx";
  /**
   * {tx.hash}
   */
  id: string;
  type: TxType;
  hash: any;
  responses: any[];
  executor: any;
  blockHash: any;
  timestamp: any;
  transfers: GetSubTxs_txes_transfers[];
}

export interface GetSubTxs {
  txes: GetSubTxs_txes[];
}

export interface GetSubTxsVariables {
  safe: string;
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

export enum TxType {
  MULTI = "MULTI",
  SINGLE = "SINGLE",
}

//==============================================================
// END Enums and Input Objects
//==============================================================
