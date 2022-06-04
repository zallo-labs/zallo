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
  addr: any;
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
  prevAddr?: any | null;
  newAddr: any;
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
// GraphQL query operation: GetContractMethod
// ====================================================

export interface GetContractMethod_contractMethod {
  __typename: "ContractMethod";
  id: string;
  fragment: any;
}

export interface GetContractMethod {
  contractMethod: GetContractMethod_contractMethod | null;
}

export interface GetContractMethodVariables {
  contract: any;
  sighash: any;
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

export interface ApprovalCreateManyApproverInput {
  safeId: string;
  signature: string;
  txHash: string;
}

export interface ApprovalCreateManyApproverInputEnvelope {
  data: ApprovalCreateManyApproverInput[];
  skipDuplicates?: boolean | null;
}

export interface ApprovalCreateManySafeInput {
  approverId: string;
  signature: string;
  txHash: string;
}

export interface ApprovalCreateManySafeInputEnvelope {
  data: ApprovalCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface ApprovalCreateManyTxInput {
  approverId: string;
  signature: string;
}

export interface ApprovalCreateManyTxInputEnvelope {
  data: ApprovalCreateManyTxInput[];
  skipDuplicates?: boolean | null;
}

export interface ApprovalCreateNestedManyWithoutApproverInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutApproverInput[] | null;
  create?: ApprovalCreateWithoutApproverInput[] | null;
  createMany?: ApprovalCreateManyApproverInputEnvelope | null;
}

export interface ApprovalCreateNestedManyWithoutSafeInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutSafeInput[] | null;
  create?: ApprovalCreateWithoutSafeInput[] | null;
  createMany?: ApprovalCreateManySafeInputEnvelope | null;
}

export interface ApprovalCreateNestedManyWithoutTxInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutTxInput[] | null;
  create?: ApprovalCreateWithoutTxInput[] | null;
  createMany?: ApprovalCreateManyTxInputEnvelope | null;
}

export interface ApprovalCreateOrConnectWithoutApproverInput {
  create: ApprovalCreateWithoutApproverInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalCreateOrConnectWithoutSafeInput {
  create: ApprovalCreateWithoutSafeInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalCreateOrConnectWithoutTxInput {
  create: ApprovalCreateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalCreateWithoutApproverInput {
  safe: SafeCreateNestedOneWithoutApprovalsInput;
  signature: string;
  tx: TxCreateNestedOneWithoutApprovalsInput;
}

export interface ApprovalCreateWithoutSafeInput {
  approver: ApproverCreateNestedOneWithoutApprovalsInput;
  signature: string;
  tx: TxCreateNestedOneWithoutApprovalsInput;
}

export interface ApprovalCreateWithoutTxInput {
  approver: ApproverCreateNestedOneWithoutApprovalsInput;
  safe: SafeCreateNestedOneWithoutApprovalsInput;
  signature: string;
}

export interface ApprovalSafeIdTxHashApproverIdCompoundUniqueInput {
  approverId: string;
  safeId: string;
  txHash: string;
}

export interface ApprovalScalarWhereInput {
  AND?: ApprovalScalarWhereInput[] | null;
  NOT?: ApprovalScalarWhereInput[] | null;
  OR?: ApprovalScalarWhereInput[] | null;
  approverId?: StringFilter | null;
  safeId?: StringFilter | null;
  signature?: StringFilter | null;
  txHash?: StringFilter | null;
}

export interface ApprovalUpdateManyMutationInput {
  signature?: StringFieldUpdateOperationsInput | null;
}

export interface ApprovalUpdateManyWithWhereWithoutApproverInput {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
}

export interface ApprovalUpdateManyWithWhereWithoutSafeInput {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
}

export interface ApprovalUpdateManyWithWhereWithoutTxInput {
  data: ApprovalUpdateManyMutationInput;
  where: ApprovalScalarWhereInput;
}

export interface ApprovalUpdateManyWithoutApproverInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutApproverInput[] | null;
  create?: ApprovalCreateWithoutApproverInput[] | null;
  createMany?: ApprovalCreateManyApproverInputEnvelope | null;
  delete?: ApprovalWhereUniqueInput[] | null;
  deleteMany?: ApprovalScalarWhereInput[] | null;
  disconnect?: ApprovalWhereUniqueInput[] | null;
  set?: ApprovalWhereUniqueInput[] | null;
  update?: ApprovalUpdateWithWhereUniqueWithoutApproverInput[] | null;
  updateMany?: ApprovalUpdateManyWithWhereWithoutApproverInput[] | null;
  upsert?: ApprovalUpsertWithWhereUniqueWithoutApproverInput[] | null;
}

export interface ApprovalUpdateManyWithoutSafeInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutSafeInput[] | null;
  create?: ApprovalCreateWithoutSafeInput[] | null;
  createMany?: ApprovalCreateManySafeInputEnvelope | null;
  delete?: ApprovalWhereUniqueInput[] | null;
  deleteMany?: ApprovalScalarWhereInput[] | null;
  disconnect?: ApprovalWhereUniqueInput[] | null;
  set?: ApprovalWhereUniqueInput[] | null;
  update?: ApprovalUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: ApprovalUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: ApprovalUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface ApprovalUpdateManyWithoutTxInput {
  connect?: ApprovalWhereUniqueInput[] | null;
  connectOrCreate?: ApprovalCreateOrConnectWithoutTxInput[] | null;
  create?: ApprovalCreateWithoutTxInput[] | null;
  createMany?: ApprovalCreateManyTxInputEnvelope | null;
  delete?: ApprovalWhereUniqueInput[] | null;
  deleteMany?: ApprovalScalarWhereInput[] | null;
  disconnect?: ApprovalWhereUniqueInput[] | null;
  set?: ApprovalWhereUniqueInput[] | null;
  update?: ApprovalUpdateWithWhereUniqueWithoutTxInput[] | null;
  updateMany?: ApprovalUpdateManyWithWhereWithoutTxInput[] | null;
  upsert?: ApprovalUpsertWithWhereUniqueWithoutTxInput[] | null;
}

export interface ApprovalUpdateWithWhereUniqueWithoutApproverInput {
  data: ApprovalUpdateWithoutApproverInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpdateWithWhereUniqueWithoutSafeInput {
  data: ApprovalUpdateWithoutSafeInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpdateWithWhereUniqueWithoutTxInput {
  data: ApprovalUpdateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpdateWithoutApproverInput {
  safe?: SafeUpdateOneRequiredWithoutApprovalsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
  tx?: TxUpdateOneRequiredWithoutApprovalsInput | null;
}

export interface ApprovalUpdateWithoutSafeInput {
  approver?: ApproverUpdateOneRequiredWithoutApprovalsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
  tx?: TxUpdateOneRequiredWithoutApprovalsInput | null;
}

export interface ApprovalUpdateWithoutTxInput {
  approver?: ApproverUpdateOneRequiredWithoutApprovalsInput | null;
  safe?: SafeUpdateOneRequiredWithoutApprovalsInput | null;
  signature?: StringFieldUpdateOperationsInput | null;
}

export interface ApprovalUpsertWithWhereUniqueWithoutApproverInput {
  create: ApprovalCreateWithoutApproverInput;
  update: ApprovalUpdateWithoutApproverInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpsertWithWhereUniqueWithoutSafeInput {
  create: ApprovalCreateWithoutSafeInput;
  update: ApprovalUpdateWithoutSafeInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalUpsertWithWhereUniqueWithoutTxInput {
  create: ApprovalCreateWithoutTxInput;
  update: ApprovalUpdateWithoutTxInput;
  where: ApprovalWhereUniqueInput;
}

export interface ApprovalWhereUniqueInput {
  safeId_txHash_approverId?: ApprovalSafeIdTxHashApproverIdCompoundUniqueInput | null;
}

export interface ApproverCreateNestedOneWithoutApprovalsInput {
  connect?: ApproverWhereUniqueInput | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutApprovalsInput | null;
  create?: ApproverCreateWithoutApprovalsInput | null;
}

export interface ApproverCreateNestedOneWithoutGroupsInput {
  connect?: ApproverWhereUniqueInput | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutGroupsInput | null;
  create?: ApproverCreateWithoutGroupsInput | null;
}

export interface ApproverCreateOrConnectWithoutApprovalsInput {
  create: ApproverCreateWithoutApprovalsInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverCreateOrConnectWithoutGroupsInput {
  create: ApproverCreateWithoutGroupsInput;
  where: ApproverWhereUniqueInput;
}

export interface ApproverCreateWithoutApprovalsInput {
  contacts?: ContactCreateNestedManyWithoutApproverInput | null;
  groups?: GroupApproverCreateNestedManyWithoutApproverInput | null;
  id: string;
}

export interface ApproverCreateWithoutGroupsInput {
  approvals?: ApprovalCreateNestedManyWithoutApproverInput | null;
  contacts?: ContactCreateNestedManyWithoutApproverInput | null;
  id: string;
}

export interface ApproverInput {
  addr: string;
  weight: string;
}

export interface ApproverUpdateOneRequiredWithoutApprovalsInput {
  connect?: ApproverWhereUniqueInput | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutApprovalsInput | null;
  create?: ApproverCreateWithoutApprovalsInput | null;
  update?: ApproverUpdateWithoutApprovalsInput | null;
  upsert?: ApproverUpsertWithoutApprovalsInput | null;
}

export interface ApproverUpdateOneRequiredWithoutGroupsInput {
  connect?: ApproverWhereUniqueInput | null;
  connectOrCreate?: ApproverCreateOrConnectWithoutGroupsInput | null;
  create?: ApproverCreateWithoutGroupsInput | null;
  update?: ApproverUpdateWithoutGroupsInput | null;
  upsert?: ApproverUpsertWithoutGroupsInput | null;
}

export interface ApproverUpdateWithoutApprovalsInput {
  contacts?: ContactUpdateManyWithoutApproverInput | null;
  groups?: GroupApproverUpdateManyWithoutApproverInput | null;
  id?: StringFieldUpdateOperationsInput | null;
}

export interface ApproverUpdateWithoutGroupsInput {
  approvals?: ApprovalUpdateManyWithoutApproverInput | null;
  contacts?: ContactUpdateManyWithoutApproverInput | null;
  id?: StringFieldUpdateOperationsInput | null;
}

export interface ApproverUpsertWithoutApprovalsInput {
  create: ApproverCreateWithoutApprovalsInput;
  update: ApproverUpdateWithoutApprovalsInput;
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

export interface GroupApproverCreateManyApproverInput {
  groupHash: string;
  safeId: string;
  weight: any;
}

export interface GroupApproverCreateManyApproverInputEnvelope {
  data: GroupApproverCreateManyApproverInput[];
  skipDuplicates?: boolean | null;
}

export interface GroupApproverCreateManyGroupInput {
  approverId: string;
  weight: any;
}

export interface GroupApproverCreateManyGroupInputEnvelope {
  data: GroupApproverCreateManyGroupInput[];
  skipDuplicates?: boolean | null;
}

export interface GroupApproverCreateNestedManyWithoutApproverInput {
  connect?: GroupApproverWhereUniqueInput[] | null;
  connectOrCreate?: GroupApproverCreateOrConnectWithoutApproverInput[] | null;
  create?: GroupApproverCreateWithoutApproverInput[] | null;
  createMany?: GroupApproverCreateManyApproverInputEnvelope | null;
}

export interface GroupApproverCreateNestedManyWithoutGroupInput {
  connect?: GroupApproverWhereUniqueInput[] | null;
  connectOrCreate?: GroupApproverCreateOrConnectWithoutGroupInput[] | null;
  create?: GroupApproverCreateWithoutGroupInput[] | null;
  createMany?: GroupApproverCreateManyGroupInputEnvelope | null;
}

export interface GroupApproverCreateOrConnectWithoutApproverInput {
  create: GroupApproverCreateWithoutApproverInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverCreateOrConnectWithoutGroupInput {
  create: GroupApproverCreateWithoutGroupInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverCreateWithoutApproverInput {
  group: GroupCreateNestedOneWithoutApproversInput;
  weight: any;
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

export interface GroupApproverUpdateManyWithWhereWithoutApproverInput {
  data: GroupApproverUpdateManyMutationInput;
  where: GroupApproverScalarWhereInput;
}

export interface GroupApproverUpdateManyWithWhereWithoutGroupInput {
  data: GroupApproverUpdateManyMutationInput;
  where: GroupApproverScalarWhereInput;
}

export interface GroupApproverUpdateManyWithoutApproverInput {
  connect?: GroupApproverWhereUniqueInput[] | null;
  connectOrCreate?: GroupApproverCreateOrConnectWithoutApproverInput[] | null;
  create?: GroupApproverCreateWithoutApproverInput[] | null;
  createMany?: GroupApproverCreateManyApproverInputEnvelope | null;
  delete?: GroupApproverWhereUniqueInput[] | null;
  deleteMany?: GroupApproverScalarWhereInput[] | null;
  disconnect?: GroupApproverWhereUniqueInput[] | null;
  set?: GroupApproverWhereUniqueInput[] | null;
  update?: GroupApproverUpdateWithWhereUniqueWithoutApproverInput[] | null;
  updateMany?: GroupApproverUpdateManyWithWhereWithoutApproverInput[] | null;
  upsert?: GroupApproverUpsertWithWhereUniqueWithoutApproverInput[] | null;
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

export interface GroupApproverUpdateWithWhereUniqueWithoutApproverInput {
  data: GroupApproverUpdateWithoutApproverInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverUpdateWithWhereUniqueWithoutGroupInput {
  data: GroupApproverUpdateWithoutGroupInput;
  where: GroupApproverWhereUniqueInput;
}

export interface GroupApproverUpdateWithoutApproverInput {
  group?: GroupUpdateOneRequiredWithoutApproversInput | null;
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface GroupApproverUpdateWithoutGroupInput {
  approver?: ApproverUpdateOneRequiredWithoutGroupsInput | null;
  weight?: DecimalFieldUpdateOperationsInput | null;
}

export interface GroupApproverUpsertWithWhereUniqueWithoutApproverInput {
  create: GroupApproverCreateWithoutApproverInput;
  update: GroupApproverUpdateWithoutApproverInput;
  where: GroupApproverWhereUniqueInput;
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

export interface GroupCreateNestedOneWithoutApproversInput {
  connect?: GroupWhereUniqueInput | null;
  connectOrCreate?: GroupCreateOrConnectWithoutApproversInput | null;
  create?: GroupCreateWithoutApproversInput | null;
}

export interface GroupCreateOrConnectWithoutApproversInput {
  create: GroupCreateWithoutApproversInput;
  where: GroupWhereUniqueInput;
}

export interface GroupCreateOrConnectWithoutSafeInput {
  create: GroupCreateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupCreateWithoutApproversInput {
  hash: string;
  name?: string | null;
  safe: SafeCreateNestedOneWithoutGroupsInput;
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

export interface GroupUpdateOneRequiredWithoutApproversInput {
  connect?: GroupWhereUniqueInput | null;
  connectOrCreate?: GroupCreateOrConnectWithoutApproversInput | null;
  create?: GroupCreateWithoutApproversInput | null;
  update?: GroupUpdateWithoutApproversInput | null;
  upsert?: GroupUpsertWithoutApproversInput | null;
}

export interface GroupUpdateWithWhereUniqueWithoutSafeInput {
  data: GroupUpdateWithoutSafeInput;
  where: GroupWhereUniqueInput;
}

export interface GroupUpdateWithoutApproversInput {
  hash?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutGroupsInput | null;
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

export interface GroupUpsertWithoutApproversInput {
  create: GroupCreateWithoutApproversInput;
  update: GroupUpdateWithoutApproversInput;
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

export interface OpCreateManySafeInput {
  data: string;
  hash: string;
  nonce: any;
  to: string;
  txHash: string;
  value: any;
}

export interface OpCreateManySafeInputEnvelope {
  data: OpCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface OpCreateManyTxInput {
  data: string;
  hash: string;
  nonce: any;
  to: string;
  value: any;
}

export interface OpCreateManyTxInputEnvelope {
  data: OpCreateManyTxInput[];
  skipDuplicates?: boolean | null;
}

export interface OpCreateNestedManyWithoutSafeInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutSafeInput[] | null;
  create?: OpCreateWithoutSafeInput[] | null;
  createMany?: OpCreateManySafeInputEnvelope | null;
}

export interface OpCreateNestedManyWithoutTxInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutTxInput[] | null;
  create?: OpCreateWithoutTxInput[] | null;
  createMany?: OpCreateManyTxInputEnvelope | null;
}

export interface OpCreateOrConnectWithoutSafeInput {
  create: OpCreateWithoutSafeInput;
  where: OpWhereUniqueInput;
}

export interface OpCreateOrConnectWithoutTxInput {
  create: OpCreateWithoutTxInput;
  where: OpWhereUniqueInput;
}

export interface OpCreateWithoutSafeInput {
  data: string;
  hash: string;
  nonce: any;
  to: string;
  tx: TxCreateNestedOneWithoutOpsInput;
  value: any;
}

export interface OpCreateWithoutTxInput {
  data: string;
  hash: string;
  nonce: any;
  safe: SafeCreateNestedOneWithoutOpsInput;
  to: string;
  value: any;
}

export interface OpSafeIdTxHashHashCompoundUniqueInput {
  hash: string;
  safeId: string;
  txHash: string;
}

export interface OpScalarWhereInput {
  AND?: OpScalarWhereInput[] | null;
  NOT?: OpScalarWhereInput[] | null;
  OR?: OpScalarWhereInput[] | null;
  data?: StringFilter | null;
  hash?: StringFilter | null;
  nonce?: DecimalFilter | null;
  safeId?: StringFilter | null;
  to?: StringFilter | null;
  txHash?: StringFilter | null;
  value?: DecimalFilter | null;
}

export interface OpUpdateManyMutationInput {
  data?: StringFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: DecimalFieldUpdateOperationsInput | null;
  to?: StringFieldUpdateOperationsInput | null;
  value?: DecimalFieldUpdateOperationsInput | null;
}

export interface OpUpdateManyWithWhereWithoutSafeInput {
  data: OpUpdateManyMutationInput;
  where: OpScalarWhereInput;
}

export interface OpUpdateManyWithWhereWithoutTxInput {
  data: OpUpdateManyMutationInput;
  where: OpScalarWhereInput;
}

export interface OpUpdateManyWithoutSafeInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutSafeInput[] | null;
  create?: OpCreateWithoutSafeInput[] | null;
  createMany?: OpCreateManySafeInputEnvelope | null;
  delete?: OpWhereUniqueInput[] | null;
  deleteMany?: OpScalarWhereInput[] | null;
  disconnect?: OpWhereUniqueInput[] | null;
  set?: OpWhereUniqueInput[] | null;
  update?: OpUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: OpUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: OpUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface OpUpdateManyWithoutTxInput {
  connect?: OpWhereUniqueInput[] | null;
  connectOrCreate?: OpCreateOrConnectWithoutTxInput[] | null;
  create?: OpCreateWithoutTxInput[] | null;
  createMany?: OpCreateManyTxInputEnvelope | null;
  delete?: OpWhereUniqueInput[] | null;
  deleteMany?: OpScalarWhereInput[] | null;
  disconnect?: OpWhereUniqueInput[] | null;
  set?: OpWhereUniqueInput[] | null;
  update?: OpUpdateWithWhereUniqueWithoutTxInput[] | null;
  updateMany?: OpUpdateManyWithWhereWithoutTxInput[] | null;
  upsert?: OpUpsertWithWhereUniqueWithoutTxInput[] | null;
}

export interface OpUpdateWithWhereUniqueWithoutSafeInput {
  data: OpUpdateWithoutSafeInput;
  where: OpWhereUniqueInput;
}

export interface OpUpdateWithWhereUniqueWithoutTxInput {
  data: OpUpdateWithoutTxInput;
  where: OpWhereUniqueInput;
}

export interface OpUpdateWithoutSafeInput {
  data?: StringFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: DecimalFieldUpdateOperationsInput | null;
  to?: StringFieldUpdateOperationsInput | null;
  tx?: TxUpdateOneRequiredWithoutOpsInput | null;
  value?: DecimalFieldUpdateOperationsInput | null;
}

export interface OpUpdateWithoutTxInput {
  data?: StringFieldUpdateOperationsInput | null;
  hash?: StringFieldUpdateOperationsInput | null;
  nonce?: DecimalFieldUpdateOperationsInput | null;
  safe?: SafeUpdateOneRequiredWithoutOpsInput | null;
  to?: StringFieldUpdateOperationsInput | null;
  value?: DecimalFieldUpdateOperationsInput | null;
}

export interface OpUpsertWithWhereUniqueWithoutSafeInput {
  create: OpCreateWithoutSafeInput;
  update: OpUpdateWithoutSafeInput;
  where: OpWhereUniqueInput;
}

export interface OpUpsertWithWhereUniqueWithoutTxInput {
  create: OpCreateWithoutTxInput;
  update: OpUpdateWithoutTxInput;
  where: OpWhereUniqueInput;
}

export interface OpWhereUniqueInput {
  safeId_txHash_hash?: OpSafeIdTxHashHashCompoundUniqueInput | null;
}

export interface SafeCreateInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateNestedOneWithoutApprovalsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutApprovalsInput | null;
  create?: SafeCreateWithoutApprovalsInput | null;
}

export interface SafeCreateNestedOneWithoutGroupsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutGroupsInput | null;
  create?: SafeCreateWithoutGroupsInput | null;
}

export interface SafeCreateNestedOneWithoutOpsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutOpsInput | null;
  create?: SafeCreateWithoutOpsInput | null;
}

export interface SafeCreateNestedOneWithoutTxsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutTxsInput | null;
  create?: SafeCreateWithoutTxsInput | null;
}

export interface SafeCreateOrConnectWithoutApprovalsInput {
  create: SafeCreateWithoutApprovalsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutGroupsInput {
  create: SafeCreateWithoutGroupsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutOpsInput {
  create: SafeCreateWithoutOpsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateOrConnectWithoutTxsInput {
  create: SafeCreateWithoutTxsInput;
  where: SafeWhereUniqueInput;
}

export interface SafeCreateWithoutApprovalsInput {
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutGroupsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutOpsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  txs?: TxCreateNestedManyWithoutSafeInput | null;
}

export interface SafeCreateWithoutTxsInput {
  approvals?: ApprovalCreateNestedManyWithoutSafeInput | null;
  deploySalt?: string | null;
  groups?: GroupCreateNestedManyWithoutSafeInput | null;
  id: string;
  name?: string | null;
  ops?: OpCreateNestedManyWithoutSafeInput | null;
}

export interface SafeUpdateInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateOneRequiredWithoutApprovalsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutApprovalsInput | null;
  create?: SafeCreateWithoutApprovalsInput | null;
  update?: SafeUpdateWithoutApprovalsInput | null;
  upsert?: SafeUpsertWithoutApprovalsInput | null;
}

export interface SafeUpdateOneRequiredWithoutGroupsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutGroupsInput | null;
  create?: SafeCreateWithoutGroupsInput | null;
  update?: SafeUpdateWithoutGroupsInput | null;
  upsert?: SafeUpsertWithoutGroupsInput | null;
}

export interface SafeUpdateOneRequiredWithoutOpsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutOpsInput | null;
  create?: SafeCreateWithoutOpsInput | null;
  update?: SafeUpdateWithoutOpsInput | null;
  upsert?: SafeUpsertWithoutOpsInput | null;
}

export interface SafeUpdateOneRequiredWithoutTxsInput {
  connect?: SafeWhereUniqueInput | null;
  connectOrCreate?: SafeCreateOrConnectWithoutTxsInput | null;
  create?: SafeCreateWithoutTxsInput | null;
  update?: SafeUpdateWithoutTxsInput | null;
  upsert?: SafeUpsertWithoutTxsInput | null;
}

export interface SafeUpdateWithoutApprovalsInput {
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutGroupsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutOpsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  txs?: TxUpdateManyWithoutSafeInput | null;
}

export interface SafeUpdateWithoutTxsInput {
  approvals?: ApprovalUpdateManyWithoutSafeInput | null;
  deploySalt?: NullableStringFieldUpdateOperationsInput | null;
  groups?: GroupUpdateManyWithoutSafeInput | null;
  id?: StringFieldUpdateOperationsInput | null;
  name?: NullableStringFieldUpdateOperationsInput | null;
  ops?: OpUpdateManyWithoutSafeInput | null;
}

export interface SafeUpsertWithoutApprovalsInput {
  create: SafeCreateWithoutApprovalsInput;
  update: SafeUpdateWithoutApprovalsInput;
}

export interface SafeUpsertWithoutGroupsInput {
  create: SafeCreateWithoutGroupsInput;
  update: SafeUpdateWithoutGroupsInput;
}

export interface SafeUpsertWithoutOpsInput {
  create: SafeCreateWithoutOpsInput;
  update: SafeUpdateWithoutOpsInput;
}

export interface SafeUpsertWithoutTxsInput {
  create: SafeCreateWithoutTxsInput;
  update: SafeUpdateWithoutTxsInput;
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

export interface TxCreateManySafeInput {
  txHash: string;
}

export interface TxCreateManySafeInputEnvelope {
  data: TxCreateManySafeInput[];
  skipDuplicates?: boolean | null;
}

export interface TxCreateNestedManyWithoutSafeInput {
  connect?: TxWhereUniqueInput[] | null;
  connectOrCreate?: TxCreateOrConnectWithoutSafeInput[] | null;
  create?: TxCreateWithoutSafeInput[] | null;
  createMany?: TxCreateManySafeInputEnvelope | null;
}

export interface TxCreateNestedOneWithoutApprovalsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutApprovalsInput | null;
  create?: TxCreateWithoutApprovalsInput | null;
}

export interface TxCreateNestedOneWithoutOpsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutOpsInput | null;
  create?: TxCreateWithoutOpsInput | null;
}

export interface TxCreateOrConnectWithoutApprovalsInput {
  create: TxCreateWithoutApprovalsInput;
  where: TxWhereUniqueInput;
}

export interface TxCreateOrConnectWithoutOpsInput {
  create: TxCreateWithoutOpsInput;
  where: TxWhereUniqueInput;
}

export interface TxCreateOrConnectWithoutSafeInput {
  create: TxCreateWithoutSafeInput;
  where: TxWhereUniqueInput;
}

export interface TxCreateWithoutApprovalsInput {
  ops?: OpCreateNestedManyWithoutTxInput | null;
  safe: SafeCreateNestedOneWithoutTxsInput;
  txHash: string;
}

export interface TxCreateWithoutOpsInput {
  approvals?: ApprovalCreateNestedManyWithoutTxInput | null;
  safe: SafeCreateNestedOneWithoutTxsInput;
  txHash: string;
}

export interface TxCreateWithoutSafeInput {
  approvals?: ApprovalCreateNestedManyWithoutTxInput | null;
  ops?: OpCreateNestedManyWithoutTxInput | null;
  txHash: string;
}

export interface TxSafeIdTxHashCompoundUniqueInput {
  safeId: string;
  txHash: string;
}

export interface TxScalarWhereInput {
  AND?: TxScalarWhereInput[] | null;
  NOT?: TxScalarWhereInput[] | null;
  OR?: TxScalarWhereInput[] | null;
  safeId?: StringFilter | null;
  txHash?: StringFilter | null;
}

export interface TxUpdateManyMutationInput {
  txHash?: StringFieldUpdateOperationsInput | null;
}

export interface TxUpdateManyWithWhereWithoutSafeInput {
  data: TxUpdateManyMutationInput;
  where: TxScalarWhereInput;
}

export interface TxUpdateManyWithoutSafeInput {
  connect?: TxWhereUniqueInput[] | null;
  connectOrCreate?: TxCreateOrConnectWithoutSafeInput[] | null;
  create?: TxCreateWithoutSafeInput[] | null;
  createMany?: TxCreateManySafeInputEnvelope | null;
  delete?: TxWhereUniqueInput[] | null;
  deleteMany?: TxScalarWhereInput[] | null;
  disconnect?: TxWhereUniqueInput[] | null;
  set?: TxWhereUniqueInput[] | null;
  update?: TxUpdateWithWhereUniqueWithoutSafeInput[] | null;
  updateMany?: TxUpdateManyWithWhereWithoutSafeInput[] | null;
  upsert?: TxUpsertWithWhereUniqueWithoutSafeInput[] | null;
}

export interface TxUpdateOneRequiredWithoutApprovalsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutApprovalsInput | null;
  create?: TxCreateWithoutApprovalsInput | null;
  update?: TxUpdateWithoutApprovalsInput | null;
  upsert?: TxUpsertWithoutApprovalsInput | null;
}

export interface TxUpdateOneRequiredWithoutOpsInput {
  connect?: TxWhereUniqueInput | null;
  connectOrCreate?: TxCreateOrConnectWithoutOpsInput | null;
  create?: TxCreateWithoutOpsInput | null;
  update?: TxUpdateWithoutOpsInput | null;
  upsert?: TxUpsertWithoutOpsInput | null;
}

export interface TxUpdateWithWhereUniqueWithoutSafeInput {
  data: TxUpdateWithoutSafeInput;
  where: TxWhereUniqueInput;
}

export interface TxUpdateWithoutApprovalsInput {
  ops?: OpUpdateManyWithoutTxInput | null;
  safe?: SafeUpdateOneRequiredWithoutTxsInput | null;
  txHash?: StringFieldUpdateOperationsInput | null;
}

export interface TxUpdateWithoutOpsInput {
  approvals?: ApprovalUpdateManyWithoutTxInput | null;
  safe?: SafeUpdateOneRequiredWithoutTxsInput | null;
  txHash?: StringFieldUpdateOperationsInput | null;
}

export interface TxUpdateWithoutSafeInput {
  approvals?: ApprovalUpdateManyWithoutTxInput | null;
  ops?: OpUpdateManyWithoutTxInput | null;
  txHash?: StringFieldUpdateOperationsInput | null;
}

export interface TxUpsertWithWhereUniqueWithoutSafeInput {
  create: TxCreateWithoutSafeInput;
  update: TxUpdateWithoutSafeInput;
  where: TxWhereUniqueInput;
}

export interface TxUpsertWithoutApprovalsInput {
  create: TxCreateWithoutApprovalsInput;
  update: TxUpdateWithoutApprovalsInput;
}

export interface TxUpsertWithoutOpsInput {
  create: TxCreateWithoutOpsInput;
  update: TxUpdateWithoutOpsInput;
}

export interface TxWhereUniqueInput {
  safeId_txHash?: TxSafeIdTxHashCompoundUniqueInput | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
