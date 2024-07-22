import { MissingFieldHandler, ROOT_TYPE } from 'relay-runtime';

const NODE_RESOLVERS = new Set(['node', 'proposal', 'transaction', 'message', 'transfer']);

export const missingFieldHandlers: MissingFieldHandler[] = [
  {
    handle(field, record, variables) {
      if (record?.getType() === ROOT_TYPE && NODE_RESOLVERS.has(field.name) && 'id' in variables)
        return variables.id;

      return undefined;
    },
    kind: 'linked',
  },
];
