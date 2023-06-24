import { Targets, hookAsTargets, targetsAsHook } from './TargetPermission';
import { HookStruct as BaseHookStruct } from '../contracts/Account';
import { AwaitedObj, isTruthy } from '../util';
import { HookSelector } from './selector';
import {
  TransfersConfig,
  hookAsTransfersConfig,
  transfersConfigAsPermissionStruct,
} from './TransferPermission';

export interface Permissions {
  targets: Targets;
  transfers: TransfersConfig;
}

export type HookStruct = AwaitedObj<BaseHookStruct>;

export const permissionsAsHookStructs = (permissions: Permissions): HookStruct[] =>
  [
    targetsAsHook(permissions.targets),
    transfersConfigAsPermissionStruct(permissions.transfers),
  ].filter(isTruthy);

export const structAsPermissions = (permStructs: HookStruct[]): Permissions => ({
  targets: hookAsTargets(permStructs.find((s) => s.selector === HookSelector.Target)),
  transfers: hookAsTransfersConfig(permStructs.find((s) => s.selector === HookSelector.Transfer)),
});
