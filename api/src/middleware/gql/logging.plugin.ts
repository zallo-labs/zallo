import { Plugin } from '@nestjs/apollo';
import { ApolloServerPlugin, GraphQLRequestListener } from 'apollo-server-plugin-base';

@Plugin()
export class LoggingPlugin implements ApolloServerPlugin {
  async requestDidStart(): Promise<GraphQLRequestListener> {
    console.log('GQL: Request started');
    return {
      async willSendResponse() {
        console.log('GQL: Will send response');
      },
    };
  }
}
