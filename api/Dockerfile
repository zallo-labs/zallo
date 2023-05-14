## ------------------------------
##            Build
## ------------------------------

FROM node:18-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /build

COPY --chown=node:node . .
RUN yarn install

RUN yarn api build

## ------------------------------
##            Runtime
## ------------------------------

FROM node:18-alpine

ENV NODE_ENV production

USER node
WORKDIR /build

# Root
COPY --from=builder --chown=node:node /build/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /build/lib/ ./lib/

# Api
COPY --from=builder --chown=node:node /build/api/dbschema/ ./api/dbschema/
COPY --from=builder --chown=node:node /build/api/dist/ ./api/dist/
COPY --from=builder --chown=node:node /build/api/dbschema/ ./api/dbschema/
COPY --from=builder --chown=node:node /build/api/node_modules/ ./api/node_modules/
COPY --from=builder --chown=node:node /build/.env.vault ./api/.env.vault
COPY --from=builder --chown=node:node /build/api/edgedb.toml ./api/edgedb.toml
COPY --from=builder --chown=node:node /build/api/package.json ./api/package.json

# Copy `edgedb` binary - required for migrations
COPY --from=edgedb/edgedb-cli:latest --chown=node:node /usr/bin/edgedb /usr/bin/edgedb

WORKDIR /build/api
CMD ["yarn", "start:production"]