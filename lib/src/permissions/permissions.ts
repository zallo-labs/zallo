import { Targets, permissionAsTargets, targetsAsPermission } from './TargetPermission';
import { PermissionStruct as BasePermissionStruct } from '../contracts/Account';
import { AwaitedObj, isTruthy } from '../util';
import { PermissionSelector } from './PermissionSelector';

export interface Permissions {
  targets: Targets;
}

export type PermissionStruct = AwaitedObj<BasePermissionStruct>;
export type Permission = Permissions[keyof Permissions];

export const permissionsAsStruct = (permissions: Permissions): PermissionStruct[] =>
  [targetsAsPermission(permissions.targets)].filter(isTruthy);

export const structAsPermissions = (permStructs: PermissionStruct[]): Permissions => ({
  targets: permissionAsTargets(permStructs.find((s) => s.selector === PermissionSelector.Target)),
});
