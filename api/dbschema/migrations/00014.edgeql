CREATE MIGRATION m1uwjmryqrtxriotnspa3fwclcg4pobmdlsaif222f6e4fshqrp3ca
    ONTO m1gvb4a2b72qjurc6l6zrj5qghz6hhbpbitzl4qoazkqxnwqo2d3ta
{
  ALTER TYPE default::Transaction {
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.proposal.account.id IN GLOBAL default::current_user_accounts));
  };
};
