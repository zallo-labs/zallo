const { CONFIG } = require('config');

module.exports = {
  client: {
    service: {
      name: 'api',
      url: CONFIG.api.gqlUrl,
    },
    includes: ['../**/*.ts'],
    tagName: 'apiGql',
    addTypename: true,
  },
};
