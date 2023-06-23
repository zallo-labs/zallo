import { Targets, permissionAsTargets, targetsAsPermission } from './TargetPermission';
import { HookStruct as BaseHookStruct } from '../contracts/Account';
import { AwaitedObj, isTruthy } from '../util';
import { HookSelector } from './selector';
import {
  TransfersConfig,
  permissionAsTransfersConfig,
  transfersConfigAsPermissionStruct,
} from './TransferPermission';

export interface Permissions {
  targets: Targets;
  transfers: TransfersConfig;
}

export type PermissionStruct = AwaitedObj<BaseHookStruct>;
export type Permission = Permissions[keyof Permissions];

export const permissionsAsStruct = (permissions: Permissions): PermissionStruct[] =>
  [
    targetsAsPermission(permissions.targets),
    transfersConfigAsPermissionStruct(permissions.transfers),
  ].filter(isTruthy);

export const structAsPermissions = (permStructs: PermissionStruct[]): Permissions => ({
  targets: permissionAsTargets(permStructs.find((s) => s.selector === HookSelector.Target)),
  transfers: permissionAsTransfersConfig(
    permStructs.find((s) => s.selector === HookSelector.Transfer),
  ),
});
