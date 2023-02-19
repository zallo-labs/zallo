// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
require('dotenv-vault-core').config({ path: '../.env' });

const trackingID = process.env.SITE_TRACKING_ID;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zallo',
  tagline: 'A self-custodial smart wallet for teams',
  url: process.env.URL || '',
  baseUrl: '/',
  favicon: 'img/icon-rounded@64.png',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [[require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }]],
        },
        pages: {
          remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.scss'),
        },
        ...(trackingID && { gtag: { trackingID, anonymizeIP: true } }),
      }),
    ],
  ],

  plugins: [
    [
      '@graphql-markdown/docusaurus',
      {
        baseURL: 'reference/schema',
        linkRoot: '/docs',
        schema: '../api/schema.graphql',
        docOptions: {
          index: true,
          pagination: false,
          toc: false,
        },
        loaders: {
          GraphQLFileLoader: '@graphql-tools/graphql-file-loader',
        },
      },
    ],
    'plugin-image-zoom',
    'docusaurus-plugin-sass',
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Zallo',
        logo: {
          alt: 'Zallo Logo',
          src: 'img/icon-rounded.svg',
        },
        items: [
          // Leading
          {
            label: 'Docs',
            type: 'doc',
            docId: 'getting-started',
            position: 'left',
            className: 'navbar__item--leading',
          },
          {
            label: 'Playground',
            to: '/playground',
            position: 'left',
            className: 'navbar__item--leading',
          },
          // Trailing
          {
            'aria-label': 'Twitter',
            to: process.env.TWITTER_PROFILE,
            position: 'right',
            className: 'navbar__icon navbar__twitter',
          },
          {
            'aria-label': 'GitHub repo',
            to: process.env.GITHUB_REPO,
            position: 'right',
            className: 'navbar__icon navbar__github',
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      imageZoom: {
        // https://github.com/flexanalytics/plugin-image-zoom
        options: {
          // https://www.npmjs.com/package/medium-zoom#options
          margin: 48,
        },
      },
    }),

  customFields: {
    apolloGraphRef: process.env.APOLLO_GRAPH_REF,
    apiUrl: process.env.API_URL,
  },
};

module.exports = config;
