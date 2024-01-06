import { Injectable, OnModuleInit } from '@nestjs/common';
import { parseUnits } from 'viem';

import { CHAINS } from 'chains';
import { Address, asAddress, asChain, asUAddress, filterAsync, isEthToken, UAddress } from 'lib';
import { ERC20 } from 'lib/dapps';
import e from '~/edgeql-js';
import { and } from '~/features/database/database.util';
import { BalancesService } from '~/features/util/balances/balances.service';
import { NetworksService } from '~/features/util/networks/networks.service';
import { selectAccount } from '../accounts/accounts.util';
import { DatabaseService } from '../database/database.service';

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
          e.op('not', e.op('exists', t.user)),
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
      await network.useWallet(async (wallet) =>
        isEthToken(token.address)
          ? wallet.sendTransaction({
              to: asAddress(account),
              value: token.amount,
            })
          : wallet.writeContract({
              address: token.address,
              abi: ERC20,
              functionName: 'transfer',
              args: [asAddress(account), token.amount],
            }),
      );
    }

    return tokensToSend.map((t) => t.address);
  }

  private async getTokensToSend(account: UAddress) {
    if (!(await this.db.query(selectAccount(account)))) return [];

    const network = this.networks.get(account);
    if (!network.chain.testnet) return [];

    return (
      await filterAsync(this.tokens, async (token) => {
        if (asChain(token.address) !== network.chain.key) return false;

        const [recipientBalance, faucetBalance] = await Promise.all([
          this.balances.balance({ account, token: asAddress(token.address) }),
          this.balances.balance({
            account: network.walletAddress,
            token: asAddress(token.address),
          }),
        ]);

        return recipientBalance < token.amount && faucetBalance > token.amount;
      })
    ).map((t) => ({ ...t, address: asAddress(t.address) }));
  }
}
