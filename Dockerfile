# Unsupported commands: https://devcenter.heroku.com/articles/container-registry-and-runtime#unsupported-dockerfile-commands
FROM node:16

ENV NODE_ENV="development"

USER node
ADD --chown=node:node ./ /metasafe
WORKDIR /metasafe

# Setup
RUN yarn workspaces focus api
RUN yarn api build

CMD yarn api start:prod