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
COPY --from=builder --chown=node:node /build/.env.vault ./.env.vault

# Api
COPY --from=builder --chown=node:node /build/api/dbschema/ ./api/dbschema/
COPY --from=builder --chown=node:node /build/api/dist/ ./api/dist/
COPY --from=builder --chown=node:node /build/api/generated/ ./api/generated/
COPY --from=builder --chown=node:node /build/api/node_modules/ ./api/node_modules/

WORKDIR /build/api
CMD ["node", "./dist/src/main.js"]