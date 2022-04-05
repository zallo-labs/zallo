import React from 'react';
import { Provider } from 'react-native-paper';

import { ChildrenProps } from '@util/provider';
import { THEME } from './theme';

export const PaperProvider = ({ children }: ChildrenProps) => (
  <Provider theme={THEME}>{children}</Provider>
);
