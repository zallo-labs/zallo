// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
require('dotenv').config({ path: '../.env' });

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
          editUrl: `${repo}/tree/main/docs`,
        },
        blog: {
          showReadingTime: true,
          editUrl: `${repo}/tree/main/docs`,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  plugins: [
    [
      // https://www.npmjs.com/package/docusaurus-graphql-plugin
      'docusaurus-graphql-plugin',
      {
        schema: '../api/schema.gql',
        sidebar: {
          label: 'Reference',
          position: 6,
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
