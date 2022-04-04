const { CONFIG } = require('lib/config');

module.exports = {
  client: {
    service: {
      name: 'subgraph',
      url: CONFIG.subgraphGqlUrl,
    },
    includes: ['**/gql/**/*.ts'],
    tagName: 'sgGql',
    addTypename: true,
  },
};
