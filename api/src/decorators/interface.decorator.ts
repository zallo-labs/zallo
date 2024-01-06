import { Field, ID, InterfaceType, ObjectType, ObjectTypeOptions } from '@nestjs/graphql';

import { UUID } from 'lib';
import { UUIDField } from '~/apollo/scalars/Uuid.scalar';

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
export class CustomNode {
  @Field(() => ID)
  id: string;
}

export const CustomNodeType = createObjectWithInterfaceDecorator(CustomNode);

@InterfaceType()
export class Node {
  @UUIDField()
  id: UUID;
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
