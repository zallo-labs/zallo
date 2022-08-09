import React, { ReactNode, useMemo } from 'react';

export interface ChildrenProps {
  children?: ReactNode;
}

export const getNodeKey = (node: ReactNode, index: number): string =>
  typeof node === 'object' && typeof (node as any)?.['key'] === 'string'
    ? (node as any)['key']
    : index.toString(36);

export const withKeys = (children: Parameters<typeof React.Children.map>[0]) =>
  React.Children.toArray(children)
    .filter(Boolean)
    .map((child, i) => (
      <React.Fragment key={getNodeKey(child, i)}>{child}</React.Fragment>
    ));

export const useWithKeys = (params: Parameters<typeof withKeys>) =>
  useMemo(() => withKeys(...params), [params]);
