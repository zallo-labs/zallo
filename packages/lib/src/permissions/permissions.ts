import { TargetsConfig } from './TargetPermission';
import { TransfersConfig } from './TransferPermission';
import { PolicyStruct } from '../policy';
import { OtherMessageConfig } from './OtherMessagePermission';

export interface Permissions {
  targets: TargetsConfig;
  transfers: TransfersConfig;
  otherMessage: OtherMessageConfig;
}

export type HookStruct = PolicyStruct['hooks'][0];
