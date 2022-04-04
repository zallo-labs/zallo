/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetApiSafes
// ====================================================

export interface GetApiSafes_approver_safes_groups_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface GetApiSafes_approver_safes_groups {
  __typename: "Group";
  id: string;
  hash: string;
  approvers: GetApiSafes_approver_safes_groups_approvers[] | null;
}

export interface GetApiSafes_approver_safes {
  __typename: "Safe";
  id: string;
  isCf: boolean;
  deploySalt: string;
  groups: GetApiSafes_approver_safes_groups[] | null;
}

export interface GetApiSafes_approver {
  __typename: "Approver";
  safes: GetApiSafes_approver_safes[];
}

export interface GetApiSafes {
  approver: GetApiSafes_approver | null;
}

export interface GetApiSafesVariables {
  approver: string;
}
