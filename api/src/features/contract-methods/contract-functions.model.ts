import { registerEnumType } from '@nestjs/graphql';

export enum ContractSourceConfidence {
  Low,
  Medium,
  High,
}
registerEnumType(ContractSourceConfidence, { name: 'ContractSourceConfidence' });
