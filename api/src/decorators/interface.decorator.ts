import { Field, ID, InterfaceType, ObjectType, ObjectTypeOptions } from '@nestjs/graphql';
import { uuid } from 'edgedb/dist/codecs/ifaces';

const createObjectWithInterfaceDecorator =
  (iface: Function | (() => Function)) =>
  (options?: ObjectTypeOptions): ClassDecorator =>
  (target) =>
    ObjectType({
      ...options,
      implements: [
        iface,
        ...(options?.implements
          ? Array.isArray(options.implements)
            ? options.implements
            : [options.implements]
          : []),
      ],
    })(target);

@InterfaceType()
export class Node {
  @Field(() => ID)
  id: uuid;
}

export const NodeType = createObjectWithInterfaceDecorator(Node);

@InterfaceType()
export class Err {
  constructor(message: string) {
    this.message = message;
  }

  @Field(() => String)
  message: string;
}

export const ErrorType = createObjectWithInterfaceDecorator(Err);
