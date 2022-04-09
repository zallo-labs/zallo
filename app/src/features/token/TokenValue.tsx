import { FC } from 'react';

import { BigNumber, ethers } from '@ethers';
import { Token } from './token';

export interface TokenValueProps {
  children: FC<{ value: string }>;
  token: Token;
  value: BigNumber;
}

export const TokenValue = ({ children: Child, token, value }: TokenValueProps) => (
  <Child value={`${ethers.utils.formatUnits(value, token.decimals)} ${token.symbol}`} />
);
