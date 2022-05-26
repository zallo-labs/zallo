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
  safeId: string;
  approvers: CreateCfSafe_createCfSafe_groups_approvers[] | null;
  name: string | null;
}

export interface CreateCfSafe_createCfSafe {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
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
// GraphQL mutation operation: DeleteContact
// ====================================================

export interface DeleteContact_deleteContact {
  __typename: "DeleteContactResp";
  id: string;
}

export interface DeleteContact {
  deleteContact: DeleteContact_deleteContact;
}

export interface DeleteContactVariables {
  addr: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertContact
// ====================================================

export interface UpsertContact_upsertContact {
  __typename: "Contact";
  id: string;
  addr: string;
  name: string;
}

export interface UpsertContact {
  upsertContact: UpsertContact_upsertContact | null;
}

export interface UpsertContactVariables {
  prevAddr?: string | null;
  newAddr: string;
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertGroup
// ====================================================

export interface UpsertGroup_upsertGroup_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface UpsertGroup_upsertGroup {
  __typename: "Group";
  id: string;
  hash: string;
  safeId: string;
  approvers: UpsertGroup_upsertGroup_approvers[] | null;
  name: string | null;
}

export interface UpsertGroup {
  upsertGroup: UpsertGroup_upsertGroup | null;
}

export interface UpsertGroupVariables {
  where: GroupWhereUniqueInput;
  create: GroupCreateInput;
  update: GroupUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: UpsertSafe
// ====================================================

export interface UpsertSafe_upsertSafe_groups_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface UpsertSafe_upsertSafe_groups {
  __typename: "Group";
  id: string;
  hash: string;
  safeId: string;
  approvers: UpsertSafe_upsertSafe_groups_approvers[] | null;
  name: string | null;
}

export interface UpsertSafe_upsertSafe {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: UpsertSafe_upsertSafe_groups[] | null;
}

export interface UpsertSafe {
  upsertSafe: UpsertSafe_upsertSafe;
}

export interface UpsertSafeVariables {
  safe: string;
  create: SafeCreateInput;
  update: SafeUpdateInput;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetContacts
// ====================================================

export interface GetContacts_contacts {
  __typename: "Contact";
  id: string;
  addr: string;
  name: string;
}

export interface GetContacts {
  contacts: GetContacts_contacts[];
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
  safeId: string;
  approvers: GetApiSafes_approver_safes_groups_approvers[] | null;
  name: string | null;
}

export interface GetApiSafes_approver_safes {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: GetApiSafes_approver_safes_groups[] | null;
}

export interface GetApiSafes_approver {
  __typename: "Approver";
  id: string;
  safes: GetApiSafes_approver_safes[];
}

export interface GetApiSafes_safes_groups_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface GetApiSafes_safes_groups {
  __typename: "Group";
  id: string;
  hash: string;
  safeId: string;
  approvers: GetApiSafes_safes_groups_approvers[] | null;
  name: string | null;
}

export interface GetApiSafes_safes {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
  groups: GetApiSafes_safes_groups[] | null;
}

export interface GetApiSafes {
  approver: GetApiSafes_approver | null;
  safes: GetApiSafes_safes[];
}

export interface GetApiSafesVariables {
  approver: string;
  safes?: string[] | null;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ContactFields
// ====================================================

export interface ContactFields {
  __typename: "Contact";
  id: string;
  addr: string;
  name: string;
}

/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: GroupFields
// ====================================================

export interface GroupFields_approvers {
  __typename: "GroupApprover";
  approverId: string;
  weight: any;
}

export interface GroupFields {
  __typename: "Group";
  id: string;
  hash: string;
  safeId: string;
  approvers: GroupFields_approvers[] | null;
  name: string | null;
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
  safeId: string;
  approvers: SafeFields_groups_approvers[] | null;
  name: string | null;
}

export interface SafeFields {
  __typename: "Safe";
  id: string;
  name: string | null;
  deploySalt: string | null;
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
  contacts?: ContactCreateNestedManyWithoutApproverInput | null;
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
  contacts?: ContactUpdateManyWithoutApproverInput | null;
  id?: StringFieldUpdateOperationsInput | null;
}

export interface ApproverUpsertWithoutGroupsInput {
  create: ApproverCreateWithoutGroupsInput;
  update: ApproverUpdateWithoutGroupsInput;
}

export interface ApproverWhereUniqueInput {
  id?: string | null;
}

export interface ContactApproverIdAddrCompoundUniqueInput {
  addr: string;
  approverId: string;
}

export interface ContactCreateManyApproverInput {
  addr: string;
  name: string;
}

export interface ContactCreateManyApproverInputEnvelope {
  data: ContactCreateManyApproverInput[];
  skipDuplicates?: boolean | null;
}

export interface ContactCreateNestedManyWithoutApproverInput {
  connect?: ContactWhereUniqueInput[] | null;
  connectOrCreate?: ContactCreateOrConnectWithoutApproverInput[] | null;
  create?: ContactCreateWithoutApproverInput[] | null;
  createMany?: ContactCreateManyApproverInputEnvelope | null;
}

export interface ContactCreateOrConnectWithoutApproverInput {
  create: ContactCreateWithoutApproverInput;
  where: ContactWhereUniqueInput;
}

export interface ContactCreateWithoutApproverInput {
  addr: string;
  name: string;
}

export interface ContactName_identifierCompoundUniqueInput {
  approverId: string;
  name: string;
}

export interface ContactScalarWhereInput {
  AND?: ContactScalarWhereInput[] | null;
  NOT?: ContactScalarWhereInput[] | null;
  OR?: ContactScalarWhereInput[] | null;
  addr?: StringFilter | null;
  approverId?: StringFilter | null;
  name?: StringFilter | null;
}

export interface ContactUpdateManyMutationInput {
  addr?: StringFieldUpdateOperationsInput | null;
  name?: StringFieldUpdateOperationsInput | null;
}

export interface ContactUpdateManyWithWhereWithoutApproverInput {
  data: ContactUpdateManyMutationInput;
  where: ContactScalarWhereInput;
}

export interface ContactUpdateManyWithoutApproverInput {
  connect?: ContactWhereUniqueInput[] | null;
  connectOrCreate?: ContactCreateOrConnectWithoutApproverInput[] | null;
  create?: ContactCreateWithoutApproverInput[] | null;
  createMany?: ContactCreateManyApproverInputEnvelope | null;
  delete?: ContactWhereUniqueInput[] | null;
  deleteMany?: ContactScalarWhereInput[] | null;
  disconnect?: ContactWhereUniqueInput[] | null;
  set?: ContactWhereUniqueInput[] | null;
  update?: ContactUpdateWithWhereUniqueWithoutApproverInput[] | null;
  updateMany?: ContactUpdateManyWithWhereWithoutApproverInput[] | null;
  upsert?: ContactUpsertWithWhereUniqueWithoutApproverInput[] | null;
}

export interface ContactUpdateWithWhereUniqueWithoutApproverInput {
  data: ContactUpdateWithoutApproverInput;
  where: ContactWhereUniqueInput;
}

export interface ContactUpdateWithoutApproverInput {
  addr?: StringFieldUpdateOperationsInput | null;
  name?: StringFieldUpdateOperationsInput | null;
}

export interface ContactUpsertWithWhereUniqueWithoutApproverInput {
  create: ContactCreateWithoutApproverInput;
  update: ContactUpdateWithoutApproverInput;
  where: ContactWhereUniqueInput;
}

export interface ContactWhereUniqueInput {
  approverId_addr?: ContactApproverIdAddrCompoundUniqueInput | null;
  name_identifier?: ContactName_identifierCompoundUniqueInput | null;
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
  weight: any;
}

export interface GroupApproverSafeIdGroupHashApproverIdCompoundUniqueInput {
  approverId: string;
  groupHash: string;
  safeId: string;
}

export interface GroupApproverScalarWhereInput {
  AND?: GroupApproverScalarWhereInput[] | null;
  NOT?: GroupApproverScalarWhereInput[] | null;
  OR?: GroupApproverScalarWhereInput[] | null;
  approverId?: StringFilter | null;
  groupHash?: StringFilter | null;
  safeId?: StringFilter | null;
  weight?: DecimalFilter | null;
}

export interface GroupApproverUpdateManyMutationInput {
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
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface GroupApproverUpsertWithWhereUniqueWithoutGroupInput {
  create: GroupApproverCreateWithoutGroupInput;
  update: GroupApproverUpdateWithoutGroupInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverWhereUniqueInput {
  safeId_groupHash_approverId?: GroupApproverSafeIdGroupHashApproverIdCompoundUniqueInput | null;
}

export interface GroupCreateInput {
  approvers?: GroupApproverCreateNestedManyWithoutGroupInput | null;
  hash: string;
  name?: string | null;
  safe: SafeCreateNestedOneWithoutGroupsInput;
}

export interface GroupCreateManySafeInput {
  hash: string;
  name?: string | null;
}

export interface GroupCreateManySafeInputEnvelope {
  data: GroupCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface GroupCreateNestedManyWithoutSafeInput {
  connect?: GroupWhereUniqueInput[] | null;
  connectOrCreate?: GroupCreateOrConnectWithoutSafeInput[] | null;
  create?: GroupCreateWithoutSafeInput[] | null;
  createMany?: GroupCreateManySafeInputEnvelope | null;
}

export interface GroupCreateOrConnectWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupCreateWithoutSafeInput {
  approvers?: GroupApproverCreateNestedManyWithoutGroupInput | null;
  hash: string;
  name?: string | null;
}

export interface GroupSafeIdHashCompoundUniqueInput {
  hash: string;
  safeId: string;
}

export interface GroupScalarWhereInput {
  AND?: GroupScalarWhereInput[] | null;
  NOT?: GroupScalarWhereInput[] | null;
  OR?: GroupScalarWhereInput[] | null;
  hash?: StringFilter | null;
  name?: StringNullableFilter | null;
  safeId?: StringFilter | null;
}

export interface GroupUpdateInput {
  approvers?: GroupApproverUpdateManyWithoutGroupInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutGroupsInput | null;
}

export interface GroupUpdateManyMutationInput {
  hash?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
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
  name?: NullableStringFieldUpdateOperationsInput | null;
}

export interface GroupUpsertWithWhereUniqueWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  update: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupWhereUniqueInput {
  safeId_hash?: GroupSafeIdHashCompoundUniqueInput | null;
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

export interface NestedStringNullableFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  not?: NestedStringNullableFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

export interface NullableStringFieldUpdateOperationsInput {
  set?: string | null;
}

export interface SafeCreateInput {
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
}

export interface SafeCreateNestedOneWithoutGroupsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutGroupsInput | null;
  create?: SafeCreateWithoutGroupsInput | null;
}

export interface SafeCreateOrConnectWithoutGroupsInput {
  create: SafeCreateWithoutGroupsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateWithoutGroupsInput {
  deploySalt?: string | null;
  id: string;
  name?: string | null;
}

export interface SafeUpdateInput {
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
}

export interface SafeUpdateOneRequiredWithoutGroupsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutGroupsInput | null;
  create?: SafeCreateWithoutGroupsInput | null;
  update?: SafeUpdateWithoutGroupsInput | null;
  upsert?: SafeUpsertWithoutGroupsInput | null;
}

export interface SafeUpdateWithoutGroupsInput {
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
}

export interface SafeUpsertWithoutGroupsInput {
  create: SafeCreateWithoutGroupsInput;
  update: SafeUpdateWithoutGroupsInput;
}

export interface SafeWhereUniqueInput {
  id?: string | null;
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

export interface StringNullableFilter {
  contains?: string | null;
  endsWith?: string | null;
  equals?: string | null;
  gt?: string | null;
  gte?: string | null;
  in?: string[] | null;
  lt?: string | null;
  lte?: string | null;
  mode?: QueryMode | null;
  not?: NestedStringNullableFilter | null;
  notIn?: string[] | null;
  startsWith?: string | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
