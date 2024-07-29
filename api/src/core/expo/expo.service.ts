import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk';
import { CONFIG } from '~/config';
import { DatabaseService } from '~/core/database';
import e from '~/edgeql-js';

@Injectable()
export class ExpoService {
  private expo = new Expo({ accessToken: CONFIG.expoToken });

  constructor(private db: DatabaseService) {}

  async sendNotification(messages: (Omit<ExpoPushMessage, 'to'> & { to: ExpoPushToken })[]) {
    if (!messages.length) return;

    const responses = (await this.expo.sendPushNotificationsAsync(messages)).map((message, i) => ({
      ticket: message,
      to: messages[i].to,
    }));

    // Remove push tokens for devices that are no longer registered
    const tokensToRemove = responses
      .filter(({ ticket: t }) => t.status === 'error' && t.details?.error === 'DeviceNotRegistered')
      .map((r) => r.to);

    if (tokensToRemove.length) {
      await e
        .update(e.ApproverDetails, (a) => ({
          filter: e.op(a.pushToken, 'in', e.set(...tokensToRemove)),
          set: { pushToken: null },
        }))
        .run(this.db.DANGEROUS_superuserClient);
    }
  }
}
