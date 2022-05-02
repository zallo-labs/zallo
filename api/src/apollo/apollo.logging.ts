import { Plugin } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener> {
    Logger.verbose('GQL: Request started');
    return {
      async willSendResponse() {
        Logger.verbose('GQL: Will send response');
      },
    };
  }
}
