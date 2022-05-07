import 'intl';
import { locale } from 'expo-localization';
import 'intl/locale-data/jsonp/en';
import { IntlProvider } from 'react-intl';

import { ChildrenProps } from '@util/children';

export const LocalizatonProvider = ({ children }: ChildrenProps) => (
  <IntlProvider locale={locale} defaultLocale="en-US">
    {children}
  </IntlProvider>
);
