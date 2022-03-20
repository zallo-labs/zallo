import {
  Args,
  Field,
  Int,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { PrismaService } from "nestjs-prisma";
// import { UserWhereUniqueInput } from "@gen/user/user-where-unique.input";
import { UserWhereUniqueInput } from "../../../generated/user/user-where-unique.input";

@ObjectType()
export class Post {
  @Field(() => Int)
  id: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name: string | null;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => User)
  async user(@Args("email", { type: () => String }) email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  @ResolveField(() => [Post])
  async posts(@Parent() user: User) {
    return this.prisma.post.findMany({
      where: {
        authorId: user.id,
      },
    });
  }

  @Query(() => User)
  async user2(@Args("where") where: UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where,
    });
  }
}
