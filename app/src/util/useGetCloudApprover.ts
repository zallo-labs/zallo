import { Approver, asAddress } from 'lib';
import { useCallback } from 'react';
import { CloudStorage, CloudStorageScope } from 'react-native-cloud-storage';
import { split, combine } from 'shamir-secret-sharing';
import { gql } from '@api';
import { authContext, useUrqlApiClient } from '@api/client';
import { useMutation } from 'urql';
import { showError } from '~/provider/SnackbarProvider';
import { Result, err, ok } from 'neverthrow';
import { logError } from './analytics';

const CLOUD_SHARE_PATH = 'approver-share';
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

      const [cloudShare, apiShare] = await Promise.all([
        (async () => {
          try {
            return await CloudStorage.readFile(CLOUD_SHARE_PATH, SCOPE);
          } catch (e) {
            return undefined;
          }
        })(),
        (async () =>
          (
            await api.query(
              Query,
              { input: { idToken } },
              { requestPolicy: 'network-only' /* prevents caching */ },
            )
          ).data?.cloudShare)(),
      ]);

      if (cloudShare && apiShare) {
        const shares = [cloudShare, apiShare].map(
          (shareHex) => new Uint8Array(Buffer.from(shareHex, 'hex')),
        );
        const recoveredPrivateKey = Buffer.from(await combine(shares)).toString('utf-8');

        return Result.fromThrowable(
          () => new Approver(recoveredPrivateKey),
          () => 'invalid-private-key' as const,
        )();
      } else if (!cloudShare && !apiShare) {
        // Create approver and shares
        const approver = Approver.createRandom();

        const secret = new Uint8Array(Buffer.from(approver.privateKey, 'utf-8'));
        const [cloudShare, apiShare] = (await split(secret, 2, 2)).map((share) =>
          Buffer.from(share).toString('hex'),
        );

        await Promise.all([
          CloudStorage.writeFile(CLOUD_SHARE_PATH, cloudShare, SCOPE),
          updateApprover(
            {
              input: {
                address: asAddress(approver.address),
                name: create?.name,
                cloud: {
                  idToken,
                  share: apiShare,
                },
              },
            },
            await authContext(approver),
          ),
        ]);

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
