CREATE MIGRATION m1qek7a23nqh42rms7kw536pjj74szxn437qw75exsqiml5k55qlja
    ONTO m1k3vtvlgbxrn6n7kipby46a6okbxajclyuvlps7djvck76yr4mfaq
{
  ALTER TYPE default::ProposalResponse {
      ALTER ACCESS POLICY anyone_select RENAME TO members_select;
  };
  ALTER TYPE default::ProposalResponse {
      ALTER ACCESS POLICY members_select USING (default::is_member(.proposal.account));
  };
};
