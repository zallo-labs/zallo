FROM node:16-bullseye

ARG required SUBGRAPH_GQL_URL
ENV SUBGRAPH_GQL_URL=${SUBGRAPH_GQL_URL}

USER node
ADD --chown=node:node ./ /metasafe
WORKDIR /metasafe

# Setup
RUN yarn
RUN yarn api build

CMD yarn api start:prod