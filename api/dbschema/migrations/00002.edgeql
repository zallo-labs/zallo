CREATE MIGRATION m1b6v3to67haboihjuqmcewsgw2bjto4lgntlfn3dalyhwwhbzyesq
    ONTO m1gjmxehn4f6y7yqblohu4yaipqgb3urzmivadpg354vid7wanzv4q
{
  ALTER TYPE default::Account {
      CREATE PROPERTY photo: default::Url;
  };
  ALTER TYPE default::Account {
      DROP PROPERTY photoUri;
  };
  ALTER TYPE default::Proposal {
      ALTER PROPERTY iconUri {
          RENAME TO icon;
      };
  };
  ALTER TYPE default::Token {
      DROP PROPERTY ethereumAddress;
  };
  ALTER TYPE default::Token {
      CREATE PROPERTY icon: default::Url;
  };
  ALTER TYPE default::Token {
      DROP PROPERTY iconUri;
  };
};
