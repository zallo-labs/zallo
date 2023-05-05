CREATE MIGRATION m1grgeaa6ssnbdgbcjns37tsjbsqbqkz4k577fifkct77zo3zp2uja
    ONTO m1xevnuqlppn37bev74oag6lxyjccmqzxglc6oupficj7n7y4zcvna
{
  CREATE SCALAR TYPE default::TargetSelector EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^*|(?:0x[0-9a-fA-F]{10})$');
  };
  CREATE TYPE default::Target {
      CREATE REQUIRED PROPERTY selectors -> array<default::TargetSelector>;
      CREATE REQUIRED PROPERTY to -> std::str {
          CREATE CONSTRAINT std::regexp('^*|(?:0x[0-9a-fA-F]{40}$)');
      };
  };
  DROP GLOBAL default::current_user;
  CREATE GLOBAL default::current_user_accounts_array -> array<std::uuid>;
  CREATE GLOBAL default::current_user_accounts := (SELECT
      std::array_unpack(GLOBAL default::current_user_accounts_array)
  );
  CREATE GLOBAL default::current_user_address -> default::Address;
  ALTER TYPE default::User {
      SET ABSTRACT;
      ALTER LINK contacts {
          CREATE PROPERTY alias -> default::Name;
      };
  };
  CREATE TYPE default::Account EXTENDING default::User {
      CREATE ACCESS POLICY members_only
          ALLOW SELECT, UPDATE, INSERT USING ((.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY implementation -> default::Address;
      CREATE REQUIRED PROPERTY isActive -> std::bool;
      CREATE REQUIRED PROPERTY salt -> default::Bytes32;
  };
  CREATE SCALAR TYPE default::uint16 EXTENDING std::int32 {
      CREATE CONSTRAINT std::max_value(((2 ^ 16) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Policy {
      CREATE REQUIRED LINK account -> default::Account;
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY key -> default::uint16;
  };
  CREATE ABSTRACT TYPE default::Permissions;
  CREATE TYPE default::PolicyState EXTENDING default::Permissions {
      CREATE REQUIRED LINK policy -> default::Policy;
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.policy.account.id IN GLOBAL default::current_user_accounts));
      CREATE MULTI LINK approvers -> default::User;
      CREATE REQUIRED PROPERTY threshold -> default::uint16;
  };
  CREATE TYPE default::Device EXTENDING default::User {
      CREATE ACCESS POLICY user_only
          ALLOW ALL USING ((.address ?= GLOBAL default::current_user_address));
      CREATE PROPERTY pushToken -> std::str;
  };
  CREATE ABSTRACT TYPE default::Proposal {
      CREATE REQUIRED LINK account -> default::Account;
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account.id IN GLOBAL default::current_user_accounts));
      CREATE MULTI LINK approvals -> default::User {
          CREATE PROPERTY createdAt -> std::datetime {
              SET default := (std::datetime_of_statement());
              SET readonly := true;
          };
          CREATE PROPERTY signature -> default::Bytes;
      };
      CREATE LINK policy -> default::Policy;
      CREATE REQUIRED PROPERTY hash -> default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE SCALAR TYPE default::TransferDirection EXTENDING enum<`In`, Out>;
  CREATE SCALAR TYPE default::uint256 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 256n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::TransferDetails {
      CREATE REQUIRED LINK account -> default::Account;
      CREATE REQUIRED PROPERTY amount -> default::uint256;
      CREATE REQUIRED PROPERTY direction -> default::TransferDirection;
      CREATE REQUIRED PROPERTY from -> default::Address;
      CREATE REQUIRED PROPERTY to -> default::Address;
      CREATE REQUIRED PROPERTY token -> default::Address;
  };
  CREATE TYPE default::Simulation {
      CREATE MULTI LINK transfers -> default::TransferDetails;
  };
  CREATE SCALAR TYPE default::uint64 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 64n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::TransactionProposal EXTENDING default::Proposal {
      CREATE REQUIRED LINK simulation -> default::Simulation;
      CREATE PROPERTY data -> default::Bytes;
      CREATE REQUIRED PROPERTY feeToken -> default::Address;
      CREATE REQUIRED PROPERTY gasLimit -> default::uint256 {
          SET default := 0n;
      };
      CREATE REQUIRED PROPERTY nonce -> default::uint64 {
          SET default := 0n;
      };
      CREATE REQUIRED PROPERTY to -> default::Address;
      CREATE PROPERTY value -> default::uint256;
  };
  DROP GLOBAL default::current_user_id;
  ALTER TYPE default::Account {
      CREATE MULTI LINK policies := (.<account[IS default::Policy]);
      CREATE MULTI LINK proposals := (.<account[IS default::Proposal]);
      CREATE MULTI LINK transactionProposals := (.<account[IS default::TransactionProposal]);
  };
  CREATE TYPE default::Transfer EXTENDING default::TransferDetails;
  ALTER TYPE default::Account {
      CREATE MULTI LINK transfers := (.<account[IS default::Transfer]);
  };
  CREATE SCALAR TYPE default::AbiSource EXTENDING enum<Verified, Asserted, Decompiled>;
  CREATE SCALAR TYPE default::Bytes4 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{10}$');
  };
  CREATE TYPE default::Function {
      CREATE REQUIRED PROPERTY selector -> default::Bytes4;
      CREATE INDEX ON (.selector);
      CREATE REQUIRED PROPERTY abi -> std::json;
      CREATE REQUIRED PROPERTY source -> default::AbiSource;
  };
  CREATE TYPE default::Contract {
      CREATE MULTI LINK functions -> default::Function;
      CREATE REQUIRED PROPERTY address -> default::Address {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Target {
      CREATE REQUIRED LINK permissions -> default::Permissions;
      CREATE CONSTRAINT std::exclusive ON ((.permissions, .to));
  };
  ALTER TYPE default::Permissions {
      CREATE MULTI LINK targets := (.<permissions[IS default::Target]);
  };
  ALTER TYPE default::Policy {
      CREATE LINK draft -> default::PolicyState;
      CREATE LINK state -> default::PolicyState;
      CREATE CONSTRAINT std::expression ON (EXISTS ((.state, .draft)));
      CREATE MULTI LINK stateHistory := (.<policy[IS default::PolicyState]);
  };
  CREATE TYPE default::Receipt {
      CREATE REQUIRED PROPERTY blockNumber -> std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY blockTimestamp -> std::datetime;
      CREATE PROPERTY response -> default::Bytes;
      CREATE REQUIRED PROPERTY success -> std::bool;
  };
  ALTER TYPE default::Transfer {
      CREATE REQUIRED LINK receipt -> default::Receipt;
  };
  ALTER TYPE default::Receipt {
      CREATE MULTI LINK transfers := (.<receipt[IS default::Transfer]);
  };
  CREATE SCALAR TYPE default::uint32 EXTENDING std::int64 {
      CREATE CONSTRAINT std::max_value(((2 ^ 32) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Transaction {
      CREATE LINK receipt -> default::Receipt;
      CREATE REQUIRED LINK proposal -> default::TransactionProposal;
      CREATE PROPERTY submittedAt -> std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY gasPrice -> default::uint32;
      CREATE REQUIRED PROPERTY hash -> default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::TransactionProposal {
      CREATE MULTI LINK transactions := (.<proposal[IS default::Transaction]);
      CREATE LINK transaction := (SELECT
          .transactions ORDER BY
              .submittedAt DESC
      LIMIT
          1
      );
  };
  CREATE SCALAR TYPE default::uint128 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 128n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
};
