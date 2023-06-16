CREATE MIGRATION m1jiosfjupvlpay2drc6pwoyazo44puv7fadyul264mqkid6epztdq
    ONTO initial
{
  CREATE SCALAR TYPE default::Bytes EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('0x(?:[0-9a-fA-F]{2})*$');
  };
  CREATE GLOBAL default::current_user_accounts_array -> array<std::uuid>;
  CREATE GLOBAL default::current_user_accounts := (SELECT
      std::array_unpack(GLOBAL default::current_user_accounts_array)
  );
  CREATE TYPE default::Receipt {
      CREATE REQUIRED PROPERTY responses -> array<default::Bytes>;
      CREATE REQUIRED PROPERTY success -> std::bool;
      CREATE REQUIRED PROPERTY block -> std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY fee -> std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY gasUsed -> std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY timestamp -> std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::TargetSelector EXTENDING std::str {
      CREATE CONSTRAINT std::regexp(r'^\*|(?:0x[0-9a-fA-F]{8})$');
  };
  CREATE TYPE default::Target {
      CREATE REQUIRED PROPERTY selectors -> array<default::TargetSelector>;
      CREATE REQUIRED PROPERTY to -> std::str {
          CREATE CONSTRAINT std::regexp(r'^\*|(?:0x[0-9a-fA-F]{40}$)');
      };
  };
  CREATE FUTURE nonrecursive_access_policies;
  CREATE SCALAR TYPE default::Address EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{40}$');
  };
  CREATE GLOBAL default::current_user_address -> default::Address;
  CREATE SCALAR TYPE default::Name EXTENDING std::str {
      CREATE CONSTRAINT std::max_len_value(50);
      CREATE CONSTRAINT std::min_len_value(1);
  };
  CREATE TYPE default::User {
      CREATE REQUIRED PROPERTY address -> default::Address {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name -> default::Name;
      CREATE PROPERTY pushToken -> std::str;
      CREATE ACCESS POLICY user_select_update
          ALLOW SELECT, UPDATE USING ((.address ?= GLOBAL default::current_user_address));
      CREATE ACCESS POLICY anyone_select_insert
          ALLOW SELECT, INSERT ;
  };
  CREATE TYPE default::Contact {
      CREATE REQUIRED LINK user -> default::User;
      CREATE REQUIRED PROPERTY name -> default::Name;
      CREATE CONSTRAINT std::exclusive ON ((.user, .name));
      CREATE REQUIRED PROPERTY address -> default::Address;
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK contacts := (.<user[IS default::Contact]);
  };
  CREATE GLOBAL default::current_user := (SELECT
      default::User
  FILTER
      (.address = GLOBAL default::current_user_address)
  );
  CREATE SCALAR TYPE default::Bytes32 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{64}$');
  };
  CREATE TYPE default::Account EXTENDING default::User {
      CREATE ACCESS POLICY deny_public_select
          DENY SELECT USING ((.id NOT IN GLOBAL default::current_user_accounts));
      CREATE ACCESS POLICY members_update
          ALLOW UPDATE USING ((.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY implementation -> default::Address;
      CREATE REQUIRED PROPERTY isActive -> std::bool;
      CREATE REQUIRED PROPERTY salt -> default::Bytes32;
  };
  CREATE ABSTRACT TYPE default::ProposalResponse {
      CREATE REQUIRED LINK user -> default::User;
      CREATE PROPERTY createdAt -> std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user.address ?= GLOBAL default::current_user_address));
  };
  CREATE TYPE default::Approval EXTENDING default::ProposalResponse {
      CREATE REQUIRED PROPERTY signature -> default::Bytes;
  };
  CREATE ABSTRACT TYPE default::Proposal {
      CREATE REQUIRED LINK account -> default::Account;
      CREATE REQUIRED LINK proposedBy -> default::User {
          SET default := (SELECT
              default::User
          FILTER
              (.address = GLOBAL default::current_user_address)
          );
          SET readonly := true;
      };
      CREATE PROPERTY createdAt -> std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY hash -> default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY label -> std::str {
          CREATE CONSTRAINT std::max_len_value(50);
          CREATE CONSTRAINT std::min_len_value(1);
      };
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account.id IN GLOBAL default::current_user_accounts));
  };
  ALTER TYPE default::ProposalResponse {
      CREATE REQUIRED LINK proposal -> default::Proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE ACCESS POLICY members_can_select
          ALLOW SELECT USING ((.proposal.account.id IN GLOBAL default::current_user_accounts));
      CREATE CONSTRAINT std::exclusive ON ((.proposal, .user));
  };
  CREATE TYPE default::Rejection EXTENDING default::ProposalResponse;
  CREATE SCALAR TYPE default::uint256 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 256n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Operation {
      CREATE PROPERTY data -> default::Bytes;
      CREATE REQUIRED PROPERTY to -> default::Address;
      CREATE PROPERTY value -> default::uint256;
  };
  CREATE TYPE default::Transaction {
      CREATE LINK receipt -> default::Receipt;
      CREATE REQUIRED PROPERTY submittedAt -> std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY gasPrice -> default::uint256;
      CREATE REQUIRED PROPERTY hash -> default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK approvals := (.<proposal[IS default::Approval]);
      CREATE MULTI LINK rejections := (.<proposal[IS default::Rejection]);
      CREATE MULTI LINK responses := (.<proposal[IS default::ProposalResponse]);
  };
  CREATE SCALAR TYPE default::TransferDirection EXTENDING enum<`In`, Out>;
  CREATE TYPE default::TransferDetails {
      CREATE REQUIRED LINK account -> default::Account;
      CREATE REQUIRED PROPERTY amount -> std::bigint;
      CREATE REQUIRED PROPERTY direction -> default::TransferDirection;
      CREATE REQUIRED PROPERTY from -> default::Address;
      CREATE REQUIRED PROPERTY to -> default::Address;
      CREATE REQUIRED PROPERTY token -> default::Address;
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.account.id IN GLOBAL default::current_user_accounts));
  };
  CREATE TYPE default::Simulation {
      CREATE MULTI LINK transfers -> default::TransferDetails;
  };
  CREATE SCALAR TYPE default::TransactionProposalStatus EXTENDING enum<Pending, Executing, Successful, Failed>;
  CREATE SCALAR TYPE default::uint64 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 64n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::TransactionProposal EXTENDING default::Proposal {
      CREATE REQUIRED PROPERTY nonce -> default::uint64;
      CREATE CONSTRAINT std::exclusive ON ((.account, .nonce));
      CREATE REQUIRED MULTI LINK operations -> default::Operation {
          ON SOURCE DELETE DELETE TARGET;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED LINK simulation -> default::Simulation;
      CREATE REQUIRED PROPERTY feeToken -> default::Address;
      CREATE REQUIRED PROPERTY gasLimit -> default::uint256 {
          SET default := 0n;
      };
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED LINK proposal -> default::TransactionProposal;
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.proposal.account.id IN GLOBAL default::current_user_accounts));
  };
  CREATE TYPE default::Transfer EXTENDING default::TransferDetails {
      CREATE LINK receipt -> default::Receipt;
      CREATE REQUIRED PROPERTY block -> std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY logIndex -> std::int32 {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE CONSTRAINT std::exclusive ON ((.block, .logIndex));
      CREATE REQUIRED PROPERTY timestamp -> std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::uint16 EXTENDING std::int32 {
      CREATE CONSTRAINT std::max_value(((2 ^ 16) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Policy {
      CREATE REQUIRED LINK account -> default::Account;
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY name -> default::Name;
      CREATE CONSTRAINT std::exclusive ON ((.account, .name));
      CREATE REQUIRED PROPERTY key -> default::uint16;
      CREATE CONSTRAINT std::exclusive ON ((.account, .key));
  };
  ALTER TYPE default::Contact {
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user.address ?= GLOBAL default::current_user_address));
  };
  CREATE TYPE default::PolicyState {
      CREATE PROPERTY activationBlock -> std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY createdAt -> std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE MULTI LINK approvers -> default::User;
      CREATE LINK proposal -> default::TransactionProposal {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY isAccountInitState := (NOT (EXISTS (.proposal)));
      CREATE MULTI LINK targets -> default::Target;
      CREATE REQUIRED PROPERTY isRemoved -> std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY threshold -> default::uint16;
  };
  ALTER TYPE default::Policy {
      CREATE REQUIRED MULTI LINK stateHistory -> default::PolicyState {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE LINK state := (SELECT
          (SELECT
              .stateHistory ORDER BY
                  .activationBlock DESC
          LIMIT
              1
          )
      FILTER
          EXISTS (.activationBlock)
      );
      CREATE PROPERTY isActive := (EXISTS (.state));
      CREATE ACCESS POLICY can_not_be_deleted_when_active
          DENY DELETE USING (.isActive);
      CREATE LINK draft := (SELECT
          (SELECT
              .stateHistory ORDER BY
                  .createdAt DESC
          LIMIT
              1
          )
      FILTER
          NOT (EXISTS (.activationBlock))
      );
  };
  ALTER TYPE default::PolicyState {
      CREATE LINK policy := (.<stateHistory[IS default::Policy]);
  };
  ALTER TYPE default::Receipt {
      CREATE MULTI LINK transfers := (.<receipt[IS default::Transfer]);
  };
  ALTER TYPE default::Account {
      CREATE MULTI LINK policies := (.<account[IS default::Policy]);
      CREATE MULTI LINK proposals := (.<account[IS default::Proposal]);
      CREATE MULTI LINK transactionProposals := (.<account[IS default::TransactionProposal]);
      CREATE MULTI LINK transfers := (.<account[IS default::Transfer]);
  };
  CREATE SCALAR TYPE default::AbiSource EXTENDING enum<Verified>;
  CREATE SCALAR TYPE default::Bytes4 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{8}$');
  };
  CREATE TYPE default::Function {
      CREATE REQUIRED PROPERTY selector -> default::Bytes4;
      CREATE INDEX ON (.selector);
      CREATE REQUIRED PROPERTY abi -> std::json;
      CREATE REQUIRED PROPERTY abiMd5 -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY source -> default::AbiSource;
  };
  CREATE TYPE default::Contract {
      CREATE MULTI LINK functions -> default::Function;
      CREATE REQUIRED PROPERTY address -> default::Address {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Proposal {
      CREATE LINK policy -> default::Policy;
  };
  ALTER TYPE default::TransactionProposal {
      CREATE MULTI LINK transactions := (.<proposal[IS default::Transaction]);
      CREATE LINK transaction := (SELECT
          .transactions ORDER BY
              .submittedAt DESC
      LIMIT
          1
      );
      CREATE REQUIRED PROPERTY status := (SELECT
          std::assert_exists(<default::TransactionProposalStatus>('Pending' IF NOT (EXISTS (.transaction)) ELSE ('Executing' IF NOT (EXISTS (.transaction.receipt)) ELSE ('Successful' IF .transaction.receipt.success ELSE 'Failed'))))
      );
  };
};
