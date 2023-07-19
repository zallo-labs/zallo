import { Injectable } from '@nestjs/common';
import { Address } from 'lib';
import { Price } from './prices.model';

@Injectable()
export class PricesService {
  async price(token: Address, ethereumAddress: Address | undefined): Promise<Price | null> {
    if (!ethereumAddress) return null;

    return {
      id: `Price::${token}`,
      token,
      current: 1,
    };
  }
}
