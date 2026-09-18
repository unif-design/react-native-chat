import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import pkg from '../package.json';

const config: Config = {
  title: 'Unif Chat',
  tagline: '独立、可组合的 React Native 聊天组件',
  favicon: 'img/logo.png',
  url: 'https://unif-design.github.io',
  baseUrl: '/react-native-chat/',
  organizationName: 'unif-design',
  projectName: 'react-native-chat',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'throw' } },
  i18n: { defaultLocale: 'zh-Hans', locales: ['zh-Hans'] },
  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: { customCss: './src/css/custom.css' },
      } satisfies Preset.Options,
    ],
  ],
  plugins: ['./src/plugins/docusaurus-rnw'],
  clientModules: ['./src/clientModules/rn-globals.ts'],
  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Unif Chat',
      logo: { alt: 'Unif', src: 'img/logo.png' },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'componentsSidebar',
          position: 'left',
          label: '组件',
        },
        {
          type: 'docSidebar',
          sidebarId: 'compositionSidebar',
          position: 'left',
          label: '组合示例',
        },
        {
          href: 'https://unif-design.github.io/react-native-design/',
          position: 'left',
          label: 'Design',
        },
        {
          type: 'html',
          position: 'right',
          value: `<span class="navbar-version">v${pkg.version.split('.').slice(0, 2).join('.')}</span>`,
        },
        {
          href: 'https://github.com/unif-design/react-native-chat',
          position: 'right',
          label: 'GitHub',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: '开始使用',
          items: [
            { label: '组件概览', to: '/docs/components' },
            { label: '安装与宿主', to: '/docs/getting-started' },
          ],
        },
        {
          title: '组合示例',
          items: [
            { label: '主聊天', to: '/docs/composition/main-chat' },
            { label: '抽屉输入', to: '/docs/composition/drawer-input' },
          ],
        },
        {
          title: 'Unif 生态',
          items: [
            {
              label: 'Design',
              href: 'https://unif-design.github.io/react-native-design/',
            },
            {
              label: 'Camera',
              href: 'https://unif-design.github.io/react-native-camera/',
            },
            {
              label: 'HMS Scan',
              href: 'https://unif-design.github.io/react-native-hms-scan/',
            },
          ],
        },
      ],
      copyright: `${pkg.name} · MIT`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'tsx'],
    },
  } satisfies Preset.ThemeConfig,
};
export default config;
