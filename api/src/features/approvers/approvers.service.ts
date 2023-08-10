import { Injectable } from '@nestjs/common';
import { Address, isAddress } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { getUserCtx } from '~/request/ctx';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UpdateApproverInput } from './approvers.input';
import { and } from '../database/database.util';

export const uniqueApprover = (id: uuid | Address = getUserCtx().approver) => ({
  filter_single: isAddress(id) ? { address: id } : { id },
});

export const selectApprover = (id?: uuid | Address, shape?: ShapeFunc<typeof e.Approver>) =>
  e.select(e.Approver, (a) => ({
    ...uniqueApprover(id),
    ...shape?.(a),
  }));

@Injectable()
export class ApproversService {
  constructor(private db: DatabaseService) {}

  async selectUnique(
    address: Address | undefined = getUserCtx().approver,
    shape?: ShapeFunc<typeof e.Approver>,
  ) {
    const ctx = getUserCtx();

    const r = await this.db.query(
      e.assert_single(
        e.select(e.Approver, (a) => ({
          ...shape?.(a),
          filter: and(
            e.op(a.address, '=', address),
            ctx.approver !== address && e.op(ctx.approver, 'in', a.user.approvers.address),
          ),
        })),
      ),
    );

    return r ?? { id: address, address };
  }

  async upsert({
    address = getUserCtx().approver,
    name,
    pushToken,
    bluetoothDevices,
  }: UpdateApproverInput) {
    return this.db.query(
      e.insert(e.Approver, { address, name, pushToken }).unlessConflict((a) => ({
        on: a.address,
        else: e.update(a, () => ({
          set: {
            name,
            pushToken,
            bluetoothDevices: bluetoothDevices && [...new Set(bluetoothDevices)],
          },
        })),
      })),
    );
  }
}
