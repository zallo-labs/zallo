CREATE MIGRATION m162uluw73cwoo6yfgudvwlwzssygzxpbsezixtnkfgn5nyfkdhqha
    ONTO m1s34xs3feijy2o7fvqa6rcy5ydmr3jzzeua2vovgwph3lxolevl2a
{
  ALTER TYPE default::Account {
      ALTER PROPERTY name {
          RENAME TO label;
          SET TYPE std::str;
          CREATE CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::regexp('^[0-9a-zA-Z$-]{4,40}$');
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
