FROM matterlabs/zksolc:latest AS zksolc

# Unsupported commands: https://devcenter.heroku.com/articles/container-registry-and-runtime#unsupported-dockerfile-commands
FROM node:18

ENV NODE_ENV="development"
ENV IS_DOCKER="true"

USER node
ADD --chown=node:node ./ /metasafe
WORKDIR /metasafe

# Copy out zksolc files
COPY --from=zksolc /usr/local/bin /usr/local/bin

# Setup
RUN yarn install
RUN yarn api build

CMD yarn api start:prod