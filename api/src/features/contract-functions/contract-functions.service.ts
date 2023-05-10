import { Injectable } from '@nestjs/common';
import { ContractsService } from '../contracts/contracts.service';
import { DatabaseService } from '../database/database.service';
import e from '~/edgeql-js';
import { ShapeFunc } from '../database/database.select';
import { ContractFunctionInput } from './contract-functions.args';

@Injectable()
export class ContractFunctionsService {
  constructor(private db: DatabaseService, private contracts: ContractsService) {}

  async findUnique(
    { contract, selector }: ContractFunctionInput,
    shape: ShapeFunc<typeof e.Function>,
  ) {
    const c = await this.contracts.selectUnique(contract, () => ({
      functions: (f) => ({
        filter: e.op(f.selector, '=', selector),
        ...(shape?.(f) as any), // Type issue
      }),
    }));
    const exactMatch = c?.functions[0];
    if (exactMatch) return exactMatch;

    // Fallback to finding the selector from any contract
    return e
      .select(e.Function, (f) => ({
        filter: e.op(f.selector, '=', selector),
        ...shape?.(f),
      }))
      .run(this.db.client);
  }
}
