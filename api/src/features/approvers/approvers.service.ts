import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { getUserCtx } from '~/request/ctx';
import { UpdateApproverInput } from './approvers.input';
import { and } from '../database/database.util';

@Injectable()
export class ApproversService {
  constructor(private db: DatabaseService) {}

  async selectUnique(
    address: Address | undefined = getUserCtx().approver,
    shape?: ShapeFunc<typeof e.Approver>,
  ) {
    const r = await this.db.queryWith(
      { address: e.Address },
      ({ address }) =>
        e.assert_single(
          e.select(e.Approver, (a) => ({
            ...shape?.(a),
            filter: and(e.op(a.address, '=', address), e.op(e.global.current_user, '=', a.user)),
          })),
        ),
      { address },
    );

    return r ?? { id: address, address };
  }

  async update({
    address = getUserCtx().approver,
    name,
    pushToken,
    bluetoothDevices,
    cloud,
  }: UpdateApproverInput) {
    return this.db.query(
      e.update(e.Approver, () => ({
        filter_single: { address },
        set: {
          name,
          pushToken,
          bluetoothDevices: bluetoothDevices && [...new Set(bluetoothDevices)],
          ...(cloud !== undefined && { cloud }),
        },
      })),
    );
  }
}
