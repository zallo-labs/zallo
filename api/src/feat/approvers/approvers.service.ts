import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { DatabaseService } from '~/core/database';
import { ShapeFunc } from '~/core/database';
import e from '~/edgeql-js';
import { getUserCtx } from '~/core/context';
import { UpdateApproverInput } from './approvers.input';

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
            filter_single: { address },
            ...shape?.(a),
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
      e
        .insert(e.ApproverDetails, {
          approver: e.select(e.Approver, () => ({ filter_single: { address } })),
          name,
          pushToken,
          bluetoothDevices,
          cloud,
        })
        .unlessConflict((a) => ({
          on: a.approver,
          else: e.update(a, () => ({
            set: {
              name,
              pushToken,
              bluetoothDevices,
              cloud,
            },
          })),
        })),
    );
  }
}
