import { Injectable } from '@nestjs/common';

import e from '~/edgeql-js';
import { ContractsService } from '../contracts/contracts.service';
import { ShapeFunc } from '../database/database.select';
import { DatabaseService } from '../database/database.service';
import { ContractFunctionInput } from './contract-functions.input';

@Injectable()
export class ContractFunctionsService {
  constructor(
    private db: DatabaseService,
    private contracts: ContractsService,
  ) {}

  async select({ contract, selector }: ContractFunctionInput, shape: ShapeFunc<typeof e.Function>) {
    // @ts-expect-error shape function mismatch
    const c = await this.contracts.select(contract, () => ({
      functions: (f) => ({
        filter: e.op(f.selector, '=', selector),
        limit: 1,
        ...shape?.(f), // Type issue
      }),
    }));
    const exactMatch = c?.functions[0];
    if (exactMatch) return exactMatch;

    // Fallback to finding the selector from any contract
    const selectorMatches = await this.db.query(
      e.select(e.Function, (f) => ({
        filter: e.op(f.selector, '=', selector),
        limit: 1,
        ...shape?.(f),
      })),
    );

    return selectorMatches[0];
  }
}
