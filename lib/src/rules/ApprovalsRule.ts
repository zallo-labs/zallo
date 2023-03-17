import { BytesLike, defaultAbiCoder, recoverAddress } from 'ethers/lib/utils';
import { SignatureLike } from '@ethersproject/bytes';
import { Address, asAddress, compareAddress } from '../addr';
import { SignatureRule, RuleStruct, SignatureRuleIsSatisfiedOptions } from './rule';
import { Arraylike, toSet } from '../util/maybe';
import { asUint8 } from '../bigint';
import { tryOrIgnore } from '../util/try';
import { RuleSelector } from './RuleSelector';
import { ethers, providers } from 'ethers';
import { mapAsync } from '../util/arrays';

export class ApprovalsRule extends SignatureRule {
  private _approvers: Set<Address>;

  constructor(approvers: Arraylike<Address>) {
    super();

    this._approvers = toSet(approvers);
    if (this._approvers.size < 1) throw new Error('At least one approver is required');
  }

  get approvers(): Set<Address> {
    return this._approvers;
  }

  set approvers(approvers: Arraylike<Address>) {
    this._approvers = toSet(approvers);
  }

  get struct() {
    const approvers = [...this.approvers].sort(compareAddress);

    return {
      selector: asUint8(RuleSelector.Approvals),
      args: defaultAbiCoder.encode(['address[]'], [approvers]),
    };
  }

  static tryFromStruct(s: RuleStruct): ApprovalsRule | undefined {
    return tryOrIgnore(() => {
      if (s.selector !== RuleSelector.Approvals) return undefined;

      return new ApprovalsRule(defaultAbiCoder.decode(['address[]'], s.args)[0]);
    });
  }

  async isSatisfied({
    provider,
    digest,
    signatures,
  }: SignatureRuleIsSatisfiedOptions): Promise<boolean> {
    if (signatures.length !== this.approvers.size) return false;

    return (
      await mapAsync([...this.approvers].sort(compareAddress), async (approver, i) =>
        ApprovalsRule.isValidSignatureNow(provider, approver, digest, signatures[i]),
      )
    ).every((isValid) => isValid);
  }

  static async isValidSignatureNow(
    provider: providers.Provider,
    approver: Address,
    digest: BytesLike,
    signature: SignatureLike,
  ): Promise<boolean> {
    const isContract = (await provider.getCode(approver)).length > 0;
    if (isContract) {
      const contract = new ethers.Contract(
        approver,
        ['function isValidSignature(bytes32,bytes) view returns (bool)'],
        provider,
      );

      return contract.isValidSignature(digest, signature) === '0x1626ba7e';
    } else {
      return asAddress(recoverAddress(digest, signature)) === approver;
    }
  }
}
