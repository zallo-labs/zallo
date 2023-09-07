import { Injectable } from '@nestjs/common';
import { Address, isAddress, toArray, tryOrIgnoreAsync } from 'lib';
import { DatabaseService } from '../database/database.service';
import { ShapeFunc } from '../database/database.select';
import e from '~/edgeql-js';
import { getUserCtx } from '~/request/ctx';
import { uuid } from 'edgedb/dist/codecs/ifaces';
import { UniqueCloudShareInput, UpdateApproverInput } from './approvers.input';
import { and } from '../database/database.util';
import { CloudProvider } from '~/edgeql-js/modules/default';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { UserInputError } from '@nestjs/apollo';
import { CONFIG } from '~/config';

export const uniqueApprover = (id: uuid | Address = getUserCtx().approver) => ({
  filter_single: isAddress(id) ? { address: id } : { id },
});

export const selectApprover = (id?: uuid | Address, shape?: ShapeFunc<typeof e.Approver>) =>
  e.select(e.Approver, (a) => ({
    ...uniqueApprover(id),
    ...shape?.(a),
  }));

@Injectable()
export class ApproversService {
  constructor(private db: DatabaseService) {}

  async selectUnique(
    address: Address | undefined = getUserCtx().approver,
    shape?: ShapeFunc<typeof e.Approver>,
  ) {
    const ctx = getUserCtx();

    const r = await this.db.query(
      e.assert_single(
        e.select(e.Approver, (a) => ({
          ...shape?.(a),
          filter: and(
            e.op(a.address, '=', address),
            ctx.approver !== address && e.op(ctx.approver, 'in', a.user.approvers.address),
          ),
        })),
      ),
    );

    return r ?? { id: address, address };
  }

  async update({
    address = getUserCtx().approver,
    name,
    pushToken,
    bluetoothDevices,
    cloud,
  }: UpdateApproverInput) {
    const upsertCloud =
      cloud &&
      (await (async () => {
        const { provider, subject } = await this.validateJwt(cloud.idToken);

        return e
          .insert(e.CloudShare, {
            provider,
            subject,
            share: cloud.share,
          })
          .unlessConflict((s) => ({
            on: e.tuple([s.provider, s.subject]),
            else: e.update(s, () => ({ set: { share: cloud.share } })),
          }));
      })());

    return this.db.query(
      e.update(e.Approver, () => ({
        filter_single: { address },
        set: {
          name,
          pushToken,
          bluetoothDevices: bluetoothDevices && [...new Set(bluetoothDevices)],
          cloud: upsertCloud,
        },
      })),
    );
  }

  async selectUniqueShare({ idToken }: UniqueCloudShareInput) {
    const { provider, subject } = await this.validateJwt(idToken);

    return this.db.query(
      e.select(e.CloudShare, () => ({
        filter_single: { provider, subject },
        share: true,
      })).share,
    );
  }

  private APPLE_JWKS = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
  private GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

  private async validateJwt(jwt: string) {
    const appleResult = tryOrIgnoreAsync(async () => ({
      ...(await jwtVerify(jwt, this.APPLE_JWKS)),
      provider: CloudProvider.Apple,
    }));
    const googleResult = tryOrIgnoreAsync(async () => ({
      ...(await jwtVerify(jwt, this.GOOGLE_JWKS)),
      provider: CloudProvider.Google,
    }));

    const r = (await appleResult) ?? (await googleResult);
    if (!r) throw new UserInputError('Invalid JWT: must be from Apple or Google');

    // Verify JWT is for an acceptable oauth client
    if (!toArray(r.payload.aud ?? []).find((aud) => CONFIG.oauthClients.has(aud)))
      throw new UserInputError('Invalid JWT: must be for Zallo');

    const subject = r.payload.sub;
    if (!subject) throw new UserInputError('Invalid JWT: must include subject');

    return { provider: r.provider, subject };
  }
}
