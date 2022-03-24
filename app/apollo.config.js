const { CONFIG } = require('lib/config');

module.exports = {
  client: {
    service: {
      name: 'metasafe-api',
      // service: "metasafe-api",  // Can only be used when the schema is uploaded; https://www.apollographql.com/docs/devtools/apollo-config/#option-1-use-the-apollo-schema-registry
      // url: 'https://metasafe-api.herokuapp.com/graphql',
      url: CONFIG.api.gqlUrl,
    },
    includes: ['**/gql/**/*.ts'],
    tagName: 'gql',
    addTypename: true,
  },
};
