const { CONFIG } = require('config');

module.exports = {
  client: {
    service: {
      name: 'subgraph',
      url: CONFIG.subgraphGqlUrl,
    },
    includes: ['./src/features/subgraph/**/*.ts'],
    tagName: 'gql',
    addTypename: true,
  },
};
