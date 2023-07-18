import { ACCOUNT_INTERFACE, Erc20__factory, asSelector } from 'lib';
import crypto from 'crypto';
import e, { createClient } from './edgeql-js';
import * as eql from './interfaces';
import { TOKENS } from '../src/features/tokens/tokens.list';
require('dotenv').config({ path: '../.env' });

const client = createClient();

const main = async () => {
  await createContractFunctions();
  await upsertTokens();

  console.log('🌱 Seeded');
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
  });

async function createContractFunctions() {
  // Interfaces in order of precedence (in case of sighash collisions)
  const interfaces = [ACCOUNT_INTERFACE, Erc20__factory.createInterface()];

  const md5 = (value: crypto.BinaryLike) => crypto.createHash('md5').update(value).digest('hex');

  const functionsSet = e.set(
    ...interfaces.flatMap((iface) =>
      Object.values(iface.functions).map((f) => {
        const abi = f.format('json');

        return e.json({
          selector: asSelector(iface.getSighash(f)),
          abi: JSON.parse(abi),
          abiMd5: md5(abi),
        });
      }),
    ),
  );

  await e
    .for(e.cast(e.json, functionsSet), (item) =>
      e
        .insert(e.Function, {
          selector: e.cast(e.str, item.selector),
          abi: e.cast(e.json, item.abi),
          abiMd5: e.cast(e.str, item.abiMd5),
          source: e.cast(e.AbiSource, 'Verified' satisfies eql.AbiSource),
        })
        .unlessConflict((f) => ({
          on: f.abiMd5,
        })),
    )
    .run(client);
}

async function upsertTokens() {
  const toUpdate = await e
    .select(e.Token, (t) => ({
      filter: e.op(
        e.op(t.address, 'in', e.set(...TOKENS.map((t) => t.address))),
        'and',
        e.op('not', e.op('exists', t.user)),
      ),
      id: true,
      address: true,
    }))
    .run(client);

  await e
    .select({
      updated: e.assert_distinct(
        e.cast(
          e.uuid,
          e.set(
            ...TOKENS.map((token) => ({
              token,
              id: toUpdate.find((ut) => ut.address === token.address)?.id,
            }))
              .filter((t) => t.id)
              .map(
                ({ token, id }) =>
                  e.update(e.Token, () => ({
                    filter_single: { id: id! },
                    set: token,
                  })).id,
              ),
          ),
        ),
      ),
      inserted: e.assert_distinct(
        e.cast(
          e.uuid,
          e.set(
            ...TOKENS.filter(
              (t) => !toUpdate.find((ut) => ut.address === t.address),
            ).map(
              (token) =>
                e.insert(e.Token, {
                  user: e.cast(e.User, e.set()), // Required; default fails
                  ...token,
                }).id,
            ),
          ),
        ),
      ),
      removed: e.delete(e.Token, (t) => ({
        filter: e.op(
          e.op(t.address, 'not in', e.set(...TOKENS.map((t) => t.address))),
          'and',
          e.op('not', e.op('exists', t.user)),
        ),
      })),
    })
    .run(client);
}
