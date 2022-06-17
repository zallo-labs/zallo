const { CONFIG } = require('config');

module.exports = {
  client: {
    service: {
      name: 'subgraph',
      url: CONFIG.subgraphGqlUrl,
    },
    includes: ['../../{mutations,queries}/**/*.ts'],
    tagName: 'subGql',
    addTypename: true,
  },
};
