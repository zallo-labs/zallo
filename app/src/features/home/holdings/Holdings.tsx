import { Box } from '@components/Box';
import { SurfaceContainer } from '@components/list/SurfaceContainer';
import { useExecute } from '@gql/queries/useExecute';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { ethers } from 'ethers';
import { address, createOp } from 'lib';
import useAsyncEffect from 'use-async-effect';
import { getTokenContract } from '~/token/token';
import { DAI, ETH, LINK, USDC, WBTC } from '~/token/tokens';
import { useTokenBalances } from '~/token/useTokenBalances';
import { Holding } from './Holding';
import { useProposeTx } from '@gql/queries/useProposeTx';

export const Holdings = () => {
  const { balances } = useTokenBalances();
  const { safe } = useSafe();
  const wallet = useWallet();

  const execute = useExecute();
  const propose = useProposeTx();

  useAsyncEffect(async () => {
    const usdcTransfer = createOp({
      to: address(USDC.addr),
      data: getTokenContract(USDC).interface.encodeFunctionData('transfer', [
        address(wallet.address),
        ethers.utils.parseUnits('6.28889', USDC.decimals),
      ]),
    });

    const daiTransfer = createOp({
      to: address(DAI.addr),
      data: getTokenContract(DAI).interface.encodeFunctionData('transfer', [
        address(wallet.address),
        ethers.utils.parseUnits('25', DAI.decimals),
      ]),
    });

    // await propose(usdcTransfer, daiTransfer);
    // await execute(usdcTransfer, daiTransfer);
  }, [safe, propose]);

  return (
    <SurfaceContainer separator={<Box my={2} />}>
      {balances.map(({ token }) => (
        <Holding key={token.symbol} token={token} />
      ))}
    </SurfaceContainer>
  );
};
