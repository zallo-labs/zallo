import { Injectable } from '@nestjs/common';
import { Expo } from 'expo-server-sdk';
import { CONFIG } from '~/config';

@Injectable()
export class ExpoService extends Expo {
  constructor() {
    super({ accessToken: CONFIG.expoToken });
  }
}
