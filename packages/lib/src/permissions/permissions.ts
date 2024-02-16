import { TargetsConfig } from './TargetPermission';
import { TransfersConfig } from './TransferPermission';
import { PolicyStruct } from '../policy';
import { OtherMessageConfig } from './OtherMessagePermission';
import { DelayConfig } from './DelayPermission';

export interface Permissions {
  targets: TargetsConfig;
  transfers: TransfersConfig;
  otherMessage: OtherMessageConfig;
  delay: DelayConfig;
}

export type HookStruct = PolicyStruct['hooks'][0];
