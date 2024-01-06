import { PolicyStruct } from '../policy';
import { TargetsConfig } from './TargetPermission';
import { TransfersConfig } from './TransferPermission';

export interface Permissions {
  targets: TargetsConfig;
  transfers: TransfersConfig;
}

export type HookStruct = PolicyStruct['hooks'][0];
