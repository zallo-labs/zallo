import { TargetsConfig } from './TargetPermission';
import { TransfersConfig } from './TransferPermission';
import { PolicyStruct } from '../policy';

export interface Permissions {
  targets: TargetsConfig;
  transfers: TransfersConfig;
}

export type HookStruct = PolicyStruct['hooks'][0];
