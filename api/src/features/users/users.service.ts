import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { UpdateUserInput } from './users.input';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async selectUnique(shape?: ShapeFunc<typeof e.global.current_user>) {
    return this.db.query(
      e.select(e.global.current_user, (u) => ({
        ...shape?.(u),
      })),
    );
  }

  async update({ name }: UpdateUserInput) {
    return this.db.query(
      e.update(e.global.current_user, () => ({
        set: { name },
      })),
    );
  }
}
