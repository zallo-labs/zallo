CREATE MIGRATION m1kvjsal3knijeo6s4lggvatpwllo3qjv5gfg72ceg36hrhzwoxemq
    ONTO m162uluw73cwoo6yfgudvwlwzssygzxpbsezixtnkfgn5nyfkdhqha
{
  ALTER TYPE default::Account {
      ALTER PROPERTY label {
          SET TYPE std::str;
      };
  };
  # Add new Action(s) to PolicyState
  CREATE TYPE default::ActionFunction {
      CREATE PROPERTY abi: std::json;
      CREATE PROPERTY contract: default::Address;
      CREATE PROPERTY selector: default::Bytes4;
  };
  CREATE TYPE default::Action {
      CREATE REQUIRED MULTI LINK functions: default::ActionFunction;
      CREATE REQUIRED PROPERTY allow: std::bool;
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY label: default::Label;
  };
  ALTER TYPE default::PolicyState {
      CREATE MULTI LINK actions: default::Action;
  };
  # Migrate PolicyState TargetsConfig -> Action(s)
  update PolicyState set {
  actions := (
    with targets := .targets
    select assert_distinct(
      (
        # Contract: *, selectors: *
        for _ in (select () filter targets.default.defaultAllow) union (
          insert Action {
            label := "Anything else",
            functions := (insert ActionFunction {}),
            allow := true
          }
        )
      )
      union
      (
        # Contract: *, selectors
        for f in array_unpack((targets.default.functions)) union (
          insert Action {
            label := f.selector,
            functions := (
              insert ActionFunction {
                selector := f.selector
              }
            ),
            allow := f.allow
          }
        )
      )
      union
      (
        # Contract, selectors: *
        for c in targets.contracts union (
          for _ in (select () filter c.defaultAllow) union (
            insert Action {
              label := c.contract[0:7] ++ ": anything else",
              functions := (insert ActionFunction { contract := c.contract }),
              allow := c.defaultAllow
            }
          )
        )
      )
      union
      (
        # Contract, selectors
        for c in targets.contracts union (
          for f in array_unpack(c.functions) union (
            insert Action {
              label := c.contract[0:7] ++ f.selector,
              functions := (insert ActionFunction { contract := c.contract, selector := f.selector }),
              allow := f.allow
            }
          )
        )
      )
    )
  )
};
  # Remove TargetsConfig from PolicyState
  ALTER TYPE default::PolicyState {
      DROP LINK targets;
  };
  ALTER TYPE default::TargetsConfig {
      DROP LINK contracts;
      DROP LINK default;
  };
  DROP TYPE default::TargetsConfig;
  ALTER TYPE default::ContractTarget {
      DROP PROPERTY contract;
  };
  DROP TYPE default::ContractTarget;
  ALTER TYPE default::Target {
      DROP PROPERTY functions;
      DROP PROPERTY defaultAllow;
  };
  DROP TYPE default::Target;
};
