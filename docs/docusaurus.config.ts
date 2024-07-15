import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

require('dotenv').config({ path: '../.env' });

const PLACEHOLDER_URL = 'https://example.com';
const REPO = process.env.GITHUB || PLACEHOLDER_URL;

const config: Config = {
  title: 'Zallo Documentation',
  tagline: 'Security that scales',
  favicon: 'img/favicon.png',
  url: process.env.DOCS_URL || PLACEHOLDER_URL,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          // editUrl: `${REPO}/tree/main/docs/`,
        },
        blog: false,
        // blog: {
        //   routeBasePath: '/blog',
        //   path: 'blog',
        //   showReadingTime: true,
        //   editUrl: `${REPO}/tree/main/blog/`,
        // },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Zallo',
      logo: {
        alt: 'My Site Logo',
        src: 'img/icon-m.svg',
        srcDark: 'img/icon-m-d.svg',
      },
      items: [
        /* Left */
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        // { to: '/blog', label: 'Blog', position: 'left' },
        /* Right */
        {
          href: REPO,
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'X / Twitter',
              href: process.env.TWITTER || PLACEHOLDER_URL,
            },
            {
              label: 'GitHub',
              href: REPO,
            },
          ],
        },
        {
          title: 'Legal',
          items: [
            {
              label: 'Privacy Policy',
              to: 'privacy',
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.palenight,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: ['./plugins/react-native-web.ts'],
};

export default config;
