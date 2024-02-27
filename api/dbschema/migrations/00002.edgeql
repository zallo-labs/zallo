CREATE MIGRATION m1tc4i7mr63twt4gvkwrztplqrp2ihfidichhgh5i6dcxtib7xzdgq
    ONTO m12ykgwnroc4tsnxizm3dicg3hddqdyszia4j7zd226yhzaiozzm6a
{
  ALTER TYPE default::Approver {
      ALTER LINK cloud {
          DROP CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Approver {
      DROP LINK cloud;
  };
  ALTER TYPE default::Approver {
      CREATE PROPERTY cloud: tuple<provider: default::CloudProvider, subject: std::str>;
  };
  DROP TYPE default::CloudShare;
};
