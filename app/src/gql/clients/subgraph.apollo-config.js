const { CONFIG } = require('config');

module.exports = {
  client: {
    service: {
      name: 'subgraph',
      url: CONFIG.subgraphGqlUrl,
    },
    includes: ['../**/*.ts'],
    tagName: 'sgGql',
    addTypename: true,
  },
};
