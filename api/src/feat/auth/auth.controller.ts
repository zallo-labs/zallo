import { Controller, Get, Request as RequestDec } from '@nestjs/common';
import { Request } from 'express';
import { generateSiweNonce } from 'viem/siwe';

import { Public } from '~/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  @Public()
  @Get('nonce')
  nonce(@RequestDec() req: Request): string {
    if (
      !req.session.nonce ||
      (req.session.cookie.expires && req.session.cookie.expires <= new Date())
    ) {
      req.session.nonce = generateSiweNonce();
    }

    return req.session.nonce;
  }
}
