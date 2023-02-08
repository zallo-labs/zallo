/*
 * Security
 */

/* User role */
-- Create a limitted role that will be used by the user
DO
$$
BEGIN
    IF NOT EXISTS (
        SELECT
        FROM   pg_catalog.pg_roles
        WHERE  rolname = 'user') THEN
        CREATE ROLE "user";
    END IF;
END
$$;

-- Schema permissions
GRANT USAGE ON SCHEMA public TO "user";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to "user";


/* User functions */
CREATE FUNCTION user_id() RETURNS text AS $$
    SELECT current_setting('user.id', true)::text;
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION user_id() TO "user";

CREATE FUNCTION is_user(userId text) RETURNS boolean AS $$
    SELECT userId = (SELECT current_setting('user.id', true));
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION is_user(text) TO "user";

CREATE FUNCTION user_accounts() RETURNS text[] AS $$
    SELECT current_setting('user.accounts', true)::text[];
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION user_accounts TO "user";

CREATE FUNCTION is_user_account(accountId text) RETURNS boolean AS $$
    SELECT accountId = ANY(user_accounts());
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION is_user_account(text) TO "user";



/* User */
GRANT SELECT ("id", "name"), INSERT, UPDATE ("name", "pushToken") ON "User" TO PUBLIC;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_view ON "User" FOR SELECT
    USING (true);

CREATE POLICY public_insert ON "User" FOR INSERT
    WITH CHECK (
        "name"      IS NULL AND
        "pushToken" IS NULL
    );

CREATE POLICY user_all ON "User" FOR ALL
    USING (is_user("id"));



/* Account */
GRANT SELECT, INSERT, UPDATE ON "Account" TO PUBLIC;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_all ON "Account" FOR ALL
    USING (is_user_account("id"));



/* Quorum */
GRANT SELECT, INSERT, UPDATE ("key", "name", "activeStateId") ON "Quorum" TO PUBLIC;
ALTER TABLE "Quorum" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_select ON "Quorum" FOR SELECT
    USING (is_user_account("accountId"));

CREATE POLICY account_member_insert ON "Quorum" FOR INSERT
    WITH CHECK (is_user_account("accountId"));

CREATE POLICY account_member_update ON "Quorum" FOR UPDATE
    USING (is_user_account("accountId"));

CREATE POLICY account_member_delete ON "Quorum" FOR DELETE
    USING (is_user_account("accountId") AND "activeStateId" IS NULL);



/* QuorumState */
GRANT SELECT, INSERT ON "QuorumState" TO PUBLIC;
ALTER TABLE "QuorumState" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "QuorumState" FOR ALL
    USING (is_user_account("accountId"));



/* Approver */
GRANT SELECT, INSERT ON "Approver" TO PUBLIC;
ALTER TABLE "Approver" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Approver" FOR ALL
    USING (is_user_account(
        (SELECT "accountId" FROM "QuorumState" WHERE "id" = "quorumStateId")
    ));



/* TokenLimit */
GRANT SELECT, INSERT ON "TokenLimit" TO PUBLIC;
ALTER TABLE "TokenLimit" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "TokenLimit" FOR ALL
    USING (is_user_account(
        (SELECT "accountId" FROM "QuorumState" WHERE "id" = "quorumStateId")
    ));



/* Proposal */
GRANT SELECT, INSERT, UPDATE, DELETE ON "Proposal" TO PUBLIC;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Proposal" FOR ALL
    USING (is_user_account("accountId"));



/* Transaction */
GRANT SELECT, INSERT ON "Transaction" TO PUBLIC;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Transaction" FOR ALL
    USING (is_user_account(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));



/* TransactionResponse */
GRANT SELECT ON "TransactionResponse" TO PUBLIC;



/* Approval */
GRANT SELECT, INSERT, UPDATE ("signature") ON "Approval" TO PUBLIC;
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_view ON "Approval" FOR SELECT
    USING (is_user_account(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));

CREATE POLICY user_insert ON "Approval" FOR INSERT
    WITH CHECK (is_user("userId"));

CREATE POLICY user_update ON "Approval" FOR UPDATE
    USING (is_user("userId"));



/* Contact */
GRANT SELECT, INSERT, UPDATE, DELETE ON "Contact" TO PUBLIC;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_all ON "Contact" FOR ALL
    USING (is_user("userId"));



/* ContractMethod */
GRANT SELECT, INSERT, UPDATE ON "ContractMethod" TO PUBLIC;



/* Comment */
GRANT SELECT, INSERT, UPDATE ("content") ON "Comment" TO PUBLIC;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_members_view ON "Comment" FOR SELECT
    USING (is_user_account("accountId"));

CREATE POLICY user_all ON "Comment" FOR ALL
    USING (is_user("authorId"));



/* Reaction */
GRANT SELECT, INSERT, UPDATE ("emojis"), DELETE ON "Reaction" TO PUBLIC;
ALTER TABLE "Reaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_members_view ON "Reaction" FOR SELECT
    USING (is_user_account(
        (SELECT "accountId" FROM "Comment" WHERE "id" = "commentId")
    ));

CREATE POLICY user_all ON "Reaction" FOR ALL
    USING (is_user("userId"));
