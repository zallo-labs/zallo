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
  name: string | null;
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
// GraphQL mutation operation: UpdateSafe
// ====================================================

export interface UpdateSafe_updateSafe_groups_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface UpdateSafe_updateSafe_groups {
  __typename: "Group";
  id: string;
  hash: string;
  approvers: UpdateSafe_updateSafe_groups_approvers[] | null;
}

export interface UpdateSafe_updateSafe {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string;
  groups: UpdateSafe_updateSafe_groups[] | null;
}

export interface UpdateSafe {
  updateSafe: UpdateSafe_updateSafe;
}

export interface UpdateSafeVariables {
  safe: string;
  data: SafeUpdateInput;
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
  name: string | null;
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
  name: string | null;
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

export enum QueryMode {
  default = "default",
  insensitive = "insensitive",
}

export interface ApproverCreateNestedOneWithoutGroupsInput {
  connect?: ApproverWhereUniqueInput | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutGroupsInput | null;
  create?: ApproverCreateWithoutGroupsInput | null;
}

export interface ApproverCreateOrConnectWithoutGroupsInput {
  create: ApproverCreateWithoutGroupsInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverCreateWithoutGroupsInput {
  id: string;
}

export interface ApproverInput {
  addr: string;
  weight: string;
}

export interface ApproverUpdateOneRequiredWithoutGroupsInput {
  connect?: ApproverWhereUniqueInput | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutGroupsInput | null;
  create?: ApproverCreateWithoutGroupsInput | null;
  update?: ApproverUpdateWithoutGroupsInput | null;
  upsert?: ApproverUpsertWithoutGroupsInput | null;
}

export interface ApproverUpdateWithoutGroupsInput {
  id?: StringFieldUpdateOperationsInput | null;
}

export interface ApproverUpsertWithoutGroupsInput {
  create: ApproverCreateWithoutGroupsInput;
  update: ApproverUpdateWithoutGroupsInput;
}

export interface ApproverWhereUniqueInput {
  id?: string | null;
}

export interface DecimalFieldUpdateOperationsInput {
  decrement?: any | null;
  divide?: any | null;
  increment?: any | null;
  multiply?: any | null;
  set?: any | null;
}

export interface DecimalFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDecimalFilter | null;
  notIn?: any[] | null;
}

export interface GroupApproverCreateManyGroupInput {
  approverId: string;
  id: string;
  weight: any;
}

export interface GroupApproverCreateManyGroupInputEnvelope {
  data: GroupApproverCreateManyGroupInput[];
  skipDuplicates?: boolean | null;
}

export interface GroupApproverCreateNestedManyWithoutGroupInput {
  connect?: GroupApproverWhereUniqueInput[] | null;
  connectOrCreate?: GroupApproverCreateOrConnectWithoutGroupInput[] | null;
  create?: GroupApproverCreateWithoutGroupInput[] | null;
  createMany?: GroupApproverCreateManyGroupInputEnvelope | null;
}

export interface GroupApproverCreateOrConnectWithoutGroupInput {
  create: GroupApproverCreateWithoutGroupInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverCreateWithoutGroupInput {
  approver: ApproverCreateNestedOneWithoutGroupsInput;
  id: string;
  weight: any;
}

export interface GroupApproverScalarWhereInput {
  AND?: GroupApproverScalarWhereInput[] | null;
  NOT?: GroupApproverScalarWhereInput[] | null;
  OR?: GroupApproverScalarWhereInput[] | null;
  approverId?: StringFilter | null;
  groupId?: StringFilter | null;
  id?: StringFilter | null;
  weight?: DecimalFilter | null;
}

export interface GroupApproverUpdateManyMutationInput {
  id?: StringFieldUpdateOperationsInput | null;
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface GroupApproverUpdateManyWithWhereWithoutGroupInput {
  data: GroupApproverUpdateManyMutationInput;
  where: GroupApproverScalarWhereInput;
}

export interface GroupApproverUpdateManyWithoutGroupInput {
  connect?: GroupApproverWhereUniqueInput[] | null;
  connectOrCreate?: GroupApproverCreateOrConnectWithoutGroupInput[] | null;
  create?: GroupApproverCreateWithoutGroupInput[] | null;
  createMany?: GroupApproverCreateManyGroupInputEnvelope | null;
  delete?: GroupApproverWhereUniqueInput[] | null;
  deleteMany?: GroupApproverScalarWhereInput[] | null;
  disconnect?: GroupApproverWhereUniqueInput[] | null;
  set?: GroupApproverWhereUniqueInput[] | null;
  update?: GroupApproverUpdateWithWhereUniqueWithoutGroupInput[] | null;
  updateMany?: GroupApproverUpdateManyWithWhereWithoutGroupInput[] | null;
  upsert?: GroupApproverUpsertWithWhereUniqueWithoutGroupInput[] | null;
}

export interface GroupApproverUpdateWithWhereUniqueWithoutGroupInput {
  data: GroupApproverUpdateWithoutGroupInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverUpdateWithoutGroupInput {
  approver?: ApproverUpdateOneRequiredWithoutGroupsInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface GroupApproverUpsertWithWhereUniqueWithoutGroupInput {
  create: GroupApproverCreateWithoutGroupInput;
  update: GroupApproverUpdateWithoutGroupInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverWhereUniqueInput {
  id?: string | null;
}

export interface GroupCreateManySafeInput {
  hash: string;
  id: string;
}

export interface GroupCreateManySafeInputEnvelope {
  data: GroupCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface GroupCreateOrConnectWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupCreateWithoutSafeInput {
  approvers?: GroupApproverCreateNestedManyWithoutGroupInput | null;
  hash: string;
  id: string;
}

export interface GroupScalarWhereInput {
  AND?: GroupScalarWhereInput[] | null;
  NOT?: GroupScalarWhereInput[] | null;
  OR?: GroupScalarWhereInput[] | null;
  hash?: StringFilter | null;
  id?: StringFilter | null;
  safeId?: StringFilter | null;
}

export interface GroupUpdateManyMutationInput {
  hash?: StringFieldUpdateOperationsInput | null;
  id?: StringFieldUpdateOperationsInput | null;
}

export interface GroupUpdateManyWithWhereWithoutSafeInput {
  data: GroupUpdateManyMutationInput;
  where: GroupScalarWhereInput;
}

export interface GroupUpdateManyWithoutSafeInput {
  connect?: GroupWhereUniqueInput[] | null;
  connectOrCreate?: GroupCreateOrConnectWithoutSafeInput[] | null;
  create?: GroupCreateWithoutSafeInput[] | null;
  createMany?: GroupCreateManySafeInputEnvelope | null;
  delete?: GroupWhereUniqueInput[] | null;
  deleteMany?: GroupScalarWhereInput[] | null;
  disconnect?: GroupWhereUniqueInput[] | null;
  set?: GroupWhereUniqueInput[] | null;
  update?: GroupUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: GroupUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: GroupUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface GroupUpdateWithWhereUniqueWithoutSafeInput {
  data: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupUpdateWithoutSafeInput {
  approvers?: GroupApproverUpdateManyWithoutGroupInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  id?: StringFieldUpdateOperationsInput | null;
}

export interface GroupUpsertWithWhereUniqueWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  update: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupWhereUniqueInput {
  id?: string | null;
}

export interface NestedDecimalFilter {
  equals?: any | null;
  gt?: any | null;
  gte?: any | null;
  in?: any[] | null;
  lt?: any | null;
  lte?: any | null;
  not?: NestedDecimalFilter | null;
  notIn?: any[] | null;
}

export interface NestedStringFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  not?: NestedStringFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

export interface NullableStringFieldUpdateOperationsInput {
  set?: string | null;
}

export interface SafeUpdateInput {
  deploySalt?: StringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
}

export interface StringFieldUpdateOperationsInput {
  set?: string | null;
}

export interface StringFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  mode?: QueryMode | null;
  not?: NestedStringFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
