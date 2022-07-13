import { ReactNode } from 'react';

export interface ChildrenProps {
  children?: ReactNode;
}

export const getNodeKey = (node: ReactNode, index: number): string =>
  typeof node === 'object' && typeof (node as any)?.['key'] === 'string'
    ? (node as any)['key']
    : index.toString(36);
