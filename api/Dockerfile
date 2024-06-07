## ------------------------------
##            Build
## ------------------------------

FROM node:20-alpine as builder

ARG TURBO_TEAM
ENV TURBO_TEAM=$TURBO_TEAM
ARG TURBO_TOKEN
ENV TURBO_TOKEN=$TURBO_TOKEN

ENV NODE_ENV build

USER node
WORKDIR /build

COPY --chown=node:node . .
RUN yarn

RUN yarn api build

## ------------------------------
##            Runtime
## ------------------------------

FROM node:20-alpine as runtime

ENV NODE_ENV production

USER node
WORKDIR /build

# Root
COPY --from=builder --chown=node:node /build/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /build/packages ./packages
COPY --from=builder --chown=node:node /build/.env.vault ./.env.vault

# Api
COPY --from=builder --chown=node:node /build/api/dbschema/ ./api/dbschema/
COPY --from=builder --chown=node:node /build/api/dist/ ./api/dist/
COPY --from=builder --chown=node:node /build/api/dbschema/ ./api/dbschema/
# Copy api/node_modules only if it exists; COPY may fail without the glob pattern
COPY --from=builder --chown=node:node /build/api/node_module[s] ./api/node_modules/
COPY --from=builder --chown=node:node /build/api/edgedb.toml ./api/edgedb.toml
COPY --from=builder --chown=node:node /build/api/package.json ./api/package.json

# Copy `edgedb` binary - required for migrations
COPY --from=edgedb/edgedb-cli:5.1.0 --chown=node:node /usr/bin/edgedb /usr/bin/edgedb

WORKDIR /build/api
CMD ["yarn", "start"]