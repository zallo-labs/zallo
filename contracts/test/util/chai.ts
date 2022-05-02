import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import chaiAsPromised from 'chai-as-promised';

chai.use(solidity);
chai.use(chaiAsPromised); // chaiAsPromised needs to be added last!
export { expect } from 'chai';
