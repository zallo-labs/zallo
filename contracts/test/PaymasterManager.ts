import { Address } from 'lib';
import { deploy } from './util';
import { abi } from './contracts/PaymasterManager';

describe('PaymasterManager', () => {
  let address: Address;

  before(async () => {
    address = (
      await deploy('PaymasterManager', {
        abi,
        constructorArgs: ['0x'],
      })
    ).address;
  });

  it('deploys', async () => {});
});
