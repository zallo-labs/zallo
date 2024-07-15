import { PluginModule } from '@docusaurus/types';

const reactNativeWebPlugin: PluginModule = (_context, _options) => {
  return {
    name: 'docusaurus-plugin-react-native-web',
    configureWebpack() {
      return {
        resolve: {
          alias: {
            'react-native': 'react-native-web',
          },
        },
      };
    },
  };
};

export default reactNativeWebPlugin;
