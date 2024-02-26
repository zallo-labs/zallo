import { useCallback } from 'react';
import {
  CloudStorage,
  CloudStorageError,
  CloudStorageErrorCode,
  CloudStorageScope,
} from 'react-native-cloud-storage';
import { gql } from '@api';
import { authContext, useUrqlApiClient } from '@api/client';
import { useMutation } from 'urql';
import { fromPromise, ok, safeTry } from 'neverthrow';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { asHex } from 'lib';
import { UpdateApproverInput } from '@api/documents.generated';

const PK_PATH = '/approver.private-key';
const SCOPE = CloudStorageScope.AppData;

const Query = gql(/* GraphQL */ `
  query UseGetCloudApprover($approver: Address!) {
    approver(input: { address: $approver }) {
      id
      name
      cloud {
        provider
        subject
      }
    }
  }
`);

const UpdateApprover = gql(/* GraphQL */ `
  mutation UseGetCloudApprover_UpdateApprover($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      id
      name
      cloud {
        provider
        subject
      }
    }
  }
`);

export interface GetCloudApproverParams {
  accessToken: string | null;
  details?: Partial<UpdateApproverInput>;
}

export function useGetCloudApprover() {
  const api = useUrqlApiClient();
  const updateApprover = useMutation(UpdateApprover)[1];

  return useCallback(
    ({ accessToken, details }: GetCloudApproverParams) =>
      safeTry(async function* () {
        if (accessToken) CloudStorage.setGoogleDriveAccessToken(accessToken);

        let approver = yield* (await readFile(PK_PATH))
          .map((pk) => pk && privateKeyToAccount(asHex(pk)))
          .safeUnwrap();

        if (!approver) {
          const privateKey = generatePrivateKey();
          approver = privateKeyToAccount(privateKey);

          // Insert
          yield* writeFile(PK_PATH, privateKey).safeUnwrap();
        }

        (async function updateDetails() {
          const e = (await api.query(Query, { approver: approver.address })).data?.approver;

          await updateApprover(
            {
              input: {
                address: approver.address,
                name: !e?.name ? details?.name : undefined,
                cloud: !e?.cloud ? details?.cloud : undefined,
              },
            },
            await authContext(approver),
          );
        })();

        return ok(approver);
      }),
    [api, updateApprover],
  );
}

type ErrorCodes = `${CloudStorageErrorCode}`;

function readFile(path: string) {
  return fromPromise(
    (async () => {
      if (await CloudStorage.exists(path, SCOPE)) return CloudStorage.readFile(path, SCOPE);
    })(),
    (e) => (e as CloudStorageError).code as ErrorCodes,
  );
}

function writeFile(path: string, data: string) {
  return fromPromise(
    CloudStorage.writeFile(path, data, SCOPE),
    (e) => (e as CloudStorageError).code as ErrorCodes,
  );
}
