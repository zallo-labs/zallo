import { MissingFieldHandler, ROOT_TYPE } from 'relay-runtime';

export const missingFieldHandlers: MissingFieldHandler[] = [
  {
    handle(field, record, variables) {
      if (record?.getType() !== ROOT_TYPE) return undefined;

      if (field.name === 'node' && 'id' in variables) {
        return variables.id;
      }

      return undefined;
    },
    kind: 'linked',
  },
];
