import { DynamicModule, Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import fetch from "cross-fetch";
import { print } from "graphql";
import { stitchSchemas } from "@graphql-tools/stitch";
import { introspectSchema } from "@graphql-tools/wrap";
import { AsyncExecutor } from "@graphql-tools/utils";
import { SubschemaConfig } from "@graphql-tools/delegate";

const createRemoteExecutor =
  (url: string): AsyncExecutor =>
  async ({ document, variables, context }) => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: context?.authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: print(document), variables }),
    });

    return res.json();
  };

const createRemoteSchema = async (url: string): Promise<SubschemaConfig> => {
  const executor = createRemoteExecutor(url);
  return {
    executor,
    schema: await introspectSchema(executor),
  };
};

@Module({})
export class StitchedGqlModule {
  static forRootAsync(config: ApolloDriverConfig): DynamicModule {
    return GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: async () => ({
        ...config,
        transformAutoSchemaFile: true,
        transformSchema: async (schema) =>
          stitchSchemas({
            subschemas: [
              schema,
              await createRemoteSchema("https://api.thegraph.com/subgraphs/name/hbriese/metasafe"),
            ],
          }),
      }),
    });
  }
}
