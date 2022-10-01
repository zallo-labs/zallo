-- AlterTable
CREATE SEQUENCE "comment_id_seq";
ALTER TABLE "Comment" ALTER COLUMN "id" SET DEFAULT nextval('comment_id_seq');
ALTER SEQUENCE "comment_id_seq" OWNED BY "Comment"."id";

-- AlterTable
CREATE SEQUENCE "userconfig_id_seq";
ALTER TABLE "UserConfig" ALTER COLUMN "id" SET DEFAULT nextval('userconfig_id_seq');
ALTER SEQUENCE "userconfig_id_seq" OWNED BY "UserConfig"."id";

-- AlterTable
CREATE SEQUENCE "userstate_id_seq";
ALTER TABLE "UserState" ALTER COLUMN "id" SET DEFAULT nextval('userstate_id_seq');
ALTER SEQUENCE "userstate_id_seq" OWNED BY "UserState"."id";
