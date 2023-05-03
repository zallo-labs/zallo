CREATE MIGRATION m1xevnuqlppn37bev74oag6lxyjccmqzxglc6oupficj7n7y4zcvna
    ONTO initial
{
  CREATE FUTURE nonrecursive_access_policies;
  CREATE GLOBAL default::current_user_id -> std::uuid;
  CREATE SCALAR TYPE default::Address EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{40}$');
  };
  CREATE SCALAR TYPE default::Name EXTENDING std::str {
      CREATE CONSTRAINT std::max_len_value(50);
      CREATE CONSTRAINT std::min_len_value(1);
  };
  CREATE TYPE default::User {
      CREATE MULTI LINK contacts -> default::User;
      CREATE REQUIRED PROPERTY address -> default::Address {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name -> default::Name;
  };
  CREATE GLOBAL default::current_user := (SELECT
      default::User
  FILTER
      (.id = GLOBAL default::current_user_id)
  );
  CREATE SCALAR TYPE default::Bytes EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('0x(?:[0-9a-fA-F]{2})*$');
  };
  CREATE SCALAR TYPE default::Bytes32 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{64}$');
  };
};
