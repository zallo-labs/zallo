FROM node:16
USER node

ENV NODE_ENV="production"

ADD --chown=node:node ./ /metasafe
WORKDIR /metasafe

# Install dependencies
RUN yarn workspaces focus api

CMD yarn api start:prod