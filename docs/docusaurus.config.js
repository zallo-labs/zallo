// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
require('dotenv-vault-core').config({ path: '../.env' });

const repo = 'https://github.com/zallo-labs/zallo';
const twitter = 'https://twitter.com/zallo-labs';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zallo',
  tagline: 'A self-custodial smart wallet',
  url: 'https://docs.zallo.io/',
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
          // editUrl: `${repo}/tree/main/docs`,     // Adds edit button
        },
        blog: {
          showReadingTime: true,
          remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
          // editUrl: `${repo}/tree/main/docs`,     // Adds edit button
        },
        pages: {
          remarkPlugins: [require('@docusaurus/remark-plugin-npm2yarn')],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
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
          {
            label: 'Docs',
            type: 'doc',
            docId: 'getting-started',
            position: 'left',
          },
          {
            label: 'Blog',
            to: '/blog',
            position: 'left',
          },
          {
            label: 'Playground',
            to: '/playground',
            position: 'left',
          },
          {
            label: 'Twitter',
            href: twitter,
            position: 'right',
          },
          {
            label: 'GitHub',
            href: repo,
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting started',
                to: '/docs/getting-started',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Twitter',
                href: twitter,
              },
              {
                label: 'GitHub',
                href: repo,
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Landing page',
                href: 'https://zallo.io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Zallo`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  customFields: {
    apolloGraphRef: process.env.APOLLO_GRAPH_REF,
    feedbackEmail: 'feedback@zallo.io',
    supportEmail: 'support@zall.io',
  },
};

module.exports = config;
