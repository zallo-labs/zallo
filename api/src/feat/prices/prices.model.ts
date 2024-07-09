import Decimal from 'decimal.js';
import { DecimalField } from '~/common/scalars/Decimal.scalar';
import { CustomNode, CustomNodeType } from '~/common/decorators/interface.decorator';

@CustomNodeType()
export class Price extends CustomNode {
  @DecimalField()
  eth: Decimal;

  @DecimalField()
  ethEma: Decimal;

  @DecimalField()
  usd: Decimal;

  @DecimalField()
  usdEma: Decimal;
}
