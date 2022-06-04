import { ApproverCreateNestedOneWithoutApprovalsInput } from '@gen/approver/approver-create-nested-one-without-approvals.input';
import { SafeCreateNestedOneWithoutApprovalsInput } from '@gen/safe/safe-create-nested-one-without-approvals.input';
import { Address } from 'lib';

export const connectOrCreateSafe = (
  safe: Address,
): SafeCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id: safe },
    create: { id: safe },
  },
});

export const connectOrCreateApprover = (
  approver: Address,
): ApproverCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id: approver },
    create: { id: approver },
  },
});
