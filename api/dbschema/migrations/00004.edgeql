CREATE MIGRATION m1l2n4yt6k72ya6cwtr32ekm7ntwvkt4s7mkz5cujgczglsvwfqrma
    ONTO m1zaryj3jsbcl4rt3h742emcgbpcyhroyd2dmhcpt2yl7sk6dc4vaa
{
  CREATE TYPE default::Token {
      CREATE PROPERTY units: array<tuple<symbol: default::Label, decimals: default::uint16>>;
      CREATE LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
      };
      CREATE ACCESS POLICY anyone_select_allowlisted
          ALLOW SELECT USING (NOT (EXISTS (.user)));
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user ?= GLOBAL default::current_user));
      CREATE REQUIRED PROPERTY testnetAddress: default::Address;
      CREATE CONSTRAINT std::exclusive ON ((.user, .testnetAddress));
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE CONSTRAINT std::exclusive ON ((.user, .name));
      CREATE REQUIRED PROPERTY symbol: default::Label;
      CREATE CONSTRAINT std::exclusive ON ((.user, .symbol));
      CREATE REQUIRED PROPERTY decimals: default::uint16;
      CREATE PROPERTY ethereumAddress: default::Address;
      CREATE PROPERTY iconUri: std::str;
  };
};
