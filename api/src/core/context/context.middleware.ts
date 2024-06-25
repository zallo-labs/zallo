import { Injectable, NestMiddleware } from '@nestjs/common';
import { REQUEST_CONTEXT, getDefaultContext } from '.';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    REQUEST_CONTEXT.run(getDefaultContext(), next);
  }
}
