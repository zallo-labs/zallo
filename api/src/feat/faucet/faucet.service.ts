import { Injectable, OnModuleInit } from '@nestjs/common';
import { Address, UAddress, asAddress, asChain, asUAddress, filterAsync, isEthToken } from 'lib';
import { NetworksService } from '~/core/networks/networks.service';
import { DatabaseService } from '../../core/database/database.service';
import e from '~/edgeql-js';
import { parseUnits } from 'viem';
import { ERC20 } from 'lib/dapps';
import { BalancesService } from '~/core/balances/balances.service';
import { and } from '~/core/database/database.util';
import { CHAINS } from 'chains';
import { getUserCtx } from '~/core/context';

@Injectable()
export class FaucetService implements OnModuleInit {
  private tokens: { address: UAddress; amount: bigint }[] = [];

  constructor(
    private networks: NetworksService,
    private db: DatabaseService,
    private balances: BalancesService,
  ) {}

  async onModuleInit() {
    const tokens = await this.db.query(
      e.select(e.Token, (t) => ({
        filter: and(
          t.isSystem,
          e.op(
            t.chain,
            'in',
            e.set(
              ...Object.values(CHAINS)
                .filter((c) => c.testnet)
                .map((c) => c.key),
            ),
          ),
        ),
        address: true,
        decimals: true,
      })),
    );

    this.tokens = tokens.map((t) => ({
      address: asUAddress(t.address),
      amount: parseUnits(isEthToken(asAddress(t.address)) ? '0.01' : '1', t.decimals),
    }));
  }

  async requestableTokens(account: UAddress): Promise<Address[]> {
    return (await this.getTokensToSend(account)).map((token) => token.address);
  }

  async requestTokens(account: UAddress): Promise<Address[]> {
    const tokensToSend = await this.getTokensToSend(account);

    const network = this.networks.get(account);
    for (const token of tokensToSend) {
      await network.useWallet(async (wallet) => {
        await (isEthToken(token.address)
          ? wallet.sendTransaction({
              to: asAddress(account),
              value: token.amount,
            })
          : wallet.writeContract({
              address: token.address,
              abi: ERC20,
              functionName: 'transfer',
              args: [asAddress(account), token.amount],
            }));
      });
    }

    return tokensToSend.map((t) => t.address);
  }

  private async getTokensToSend(account: UAddress) {
    if (!getUserCtx().accounts.some((a) => a.address === account)) return [];

    const network = this.networks.get(account);
    if (!network.chain.testnet) return [];

    return (
      await filterAsync(this.tokens, async (token) => {
        if (asChain(token.address) !== network.chain.key) return false;

        const [recipientBalance, faucetBalance] = await Promise.all([
          this.balances.balance({ account, token: token.address }),
          this.balances.balance({
            account: network.walletAddress,
            token: token.address,
          }),
        ]);

        return recipientBalance < token.amount && faucetBalance > token.amount;
      })
    ).map((t) => ({ ...t, address: asAddress(t.address) }));
  }
}
