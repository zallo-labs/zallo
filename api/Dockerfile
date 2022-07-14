FROM node:16-bullseye

ARG required SUBGRAPH_GQL_URL
ENV SUBGRAPH_GQL_URL=${SUBGRAPH_GQL_URL}

USER node
ADD --chown=node:node ./ /metasafe
WORKDIR /metasafe

# Setup
RUN yarn
RUN yarn api build

# Migrate needs to occur on start, as Render doesn't have a release command - https://feedback.render.com/features/p/release-phase-script
CMD yarn api prisma migrate deploy && yarn api start:prod