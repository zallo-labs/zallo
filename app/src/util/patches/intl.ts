import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // Imports must be done in order of dependency tree - https://formatjs.io/docs/polyfills
  require('@formatjs/intl-getcanonicallocales/polyfill').default;
  require('@formatjs/intl-locale/polyfill').default;
  require('@formatjs/intl-pluralrules/polyfill').default;
  require('@formatjs/intl-pluralrules/locale-data/en').default;
  require('@formatjs/intl-numberformat/polyfill').default;
  require('@formatjs/intl-numberformat/locale-data/en').default;
  require('@formatjs/intl-datetimeformat/polyfill').default;
  require('@formatjs/intl-datetimeformat/locale-data/en').default;
  require('@formatjs/intl-datetimeformat/add-all-tz').default;
}
