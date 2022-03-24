const { CONFIG } = require('lib/config');

module.exports = {
  client: {
    service: {
      // service can only be used when the schema is uploaded; https://www.apollographql.com/docs/devtools/apollo-config/#option-1-use-the-apollo-schema-registry
      // service: "metasafe-api",
      name: 'metasafe-api',
      url: CONFIG.api.gqlUrl,
    },
    includes: ['**/gql/**/*.ts'],
    tagName: 'gql',
    addTypename: true,
  },
};
