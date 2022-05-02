FROM matterlabs/zksolc:latest AS zksolc

# Unsupported commands: https://devcenter.heroku.com/articles/container-registry-and-runtime#unsupported-dockerfile-commands
FROM node:16

ENV NODE_ENV="development"
ENV IS_DOCKER="true"

USER node
ADD --chown=node:node ./ /metasafe
WORKDIR /metasafe

# Copy out zksync-solc files
COPY --from=zksolc /usr/local/bin/zksolc /metasafe/contracts/zksolc

# Setup
RUN yarn install
RUN yarn api build

CMD yarn api start:prod