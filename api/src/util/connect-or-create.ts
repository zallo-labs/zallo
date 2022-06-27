import { UserCreateNestedOneWithoutApprovalsInput } from '@gen/user/user-create-nested-one-without-approvals.input';
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

export const connectOrCreateUser = (
  addr: Address,
): UserCreateNestedOneWithoutApprovalsInput => ({
  connectOrCreate: {
    where: { id: addr },
    create: { id: addr },
  },
});
