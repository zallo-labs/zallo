import { ArgsType } from "@nestjs/graphql";
import { UUID } from "lib";
import { IdField } from "~/apollo/scalars/Id.scalar";

@ArgsType()
export class NodesArgs {
  @IdField()
  id: UUID;
}