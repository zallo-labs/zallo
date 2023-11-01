CREATE MIGRATION m1bghqjm2x32q3hm5nyduxqeshjty3bfn72ekuqfpjw47jgajx3sfa
    ONTO m1s34xs3feijy2o7fvqa6rcy5ydmr3jzzeua2vovgwph3lxolevl2a
{
  ALTER TYPE default::Account {
      ALTER PROPERTY name {
          CREATE CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::regexp('^[0-9a-zA-Z$-]{4,40}$');
          SET TYPE std::str;
      };
      CREATE PROPERTY photoUri: std::str;
  };
  ALTER TYPE default::Approver {
      ALTER PROPERTY label {
          USING ((.contact.label ?? .name));
      };
  };
  ALTER TYPE default::User {
      CREATE LINK primaryAccount: default::Account;
  };
  ALTER TYPE default::User {
      DROP PROPERTY name;
  };
  ALTER TYPE default::User {
      DROP PROPERTY photoUri;
  };
};
