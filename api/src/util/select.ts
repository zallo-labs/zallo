import { PrismaSelect } from "@paljs/plugins";
import { GraphQLResolveInfo } from "graphql";

export const getSelect = (info: GraphQLResolveInfo) => {
  const v = new PrismaSelect(info).value;
  return v && Object.keys(v.select).length ? v : undefined;
};