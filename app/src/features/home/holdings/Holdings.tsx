import { Box } from '@components/Box';
import { SurfaceContainer } from '@components/list/SurfaceContainer';
import { useExecute } from '@features/execute/useExecute';
import { createSt } from '@features/execute/util';
import { useSafe } from '@features/safe/SafeProvider';
import { useWallet } from '@features/wallet/useWallet';
import { ethers } from 'ethers';
import useAsyncEffect from 'use-async-effect';
import { getTokenContract } from '~/token/token';
import { DAI, ETH, LINK, USDC, WBTC } from '~/token/tokens';
import { useTokenBalance } from '~/token/useTokenBalance';
import { useTokenBalances } from '~/token/useTokenBalances';
import { Holding } from './Holding';

const token = USDC;

export const Holdings = () => {
  const { balances } = useTokenBalances();
  const { safe } = useSafe();
  const wallet = useWallet();

  const tokenBalance = useTokenBalance(token);
  const execute = useExecute();

  useAsyncEffect(async () => {
    const transferTx = createSt({
      to: token.addr,
      data: getTokenContract(token).interface.encodeFunctionData('transfer', [
        wallet.address,
        ethers.utils.parseUnits('18', token.decimals),
      ]),
    });

    // await execute(transferTx);
  }, [safe]);

  return (
    <SurfaceContainer separator={<Box my={2} />}>
      {balances.map(({ token }) => (
        <Holding key={token.symbol} token={token} />
      ))}
    </SurfaceContainer>
  );
};
