import { useCallback } from 'react';
import {
  CloudStorage,
  CloudStorageError,
  CloudStorageErrorCode,
  CloudStorageScope,
} from 'react-native-cloud-storage';
import { fromPromise, ok, safeTry } from 'neverthrow';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { asHex } from 'lib';
import { fetchQuery, graphql } from 'relay-runtime';
import { useRelayEnvironment } from 'react-relay';
import { useMutation } from '~/api';
import { useGetCloudApproverQuery } from '~/api/__generated__/useGetCloudApproverQuery.graphql';
import { signAuthHeaders } from '~/api/auth-manager';
import { UpdateApproverInput } from '~/api/__generated__/useGetCloudApproverMutation.graphql';
import { withHeaders } from '~/api/network/auth';

const PK_PATH = '/approver.private-key';
const SCOPE = CloudStorageScope.AppData;

const Query = graphql`
  query useGetCloudApproverQuery($approver: Address!) {
    approver(address: $approver) {
      id
      details {
        id
        name
        cloud {
          provider
          subject
        }
      }
    }
  }
`;

const UpdateApprover = graphql`
  mutation useGetCloudApproverMutation($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      id
      details {
        id
        name
        cloud {
          provider
          subject
        }
      }
    }
  }
`;

export interface GetCloudApproverParams {
  accessToken: string | null;
  details?: Partial<UpdateApproverInput>;
}

export function useGetCloudApprover() {
  const environment = useRelayEnvironment();
  const updateApprover = useMutation(UpdateApprover);

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

        const authHeaders = await signAuthHeaders(approver);

        (async function updateDetails() {
          const e = (
            await fetchQuery<useGetCloudApproverQuery>(
              environment,
              Query,
              {
                approver: approver.address,
              },
              { networkCacheConfig: withHeaders(authHeaders) },
            ).toPromise()
          )?.approver.details;

          await updateApprover(
            {
              input: {
                address: approver.address,
                name: !e?.name ? details?.name : undefined,
                cloud: !e?.cloud ? details?.cloud : undefined,
              },
            },
            { headers: authHeaders },
          );
        })();

        return ok(approver);
      }),
    [environment, updateApprover],
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
