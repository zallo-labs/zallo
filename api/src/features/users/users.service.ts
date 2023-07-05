import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';
import { uniqueApprover } from '../approvers/approvers.service';

export const selectUser = () =>
  e.select(e.Approver, () => ({
    ...uniqueApprover(),
    user: true,
  })).user;

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async selectUnique(shape?: ShapeFunc<typeof e.User>) {
    return this.db.query(
      e.select(selectUser(), (u) => ({
        ...shape?.(u),
      })),
    );
  }

  async update({ name }: UpdateUserInput) {
    return this.db.query(
      e.update(selectUser(), () => ({
        set: { name },
      })),
    );
  }
}
