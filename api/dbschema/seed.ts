import { ACCOUNT_ABI, asUAddress } from 'lib';
import e, { createClient } from './edgeql-js';
import * as eql from './interfaces';
import { ERC20, TOKENS, flattenToken } from 'lib/dapps';
import { toFunctionSelector, toFunctionSignature } from 'viem';
import { AbiFunction } from 'abitype';
import { getGlobalLabels } from '../src/features/contacts/labels.list';
require('dotenv').config({ path: '../.env' });

const client = createClient();

const main = async () => {
  await createContractFunctions();
  await upsertTokens();
  await upsertGlobalLabels();

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
  const functions = [...ACCOUNT_ABI, ...ERC20].filter(
    (f) => f.type === 'function',
  ) as AbiFunction[];

  const functionsSet = e.set(
    ...functions.map((f) =>
      e.json({
        selector: toFunctionSelector(f),
        abi: f,
        abiMd5: toFunctionSignature(f), // Not md5 anymore, but this is all going to be removed
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
  const tokens = TOKENS.flatMap(flattenToken);

  const toUpdate = await e
    .select(e.Token, (t) => ({
      filter: e.op(
        e.op(t.address, 'in', e.set(...tokens.map((t) => t.address))),
        'and',
        e.op('not', e.op('exists', t.user)),
      ),
      id: true,
      address: true,
    }))
    .run(client);

  const updates = tokens
    .map((token) => ({
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
    );

  // Run updates serially to avoid error `UnsupportedFeatureError: The query caused the compiler stack to overflow. It is likely too deeply nested.`
  for (const update of updates) {
    await update.run(client);
  }

  await e
    .select({
      inserted: e.assert_distinct(
        e.cast(
          e.uuid,
          e.set(
            ...tokens
              .filter((t) => !toUpdate.find((ut) => ut.address === t.address))
              .map(
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
          e.op(t.address, 'not in', e.set(...tokens.map((t) => t.address))),
          'and',
          e.op('not', e.op('exists', t.user)),
        ),
      })),
    })
    .run(client);
}

async function upsertGlobalLabels() {
  const gLabels = Object.entries(getGlobalLabels()).map(([address, label]) => ({
    address: asUAddress(address),
    label,
  }));

  const toUpdate = await e
    .select(e.GlobalLabel, (l) => ({
      filter: e.op(l.address, 'in', e.set(...gLabels.map((l) => l.address))),
      id: true,
      address: true,
    }))
    .run(client);

  const updates = gLabels
    .map((globalLabel) => ({
      globalLabel,
      id: toUpdate.find((ut) => ut.address === globalLabel.address)?.id,
    }))
    .filter((t) => t.id)
    .map(
      ({ globalLabel, id }) =>
        e.update(e.GlobalLabel, () => ({
          filter_single: { id: id! },
          set: globalLabel,
        })).id,
    );

  await e
    .select({
      ...(updates.length && { updated: e.set(...updates) }),
      inserted: e.assert_distinct(
        e.cast(
          e.uuid,
          e.set(
            ...gLabels
              .filter((t) => !toUpdate.find((ut) => ut.address === t.address))
              .map((globalLabel) => e.insert(e.GlobalLabel, globalLabel).id),
          ),
        ),
      ),
      removed: e.delete(e.GlobalLabel, (t) => ({
        filter: e.op(t.address, 'not in', e.set(...gLabels.map((t) => t.address))),
      })),
    })
    .run(client);
}
