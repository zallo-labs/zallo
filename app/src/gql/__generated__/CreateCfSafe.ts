/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ApproverInput } from "./apiGlobalTypes";

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
