/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSgSafes
// ====================================================

export interface GetSgSafes_approver_groups_group_safe_groups_approvers {
  __typename: "GroupApprover";
  id: string;
  weight: any;
}

export interface GetSgSafes_approver_groups_group_safe_groups {
  __typename: "Group";
  id: string;
  hash: any;
  active: boolean;
  approvers: GetSgSafes_approver_groups_group_safe_groups_approvers[];
}

export interface GetSgSafes_approver_groups_group_safe {
  __typename: "Safe";
  id: string;
  groups: GetSgSafes_approver_groups_group_safe_groups[];
}

export interface GetSgSafes_approver_groups_group {
  __typename: "Group";
  safe: GetSgSafes_approver_groups_group_safe;
}

export interface GetSgSafes_approver_groups {
  __typename: "GroupApprover";
  group: GetSgSafes_approver_groups_group;
}

export interface GetSgSafes_approver {
  __typename: "Approver";
  groups: GetSgSafes_approver_groups[];
}

export interface GetSgSafes {
  approver: GetSgSafes_approver | null;
}

export interface GetSgSafesVariables {
  approver: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
