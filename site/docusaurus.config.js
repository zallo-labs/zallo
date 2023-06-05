// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
require('dotenv').config({ path: '../.env' });

const FALLBACK_URL = '/';
const trackingID = process.env.SITE_TRACKING_ID;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zallo',
  tagline: 'Permission-based self-custodial smart account',
  url: process.env.URL || 'https://example.com',
  baseUrl: '/',
  favicon: 'img/favicon.png',
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
    'docusaurus-plugin-sass',
    'plugin-image-zoom',
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
            to: process.env.TWITTER || FALLBACK_URL,
            position: 'right',
            className: 'navbar__icon navbar__twitter',
          },
          {
            'aria-label': 'GitHub',
            to: process.env.GITHUB || FALLBACK_URL,
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
    privacyPolicyUrl: process.env.PRIVACY_POLICY_URL,
    googlePlayUrl: process.env.GOOGLE_PLAY_URL,
    appStoreUrl: process.env.APP_STORE_URL,
  },
};

module.exports = config;
