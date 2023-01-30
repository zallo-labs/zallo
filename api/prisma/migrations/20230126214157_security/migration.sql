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

GRANT USAGE ON SCHEMA public TO "user";


/* User functions */
CREATE FUNCTION user_id() RETURNS text AS $$
    SELECT current_setting('user.id', true);
$$ LANGUAGE SQL;

CREATE FUNCTION is_user(userId text) RETURNS boolean AS $$
    SELECT userId = (SELECT current_setting('user.id', true));
$$ LANGUAGE SQL;

CREATE FUNCTION is_account_member(accountId text) RETURNS boolean AS $$
    SELECT accountId = ANY((SELECT current_setting('user.accounts', true))::text[]);
$$ LANGUAGE SQL;



/* User */
GRANT SELECT, INSERT, UPDATE ("name", "pushToken") ON "User" TO "user";
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Public can only INSERT the id
CREATE POLICY public_insert ON "User" FOR INSERT 
    WITH CHECK (
        "name"      IS NULL AND
        "pushToken" IS NULL
    );

-- User can do anything to themself
CREATE POLICY user_all ON "User" FOR ALL
    USING (is_user("id"));



/* Account */
GRANT SELECT, INSERT, UPDATE ON "Account" TO "user";
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_insert ON "Account" FOR INSERT;

CREATE POLICY member_view_or_update ON "Account" FOR UPDATE
    USING (is_account_member("id"));


/* Quorum */
GRANT SELECT, INSERT, UPDATE ("key", "name", "activeStateId") ON "Quorum" TO "user";
ALTER TABLE "Quorum" ENABLE ROW LEVEL SECURITY;

-- Account member can do anything
CREATE POLICY account_member_all ON "Quorum" FOR ALL
    USING (is_account_member("accountId"));



/* QuorumState */
GRANT SELECT, INSERT ON "QuorumState" TO "user";
ALTER TABLE "QuorumState" ENABLE ROW LEVEL SECURITY;

-- Account member can do anything
CREATE POLICY account_member_all ON "QuorumState" FOR ALL
    USING (is_account_member("accountId"));



/* Approver */
GRANT SELECT, INSERT ON "Approver" TO "user";
ALTER TABLE "Approver" ENABLE ROW LEVEL SECURITY;

-- Account member can do anything
CREATE POLICY account_member_all ON "Approver" FOR ALL
    USING (is_account_member(
        (SELECT "accountId" FROM "QuorumState" WHERE "id" = "quorumStateId")
    ));



/* TokenLimit */
GRANT SELECT, INSERT ON "TokenLimit" TO "user";
ALTER TABLE "TokenLimit" ENABLE ROW LEVEL SECURITY;

-- Account member can do anything
CREATE POLICY account_member_all ON "TokenLimit" FOR ALL
    USING (is_account_member(
        (SELECT "accountId" FROM "QuorumState" WHERE "id" = "quorumStateId")
    ));



/* Proposal */
GRANT SELECT, INSERT, UPDATE, DELETE ON "Proposal" TO "user";
ALTER TABLE "Proposal" ENABLE ROW LEVEL SECURITY;

-- Account members can access
CREATE POLICY account_member_all ON "Proposal" FOR ALL
    USING (is_account_member("accountId"));



/* Transaction */
GRANT SELECT, INSERT ON "Transaction" TO "user";
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;

-- Account member can do anything
CREATE POLICY account_member_all ON "Transaction" FOR ALL
    USING (is_account_member(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));



/* TransactionResponse */
GRANT SELECT ON "TransactionResponse" TO "user";



/* Approval */
GRANT SELECT, INSERT, UPDATE ("signature") ON "Approval" TO "user";
ALTER TABLE "Approval" ENABLE ROW LEVEL SECURITY;

-- Account members can view
CREATE POLICY account_member_view ON "Approval" FOR SELECT
    USING (is_account_member(
        (SELECT "accountId" FROM "Proposal" WHERE "id" = "proposalId")
    ));

-- User can INSERT | UPDATE
CREATE POLICY user_update ON "Approval" FOR UPDATE
    USING (is_user("userId"));



/* Contact */
GRANT SELECT, INSERT, UPDATE, DELETE ON "Contact" TO "user";
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;

-- User can do anything
CREATE POLICY user_all ON "Contact" FOR ALL
    USING (is_user("userId"));



/* ContractMethod */
GRANT SELECT, INSERT, UPDATE ON "ContractMethod" TO "user";



/* Comment */
GRANT SELECT, INSERT, UPDATE ("content") ON "Comment" TO "user";
ALTER TABLE "Comment" ENABLE ROW LEVEL SECURITY;

-- Account members can view
CREATE POLICY account_members_view ON "Comment" FOR SELECT
    USING (is_account_member("accountId"));

-- Author can do anything
CREATE POLICY user_all ON "Comment" FOR ALL
    USING (is_user("authorId"));



/* Reaction */
GRANT SELECT, INSERT, UPDATE ("emojis"), DELETE ON "Reaction" TO "user";
ALTER TABLE "Reaction" ENABLE ROW LEVEL SECURITY;

-- Account members can view
CREATE POLICY account_members_view ON "Reaction" FOR SELECT
    USING (is_account_member(
        (SELECT "accountId" FROM "Comment" WHERE "id" = "commentId")
    ));

-- Author can do anything
CREATE POLICY user_all ON "Reaction" FOR ALL
    USING (is_user("userId"));
