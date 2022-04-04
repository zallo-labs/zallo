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
