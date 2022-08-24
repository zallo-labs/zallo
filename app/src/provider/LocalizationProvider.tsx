import 'intl';
import { locale } from 'expo-localization';
import 'intl/locale-data/jsonp/en';
import { IntlProvider } from 'react-intl';
import { ReactNode } from 'react';

export interface LocalizatonProviderProps {
  children: ReactNode;
}

export const LocalizatonProvider = ({ children }: LocalizatonProviderProps) => (
  <IntlProvider locale={locale} defaultLocale="en-US">
    {children}
  </IntlProvider>
);
