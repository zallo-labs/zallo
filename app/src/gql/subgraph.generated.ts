/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetSubSafes
// ====================================================

export interface GetSubSafes_approver_groups_group_safe_groups_approvers {
  __typename: "GroupApprover";
  /**
   * {group.id}-{approver.id}
   */
  id: string;
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

//==============================================================
// START Enums and Input Objects
//==============================================================

//==============================================================
// END Enums and Input Objects
//==============================================================
