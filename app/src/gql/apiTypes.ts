/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CreateCfSafe
// ====================================================

export interface CreateCfSafe_createCfSafe_groups_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface CreateCfSafe_createCfSafe_groups {
  __typename: "Group";
  id: string;
  hash: string;
  approvers: CreateCfSafe_createCfSafe_groups_approvers[] | null;
}

export interface CreateCfSafe_createCfSafe {
  __typename: "Safe";
  id: string;
  isCf: boolean;
  deploySalt: string;
  groups: CreateCfSafe_createCfSafe_groups[] | null;
}

export interface CreateCfSafe {
  createCfSafe: CreateCfSafe_createCfSafe;
}

export interface CreateCfSafeVariables {
  approvers: ApproverInput[];
}

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

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: SafeFields
// ====================================================

export interface SafeFields_groups_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface SafeFields_groups {
  __typename: "Group";
  id: string;
  hash: string;
  approvers: SafeFields_groups_approvers[] | null;
}

export interface SafeFields {
  __typename: "Safe";
  id: string;
  isCf: boolean;
  deploySalt: string;
  groups: SafeFields_groups[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export interface ApproverInput {
  addr: string;
  weight: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
