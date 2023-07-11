import { Field, ID, InterfaceType, ObjectType, ObjectTypeOptions } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';

@InterfaceType()
export class Node {
  @Field(() => ID)
  id: uuid;
}

export const NodeType =
  (options?: ObjectTypeOptions): ClassDecorator =>
  (target) =>
    ObjectType({
      ...options,
      implements: [
        Node,
        ...(options?.implements
          ? Array.isArray(options.implements)
            ? options.implements
            : [options.implements]
          : []),
      ],
    })(target);
