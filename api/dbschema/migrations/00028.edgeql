CREATE MIGRATION m1uccugc4h6k2bppctf34toayrn2gmmvfn22f77mvpzrudrzcirj7q
    ONTO m1ltit76m3dki4tixcyjxlzlcil27yag5depkcrr6sarp2hf3c7f6a
{
  CREATE GLOBAL default::current_accounts := (SELECT
      <default::Account>(SELECT
          std::array_unpack(GLOBAL default::current_user_accounts_array)
      )
  );
  ALTER TYPE default::ProposalResponse {
      ALTER ACCESS POLICY members_can_select USING ((.proposal.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::Event {
      ALTER ACCESS POLICY members_can_select USING ((.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::Transaction {
      ALTER ACCESS POLICY members_can_select_insert USING ((.proposal.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::TransferDetails {
      ALTER ACCESS POLICY members_can_select_insert USING ((.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::Proposal {
      ALTER ACCESS POLICY members_only USING ((.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::Policy {
      ALTER ACCESS POLICY members_select_insert_update USING ((.account IN GLOBAL default::current_accounts));
  };
};
