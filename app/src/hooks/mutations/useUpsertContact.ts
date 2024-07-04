import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { useUpsertContactMutation } from '~/api/__generated__/useUpsertContactMutation.graphql';

// graphql`
//   fragment useUpsertContac
// `

const Upsert = graphql`
  mutation useUpsertContactMutation($input: UpsertContactInput!) {
    upsertContact(input: $input) {
      id
    }
  }
`;

export function useUpsertContact() {
  return useMutation<useUpsertContactMutation>(Upsert, {
    updater: (store, data) => {
      // const contact = data && store.get(data?.upsertContact.id);
      // if (!contact) return;

      // const contacts = store.getPluralRootField('contacts');
      // contacts?.push(contact);
    },
  });
}
