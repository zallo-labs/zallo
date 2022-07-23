import { Upgraded } from '../generated/Safe/Safe';
import { SafeImpl } from '../generated/schema';
import { getSafeImplId } from './id';
import { getOrCreateSafe } from './util';

export function handleUpgraded(e: Upgraded): void {
  const implId = getSafeImplId(e.params.implementation);
  let impl = SafeImpl.load(implId);
  if (!impl) {
    impl = new SafeImpl(implId);
    impl.blockHash = e.block.hash;
    impl.timestamp = e.block.timestamp;
    impl.save();
  }

  const safe = getOrCreateSafe(e.address);
  safe.impl = impl.id;
  safe.save();
}
