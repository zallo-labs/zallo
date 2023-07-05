CREATE MIGRATION m1jrkwbeti2p63badhtfxfyhnc62hu3tyg2r46ckfrijtzr4dmxgka
    ONTO initial
{
  CREATE SCALAR TYPE default::Bytes EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('0x(?:[0-9a-fA-F]{2})*$');
  };
  CREATE GLOBAL default::current_user_accounts_array -> array<std::uuid>;
  CREATE GLOBAL default::current_user_accounts := (SELECT
      std::array_unpack(GLOBAL default::current_user_accounts_array)
  );
  CREATE SCALAR TYPE default::Address EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{40}$');
  };
  CREATE GLOBAL default::current_approver_address -> default::Address;
  CREATE TYPE default::Receipt {
      CREATE REQUIRED PROPERTY responses: array<default::Bytes>;
      CREATE REQUIRED PROPERTY success: std::bool;
      CREATE REQUIRED PROPERTY block: std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY fee: std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY gasUsed: std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::Bytes4 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{8}$');
  };
  CREATE TYPE default::Target {
      CREATE REQUIRED PROPERTY defaultAllow: std::bool;
      CREATE REQUIRED PROPERTY functions: array<tuple<selector: default::Bytes4, allow: std::bool>>;
  };
  CREATE TYPE default::ContractTarget EXTENDING default::Target {
      CREATE REQUIRED PROPERTY contract: default::Address;
  };
  CREATE FUTURE nonrecursive_access_policies;
  CREATE SCALAR TYPE default::Label EXTENDING std::str {
      CREATE CONSTRAINT std::max_len_value(50);
      CREATE CONSTRAINT std::min_len_value(1);
  };
  CREATE TYPE default::Approver {
      CREATE REQUIRED PROPERTY address: default::Address {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name: default::Label;
      CREATE PROPERTY pushToken: std::str;
      CREATE ACCESS POLICY anyone_select_insert
          ALLOW SELECT, INSERT ;
  };
  CREATE GLOBAL default::current_approver := (<default::Approver>(SELECT
      default::Approver
  FILTER
      (.address = GLOBAL default::current_approver_address)
  ));
  CREATE TYPE default::User {
      CREATE PROPERTY name: default::Label;
  };
  ALTER TYPE default::Approver {
      CREATE REQUIRED LINK user: default::User {
          SET default := (INSERT
              default::User
          );
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
  };
  CREATE TYPE default::Contact {
      CREATE REQUIRED LINK user: default::User;
      CREATE REQUIRED PROPERTY address: default::Address;
      CREATE REQUIRED PROPERTY label: default::Label;
      CREATE CONSTRAINT std::exclusive ON ((.user, .label));
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK approvers := (.<user[IS default::Approver]);
      CREATE MULTI LINK contacts := (.<user[IS default::Contact]);
  };
  CREATE GLOBAL default::current_user := (SELECT
      (GLOBAL default::current_approver).user
  );
  CREATE ABSTRACT TYPE default::ProposalResponse {
      CREATE REQUIRED LINK approver: default::Approver;
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING (((.approver.user ?= GLOBAL default::current_user) OR (.approver ?= GLOBAL default::current_approver)));
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
  };
  CREATE TYPE default::Approval EXTENDING default::ProposalResponse {
      CREATE REQUIRED PROPERTY signature: default::Bytes;
  };
  ALTER TYPE default::Contact {
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user ?= GLOBAL default::current_user));
  };
  CREATE TYPE default::Rejection EXTENDING default::ProposalResponse;
  ALTER TYPE default::Approver {
      CREATE ACCESS POLICY user_select_update
          ALLOW SELECT, UPDATE USING ((.user ?= GLOBAL default::current_user));
  };
  CREATE SCALAR TYPE default::Bytes32 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{64}$');
  };
  CREATE ABSTRACT TYPE default::Proposal {
      CREATE REQUIRED LINK proposedBy: default::Approver {
          SET default := (SELECT
              default::Approver
          FILTER
              (.id = (GLOBAL default::current_approver).id)
          );
          SET readonly := true;
      };
      CREATE PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY label: default::Label;
  };
  ALTER TYPE default::ProposalResponse {
      CREATE REQUIRED LINK proposal: default::Proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  CREATE SCALAR TYPE default::uint256 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 256n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Operation {
      CREATE PROPERTY data: default::Bytes;
      CREATE REQUIRED PROPERTY to: default::Address;
      CREATE PROPERTY value: default::uint256;
  };
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK approvals := (.<proposal[IS default::Approval]);
  };
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK rejections := (.<proposal[IS default::Rejection]);
      CREATE MULTI LINK responses := (.<proposal[IS default::ProposalResponse]);
  };
  CREATE SCALAR TYPE default::TransactionProposalStatus EXTENDING enum<Pending, Executing, Successful, Failed>;
  CREATE SCALAR TYPE default::uint64 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 64n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::TransactionProposal EXTENDING default::Proposal {
      CREATE REQUIRED PROPERTY nonce: default::uint64;
      CREATE REQUIRED MULTI LINK operations: default::Operation {
          ON SOURCE DELETE DELETE TARGET;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY feeToken: default::Address;
      CREATE REQUIRED PROPERTY gasLimit: default::uint256 {
          SET default := 0n;
      };
  };
  CREATE TYPE default::Account {
      CREATE ACCESS POLICY members_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING ((.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY address: default::Address {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY implementation: default::Address;
      CREATE REQUIRED PROPERTY isActive: std::bool;
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE REQUIRED PROPERTY salt: default::Bytes32;
  };
  ALTER TYPE default::Proposal {
      CREATE REQUIRED LINK account: default::Account;
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account.id IN GLOBAL default::current_user_accounts));
  };
  ALTER TYPE default::ProposalResponse {
      CREATE ACCESS POLICY members_can_select
          ALLOW SELECT USING ((.proposal.account.id IN GLOBAL default::current_user_accounts));
      CREATE CONSTRAINT std::exclusive ON ((.proposal, .approver));
  };
  CREATE SCALAR TYPE default::uint32 EXTENDING std::int64 {
      CREATE CONSTRAINT std::max_value(((2 ^ 32) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Event {
      CREATE REQUIRED LINK account: default::Account;
      CREATE ACCESS POLICY members_can_select
          ALLOW SELECT USING ((.account.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY block: std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY logIndex: default::uint32;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY transactionHash: default::Bytes32;
      CREATE CONSTRAINT std::exclusive ON ((.block, .logIndex));
  };
  CREATE SCALAR TYPE default::TransferDirection EXTENDING enum<`In`, Out>;
  CREATE TYPE default::TransferDetails {
      CREATE REQUIRED LINK account: default::Account;
      CREATE REQUIRED PROPERTY amount: std::bigint;
      CREATE REQUIRED PROPERTY direction: default::TransferDirection;
      CREATE REQUIRED PROPERTY from: default::Address;
      CREATE REQUIRED PROPERTY to: default::Address;
      CREATE REQUIRED PROPERTY token: default::Address;
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.account.id IN GLOBAL default::current_user_accounts));
  };
  CREATE ABSTRACT TYPE default::Transferlike EXTENDING default::Event, default::TransferDetails;
  CREATE TYPE default::Transfer EXTENDING default::Transferlike;
  CREATE TYPE default::TransferApproval EXTENDING default::Transferlike {
      CREATE LINK previous := (SELECT
          default::TransferApproval FILTER
              (((.token = .token) AND (.from = .from)) AND (.to = .to))
          ORDER BY
              .block DESC THEN
              .logIndex DESC
      LIMIT
          1
      );
      CREATE REQUIRED PROPERTY delta := ((.amount - (.previous.amount ?? 0)));
  };
  CREATE TYPE default::Transaction {
      CREATE REQUIRED LINK proposal: default::TransactionProposal;
      CREATE LINK receipt: default::Receipt {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY submittedAt: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY gasPrice: default::uint256;
  };
  ALTER TYPE default::TransactionProposal {
      CREATE CONSTRAINT std::exclusive ON ((.account, .nonce));
  };
  ALTER TYPE default::Transaction {
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.proposal.account.id IN GLOBAL default::current_user_accounts));
  };
  CREATE SCALAR TYPE default::uint16 EXTENDING std::int32 {
      CREATE CONSTRAINT std::max_value(((2 ^ 16) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Policy {
      CREATE REQUIRED LINK account: default::Account;
      CREATE ACCESS POLICY members_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING ((.account.id IN GLOBAL default::current_user_accounts));
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE CONSTRAINT std::exclusive ON ((.account, .name));
      CREATE REQUIRED PROPERTY key: default::uint16;
      CREATE CONSTRAINT std::exclusive ON ((.account, .key));
  };
  ALTER TYPE default::Account {
      CREATE MULTI LINK policies := (.<account[IS default::Policy]);
  };
  CREATE TYPE default::TargetsConfig {
      CREATE MULTI LINK contracts: default::ContractTarget {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED LINK default: default::Target {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE SCALAR TYPE default::uint224 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 224n) - 1n));
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
  CREATE TYPE default::PolicyState {
      CREATE PROPERTY activationBlock: std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE MULTI LINK approvers: default::Approver;
      CREATE LINK proposal: default::TransactionProposal {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY isAccountInitState := (NOT (EXISTS (.proposal)));
      CREATE REQUIRED LINK targets: default::TargetsConfig;
      CREATE REQUIRED LINK transfers: default::TransfersConfig;
      CREATE REQUIRED PROPERTY isRemoved: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY threshold: default::uint16;
  };
  ALTER TYPE default::Policy {
      CREATE REQUIRED MULTI LINK stateHistory: default::PolicyState {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
          CREATE CONSTRAINT std::exclusive;
      };
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
      CREATE ACCESS POLICY can_be_deleted_when_inactive
          ALLOW DELETE USING (NOT (.isActive));
  };
  ALTER TYPE default::Approver {
      CREATE LINK accounts := (WITH
          id := 
              .id
      SELECT
          default::Account
      FILTER
          (id IN (.policies.state.approvers.id UNION .policies.draft.approvers.id))
      );
      CREATE CONSTRAINT std::exclusive ON ((.user, .name));
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
      CREATE LINK contact := (std::assert_single((WITH
          address := 
              .address
      SELECT
          default::Contact
      FILTER
          (.address = address)
      )));
      CREATE PROPERTY label := ((.contact.label ?? (((.user.name ++ ': ') ++ .name) IF (EXISTS (.user) AND EXISTS (.name)) ELSE <std::str>{})));
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK accounts := (SELECT
          DISTINCT (.approvers.accounts)
      );
  };
  ALTER TYPE default::Account {
      CREATE MULTI LINK approvers := (DISTINCT ((.policies.state.approvers UNION .policies.draft.approvers)));
      CREATE MULTI LINK proposals := (.<account[IS default::Proposal]);
      CREATE MULTI LINK transactionProposals := (.<account[IS default::TransactionProposal]);
      CREATE MULTI LINK transfers := (.<account[IS default::Transfer]);
  };
  ALTER TYPE default::Receipt {
      CREATE REQUIRED LINK transaction := (std::assert_exists(.<receipt[IS default::Transaction]));
      CREATE MULTI LINK events := (WITH
          txHash := 
              .transaction.hash
      SELECT
          default::Event
      FILTER
          (.transactionHash = txHash)
      );
  };
  ALTER TYPE default::PolicyState {
      CREATE LINK policy := (.<stateHistory[IS default::Policy]);
  };
  CREATE SCALAR TYPE default::AbiSource EXTENDING enum<Verified>;
  CREATE TYPE default::Function {
      CREATE REQUIRED PROPERTY selector: default::Bytes4;
      CREATE INDEX ON (.selector);
      CREATE REQUIRED PROPERTY abi: std::json;
      CREATE REQUIRED PROPERTY abiMd5: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY source: default::AbiSource;
  };
  CREATE TYPE default::Contract {
      CREATE MULTI LINK functions: default::Function;
      CREATE REQUIRED PROPERTY address: default::Address {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Proposal {
      CREATE LINK policy: default::Policy;
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
  CREATE TYPE default::Simulation {
      CREATE MULTI LINK transfers: default::TransferDetails;
  };
  ALTER TYPE default::TransactionProposal {
      CREATE REQUIRED LINK simulation: default::Simulation;
  };
};
