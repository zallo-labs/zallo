import { useCallback } from 'react';
import { err, ok, Result, ResultAsync } from 'neverthrow';
import { CloudStorage, CloudStorageScope } from 'react-native-cloud-storage';
import { combine, split } from 'shamir-secret-sharing';
import { useMutation } from 'urql';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

import { asHex } from 'lib';
import { gql } from '~/gql/api';
import { authContext, useUrqlApiClient } from '~/gql/api/client';
import { logError } from '~/util/analytics';

const CLOUD_SHARE_PATH = 'cloud-approver.share';
const SCOPE = CloudStorageScope.AppData;

const Query = gql(/* GraphQL */ `
  query UseGetCloudApprover($input: UniqueCloudShareInput!) {
    cloudShare(input: $input)
  }
`);

const UpdateApprover = gql(/* GraphQL */ `
  mutation UseGetCloudApprover_UpdateApprover($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      id
    }
  }
`);

export interface GetCloudApproverParams {
  idToken: string;
  accessToken: string | null;
  create?: { name: string };
}

export function useGetCloudApprover() {
  const api = useUrqlApiClient();
  const updateApprover = useMutation(UpdateApprover)[1];

  return useCallback(
    async ({ idToken, accessToken, create }: GetCloudApproverParams) => {
      if (accessToken) CloudStorage.setGoogleDriveAccessToken(accessToken);

      const promisedCloudResult = ResultAsync.fromPromise(
        (async () => {
          if (await CloudStorage.exists(CLOUD_SHARE_PATH, SCOPE))
            return CloudStorage.readFile(CLOUD_SHARE_PATH, SCOPE);
        })(),
        (e) => e as Error,
      );

      const apiResult = await api.query(
        Query,
        { input: { idToken } },
        { requestPolicy: 'network-only' /* prevents caching */ },
      );
      if (!apiResult.data?.cloudShare && apiResult.error) {
        logError('Cloud approver API share read failed', { error: apiResult.error });
        return err('api-read-failed' as const);
      }
      const apiShare = apiResult.data?.cloudShare;

      const cloudResult = await promisedCloudResult;
      if (cloudResult.isErr()) {
        logError('Cloud approver cloud share read failed', { error: cloudResult.error });
        return err('cloud-read-failed' as const);
      }
      const cloudShare = cloudResult.value;

      if (cloudShare && apiShare) {
        const shares = [cloudShare, apiShare].map(
          (shareHex) => new Uint8Array(Buffer.from(shareHex, 'hex')),
        );
        const recoveredPrivateKey = asHex(Buffer.from(await combine(shares)).toString('utf8'));

        return Result.fromThrowable(
          () => privateKeyToAccount(recoveredPrivateKey),
          () => 'invalid-private-key' as const,
        )();
      } else if (!cloudShare && !apiShare) {
        // Create approver and shares
        const privateKey = generatePrivateKey();
        const approver = privateKeyToAccount(privateKey);

        const secret = new Uint8Array(Buffer.from(privateKey, 'utf8'));
        const [cloudShare, apiShare] = (await split(secret, 2, 2)).map((share) =>
          Buffer.from(share).toString('hex'),
        );

        const writeResult = await ResultAsync.fromPromise(
          Promise.all([
            CloudStorage.writeFile(CLOUD_SHARE_PATH, cloudShare, SCOPE),
            updateApprover(
              {
                input: {
                  address: approver.address,
                  name: create?.name,
                  cloud: {
                    idToken,
                    share: apiShare,
                  },
                },
              },
              await authContext(approver),
            ),
          ]),
          (e) => e as Error,
        );
        if (writeResult.isErr()) {
          logError('Cloud approver share read failed', { error: writeResult.error });
          return err('new-approver-write-failed' as const);
        }

        return ok(approver);
      } else {
        logError('Cloud approver share mismatch', {
          idToken,
          hasCloudShare: Boolean(cloudShare),
          hasApiShare: Boolean(apiShare),
        });
        return err('share-mismatch' as const);
      }
    },
    [api, updateApprover],
  );
}
