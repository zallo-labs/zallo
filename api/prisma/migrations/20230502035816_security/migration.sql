/*
 * Security
 */

/* User role */
-- Create a limitted role that will be used by the user
-- Create roles: system & user
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


-- Functions
CREATE FUNCTION user_id() RETURNS text AS $$
    SELECT current_setting('user.id', true)::text;
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION user_id() TO "user";

CREATE FUNCTION is_system() RETURNS boolean AS $$
    SELECT user_id() IS NULL;
$$ LANGUAGE SQL;


CREATE FUNCTION is_user(userId text) RETURNS boolean AS $$
    SELECT userId = (SELECT current_setting('user.id', true));
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION is_user(text) TO "user";

CREATE FUNCTION user_accounts() RETURNS text[] AS $$
    SELECT current_setting('user.accounts', true)::text[];
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION user_accounts TO "user";

CREATE FUNCTION can_access_account(accountId text) RETURNS boolean AS $$
    SELECT accountId = ANY(user_accounts()) OR accountId IS NULL OR is_system();
$$ LANGUAGE SQL;
GRANT EXECUTE ON FUNCTION can_access_account(text) TO "user";



/* User */
GRANT SELECT, INSERT, UPDATE ("name", "pushToken") ON "User" TO PUBLIC;
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

CREATE POLICY member_select ON "Account" FOR SELECT
    USING (can_access_account("id"));

CREATE POLICY member_insert ON "Account" FOR INSERT
    WITH CHECK (true);

CREATE POLICY member_update ON "Account" FOR UPDATE
    USING (can_access_account("id"));



/* Policy */
GRANT SELECT, INSERT, UPDATE ("key", "name", "activeId", "draftId") ON "Policy" TO PUBLIC;
ALTER TABLE "Policy" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_select ON "Policy" FOR SELECT
    USING (can_access_account("accountId"));

CREATE POLICY account_member_insert ON "Policy" FOR INSERT
    WITH CHECK (can_access_account("accountId"));

CREATE POLICY account_member_update ON "Policy" FOR UPDATE
    USING (can_access_account("accountId"));

CREATE POLICY account_member_delete ON "Policy" FOR DELETE
    USING (can_access_account("accountId") AND "activeId" IS NULL);



/* PolicyState */
GRANT SELECT, INSERT ON "PolicyState" TO PUBLIC;
ALTER TABLE "PolicyState" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "PolicyState" FOR ALL
    USING (can_access_account("accountId"));



/* Approver */
GRANT SELECT, INSERT ON "Approver" TO PUBLIC;
ALTER TABLE "Approver" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Approver" FOR ALL
    USING (can_access_account(
        (SELECT "accountId" FROM "PolicyState" WHERE "id" = "stateId")
    ));



/* Target */
GRANT SELECT, INSERT ON "Target" TO PUBLIC;
ALTER TABLE "Target" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Target" FOR ALL
    USING (can_access_account(
        (SELECT "accountId" FROM "PolicyState" WHERE "id" = "stateId")
    ));


/* Proposal */
GRANT SELECT, INSERT, UPDATE, DELETE ON "Proposal" TO PUBLIC;
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Proposal" FOR ALL
    USING (can_access_account("accountId"));



/* Transaction */
GRANT SELECT, INSERT ON "Transaction" TO PUBLIC;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Transaction" FOR ALL
    USING (can_access_account(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));



/* TransactionReceipt */
GRANT SELECT, INSERT ON "TransactionReceipt" TO PUBLIC;



/* Transfer */
GRANT SELECT, INSERT ON "Transfer" TO PUBLIC;

CREATE POLICY account_member_all ON "Transfer" FOR ALL
    USING (can_access_account("accountId"));



/* Simulation */
GRANT SELECT, INSERT, DELETE ON "Simulation" TO PUBLIC;
ALTER TABLE "Simulation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "Simulation" FOR ALL
    USING (can_access_account(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));



/* SimulatedTransfer */
GRANT SELECT, INSERT, DELETE ON "SimulatedTransfer" TO PUBLIC;
ALTER TABLE "SimulatedTransfer" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_all ON "SimulatedTransfer" FOR ALL
    USING (can_access_account(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));



/* Approval */
GRANT SELECT, INSERT, UPDATE ("signature") ON "Approval" TO PUBLIC;
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_member_view ON "Approval" FOR SELECT
    USING (can_access_account(
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



/* Contract */
GRANT SELECT, INSERT, UPDATE ON "Contract" TO PUBLIC;



/* ContractFunction */
GRANT SELECT, INSERT, UPDATE ON "ContractFunction" TO PUBLIC;



/* Comment */
GRANT SELECT, INSERT, UPDATE ("content") ON "Comment" TO PUBLIC;
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_members_view ON "Comment" FOR SELECT
    USING (can_access_account("accountId"));

CREATE POLICY user_all ON "Comment" FOR ALL
    USING (is_user("authorId"));



/* Reaction */
GRANT SELECT, INSERT, UPDATE ("emojis"), DELETE ON "Reaction" TO PUBLIC;
ALTER TABLE "Reaction" ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_members_view ON "Reaction" FOR SELECT
    USING (can_access_account(
        (SELECT "accountId" FROM "Comment" WHERE "id" = "commentId")
    ));

CREATE POLICY user_all ON "Reaction" FOR ALL
    USING (is_user("userId"));
