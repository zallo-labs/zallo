CREATE MIGRATION m16hokgml2p6ue3aicsota4ley2bqvvndv2wpe6vrisc5eed2agc6q
    ONTO m1a7kvlrgqwkenacn3q3n3hq3ecp7uo464wol3bdt27ud7ym47rzoq
{
  CREATE SCALAR TYPE default::uint224 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 224n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE SCALAR TYPE default::uint32 EXTENDING std::int64 {
      CREATE CONSTRAINT std::max_value(((2 ^ 32) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::TransferLimit {
      CREATE REQUIRED PROPERTY amount: default::uint224;
      CREATE REQUIRED PROPERTY duration: default::uint32;
      CREATE REQUIRED PROPERTY token: default::Address;
  };
  CREATE TYPE default::TransfersConfig {
      CREATE MULTI LINK limits: default::TransferLimit {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY budget: default::uint32;
      CREATE REQUIRED PROPERTY defaultAllow: std::bool {
          SET default := true;
      };
  };
  ALTER TYPE default::PolicyState {
      CREATE REQUIRED LINK transfers: default::TransfersConfig {
          SET REQUIRED USING (INSERT
              default::TransfersConfig
              {
                  budget := 0
              });
      };
  };
};
