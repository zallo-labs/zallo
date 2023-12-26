CREATE MIGRATION m1zqbhlsxnhu2qno6qeatcqq2qeznqcio4mpjmxqzhlq757c5l7hfa
    ONTO initial
{
  CREATE SCALAR TYPE default::ApprovalIssue EXTENDING enum<HashMismatch, Expired>;
  CREATE GLOBAL default::current_accounts_array -> array<std::uuid>;
  CREATE GLOBAL default::current_accounts_set := (std::array_unpack(GLOBAL default::current_accounts_array));
  CREATE SCALAR TYPE default::UAddress EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^[0-9a-zA-Z-]+?:0x[0-9a-fA-F]{40}$');
  };
  CREATE FUNCTION default::as_chain(address: default::UAddress) ->  std::str USING ((std::str_split(address, ':'))[0]);
  CREATE SCALAR TYPE default::MAC EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$');
  };
  CREATE SCALAR TYPE default::Address EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{40}$');
  };
  CREATE SCALAR TYPE default::Bytes32 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{64}$');
  };
  CREATE TYPE default::Account {
      CREATE REQUIRED PROPERTY address: default::UAddress {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
      CREATE REQUIRED PROPERTY implementation: default::Address;
      CREATE REQUIRED PROPERTY isActive: std::bool;
      CREATE REQUIRED PROPERTY label: std::str {
          CREATE CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::regexp('^[0-9a-zA-Z$-]{4,40}$');
      };
      CREATE REQUIRED PROPERTY paymasterEthCredit: std::decimal {
          SET default := 0;
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE PROPERTY photoUri: std::str;
      CREATE REQUIRED PROPERTY salt: default::Bytes32;
      CREATE ACCESS POLICY members_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING ((.id IN GLOBAL default::current_accounts_set));
  };
  CREATE GLOBAL default::current_accounts := (<default::Account>GLOBAL default::current_accounts_set);
  CREATE GLOBAL default::current_approver_address -> default::Address;
  CREATE SCALAR TYPE default::Bytes EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('0x(?:[0-9a-fA-F]{2})*$');
  };
  CREATE ABSTRACT TYPE default::ProposalResponse {
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::Approval EXTENDING default::ProposalResponse {
      CREATE REQUIRED PROPERTY signedHash: default::Bytes32;
      CREATE REQUIRED PROPERTY signature: default::Bytes;
  };
  CREATE SCALAR TYPE default::Bytes4 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{8}$');
  };
  CREATE TYPE default::ActionFunction {
      CREATE PROPERTY abi: std::json;
      CREATE PROPERTY contract: default::Address;
      CREATE PROPERTY selector: default::Bytes4;
  };
  CREATE SCALAR TYPE default::Label EXTENDING std::str {
      CREATE CONSTRAINT std::max_len_value(50);
      CREATE CONSTRAINT std::min_len_value(1);
  };
  CREATE TYPE default::Action {
      CREATE REQUIRED MULTI LINK functions: default::ActionFunction;
      CREATE REQUIRED PROPERTY allow: std::bool;
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY label: default::Label;
  };
  CREATE SCALAR TYPE default::ProposalRisk EXTENDING enum<Low, Medium, High>;
  CREATE ABSTRACT TYPE default::Proposal {
      CREATE REQUIRED LINK account: default::Account;
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
          SET readonly := true;
      };
      CREATE PROPERTY iconUri: std::str;
      CREATE PROPERTY label: default::Label;
      CREATE REQUIRED PROPERTY validFrom: std::datetime;
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::ProposalResponse {
      CREATE REQUIRED LINK proposal: default::Proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE ACCESS POLICY members_can_select
          ALLOW SELECT USING ((.proposal.account IN GLOBAL default::current_accounts));
  };
  ALTER TYPE default::Approval {
      CREATE REQUIRED PROPERTY issues := (<array<default::ApprovalIssue>>std::array_agg(({default::ApprovalIssue.HashMismatch} IF (.signedHash != .proposal.hash) ELSE <default::ApprovalIssue>{})));
  };
  CREATE TYPE default::Receipt {
      CREATE REQUIRED PROPERTY responses: array<default::Bytes>;
      CREATE REQUIRED PROPERTY success: std::bool;
      CREATE REQUIRED PROPERTY ethFeePerGas: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY block: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY gasUsed: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE TYPE default::Simulation {
      CREATE REQUIRED PROPERTY responses: array<default::Bytes>;
      CREATE REQUIRED PROPERTY success: std::bool;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::CloudProvider EXTENDING enum<Apple, Google>;
  CREATE TYPE default::CloudShare {
      CREATE REQUIRED PROPERTY provider: default::CloudProvider;
      CREATE REQUIRED PROPERTY subject: std::str;
      CREATE CONSTRAINT std::exclusive ON ((.provider, .subject));
      CREATE REQUIRED PROPERTY share: std::str;
  };
  CREATE TYPE default::Approver {
      CREATE PROPERTY bluetoothDevices: array<default::MAC>;
      CREATE LINK cloud: default::CloudShare {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY address: default::Address {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name: default::Label;
      CREATE PROPERTY pushToken: std::str;
      CREATE ACCESS POLICY anyone_select_insert
          ALLOW SELECT, INSERT ;
  };
  CREATE SCALAR TYPE default::uint16 EXTENDING std::int32 {
      CREATE CONSTRAINT std::max_value(((2 ^ 16) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE GLOBAL default::current_approver := (std::assert_single((SELECT
      default::Approver
  FILTER
      (.address = GLOBAL default::current_approver_address)
  )));
  CREATE TYPE default::Token {
      CREATE PROPERTY units: array<tuple<symbol: default::Label, decimals: default::uint16>>;
      CREATE REQUIRED PROPERTY address: default::UAddress;
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
      CREATE REQUIRED PROPERTY symbol: default::Label;
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE REQUIRED PROPERTY isFeeToken: std::bool {
          SET default := false;
      };
      CREATE INDEX ON ((.address, .isFeeToken));
      CREATE INDEX ON (.address);
      CREATE REQUIRED PROPERTY decimals: default::uint16;
      CREATE PROPERTY ethereumAddress: default::Address;
      CREATE PROPERTY iconUri: std::str;
      CREATE PROPERTY pythUsdPriceId: default::Bytes32;
  };
  CREATE FUNCTION default::as_adddress(address: default::UAddress) ->  default::Address USING ((std::str_split(address, ':'))[1]);
  CREATE TYPE default::User {
      CREATE LINK primaryAccount: default::Account;
  };
  ALTER TYPE default::Approver {
      CREATE REQUIRED LINK user: default::User {
          SET default := (INSERT
              default::User
          );
          ON SOURCE DELETE DELETE TARGET IF ORPHAN;
      };
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK approvers := (.<user[IS default::Approver]);
  };
  CREATE GLOBAL default::current_user := ((GLOBAL default::current_approver).user);
  ALTER TYPE default::Token {
      CREATE LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
      };
      CREATE CONSTRAINT std::exclusive ON ((.user, .chain, .symbol));
      CREATE CONSTRAINT std::exclusive ON ((.user, .chain, .name));
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user ?= GLOBAL default::current_user));
      CREATE ACCESS POLICY anyone_select_allowlisted
          ALLOW SELECT USING (NOT (EXISTS (.user)));
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
  };
  ALTER TYPE default::ProposalResponse {
      CREATE REQUIRED LINK approver: default::Approver {
          SET default := (<default::Approver>(GLOBAL default::current_approver).id);
      };
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.approver.user ?= GLOBAL default::current_user));
      CREATE CONSTRAINT std::exclusive ON ((.proposal, .approver));
  };
  CREATE TYPE default::Rejection EXTENDING default::ProposalResponse;
  CREATE TYPE default::Transaction {
      CREATE LINK receipt: default::Receipt {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY submittedAt: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY ethDiscount: std::decimal {
          SET default := 0;
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY maxEthFeePerGas: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY ethPerFeeToken: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY usdPerFeeToken: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
  };
  ALTER TYPE default::Approval {
      CREATE REQUIRED PROPERTY invalid := ((std::len(.issues) > 0));
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
      CREATE REQUIRED LINK proposedBy: default::Approver {
          SET default := (<default::Approver>(GLOBAL default::current_approver).id);
          SET readonly := true;
      };
      CREATE MULTI LINK rejections := (.<proposal[IS default::Rejection]);
  };
  CREATE TYPE default::ProposalRiskLabel {
      CREATE REQUIRED LINK proposal: default::Proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
      };
      CREATE REQUIRED PROPERTY risk: default::ProposalRisk;
      CREATE CONSTRAINT std::exclusive ON ((.proposal, .user));
  };
  ALTER TYPE default::Proposal {
      CREATE PROPERTY riskLabel := ((std::assert_single((SELECT
          .<proposal[IS default::ProposalRiskLabel]
      FILTER
          (.user = GLOBAL default::current_user)
      ))).risk);
  };
  CREATE SCALAR TYPE default::TransactionProposalStatus EXTENDING enum<Pending, Executing, Successful, Failed>;
  CREATE TYPE default::TransactionProposal EXTENDING default::Proposal {
      CREATE REQUIRED PROPERTY gasLimit: default::uint256 {
          SET default := 0;
      };
      CREATE REQUIRED PROPERTY paymasterEthFee: std::decimal {
          SET default := 0;
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED MULTI LINK operations: default::Operation {
          ON SOURCE DELETE DELETE TARGET;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE LINK simulation: default::Simulation {
          ON TARGET DELETE DEFERRED RESTRICT;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED LINK feeToken: default::Token;
      CREATE REQUIRED PROPERTY nonce := (<std::bigint>math::floor(std::datetime_get(.validFrom, 'epochseconds')));
      CREATE REQUIRED PROPERTY paymaster: default::Address;
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED LINK proposal: default::TransactionProposal;
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.proposal.account IN GLOBAL default::current_accounts));
  };
  CREATE SCALAR TYPE default::TransferDirection EXTENDING enum<`In`, Out>;
  CREATE SCALAR TYPE default::uint32 EXTENDING std::int64 {
      CREATE CONSTRAINT std::max_value(((2 ^ 32) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Event {
      CREATE LINK transaction: default::Transaction;
      CREATE REQUIRED PROPERTY block: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY internal := (EXISTS (.transaction));
      CREATE REQUIRED PROPERTY logIndex: default::uint32;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY transactionHash: default::Bytes32;
  };
  CREATE TYPE default::TransferDetails {
      CREATE REQUIRED LINK account: default::Account;
      CREATE REQUIRED PROPERTY tokenAddress: default::UAddress;
      CREATE LINK token := (std::assert_single((WITH
          address := 
              .tokenAddress
      SELECT
          default::Token FILTER
              (.address = address)
          ORDER BY
              EXISTS (.user) DESC
      LIMIT
          1
      )));
      CREATE REQUIRED PROPERTY amount: std::decimal;
      CREATE REQUIRED MULTI PROPERTY direction: default::TransferDirection;
      CREATE REQUIRED PROPERTY from: default::Address;
      CREATE REQUIRED PROPERTY isFeeTransfer: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY to: default::Address;
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.account IN GLOBAL default::current_accounts));
  };
  CREATE ABSTRACT TYPE default::Transferlike EXTENDING default::Event, default::TransferDetails;
  CREATE TYPE default::Transfer EXTENDING default::Transferlike {
      CREATE CONSTRAINT std::exclusive ON ((.account, .block, .logIndex));
      CREATE INDEX ON ((.account, .internal));
  };
  CREATE TYPE default::TransferApproval EXTENDING default::Transferlike {
      CREATE LINK previous := (SELECT
          default::TransferApproval FILTER
              (((.tokenAddress = .tokenAddress) AND (.from = .from)) AND (.to = .to))
          ORDER BY
              .block DESC THEN
              .logIndex DESC
      LIMIT
          1
      );
      CREATE REQUIRED PROPERTY delta := ((.amount - (.previous.amount ?? 0)));
  };
  CREATE TYPE default::MessageProposal EXTENDING default::Proposal {
      CREATE REQUIRED PROPERTY message: std::str;
      CREATE PROPERTY signature: default::Bytes;
      CREATE PROPERTY typedData: std::json;
  };
  CREATE TYPE default::Policy {
      CREATE REQUIRED LINK account: default::Account;
      CREATE ACCESS POLICY members_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING ((.account IN GLOBAL default::current_accounts));
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE CONSTRAINT std::exclusive ON ((.account, .name));
      CREATE REQUIRED PROPERTY key: default::uint16;
      CREATE CONSTRAINT std::exclusive ON ((.account, .key));
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
      CREATE REQUIRED PROPERTY isRemoved: std::bool {
          SET default := false;
      };
      CREATE MULTI LINK approvers: default::Approver;
      CREATE MULTI LINK actions: default::Action;
      CREATE INDEX ON (.createdAt);
      CREATE INDEX ON (.activationBlock);
      CREATE LINK proposal: default::TransactionProposal {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY isAccountInitState := ((NOT (EXISTS (.proposal)) AND NOT (.isRemoved)));
      CREATE REQUIRED LINK transfers: default::TransfersConfig;
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
      CREATE REQUIRED PROPERTY isActive := ((.state.isRemoved ?= false));
      CREATE REQUIRED PROPERTY isEnabled := ((.isActive OR (.draft.isRemoved ?= false)));
      CREATE ACCESS POLICY can_be_deleted_when_inactive
          ALLOW DELETE USING (NOT (.isActive));
  };
  ALTER TYPE default::Account {
      CREATE MULTI LINK policies := (SELECT
          .<account[IS default::Policy]
      FILTER
          .isEnabled
      );
      CREATE MULTI LINK approvers := (DISTINCT ((.policies.state.approvers UNION .policies.draft.approvers)));
      CREATE MULTI LINK proposals := (.<account[IS default::Proposal]);
      CREATE MULTI LINK transactionProposals := (.<account[IS default::TransactionProposal]);
      CREATE MULTI LINK transfers := (.<account[IS default::Transfer]);
  };
  ALTER TYPE default::Approver {
      CREATE LINK accounts := (SELECT
          default::Account
      FILTER
          (__source__ IN .approvers)
      );
      CREATE ACCESS POLICY user_select_update
          ALLOW SELECT, UPDATE USING ((.user ?= GLOBAL default::current_user));
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK accounts := (SELECT
          DISTINCT (.approvers.accounts)
      );
  };
  ALTER TYPE default::Receipt {
      CREATE REQUIRED LINK transaction := (std::assert_exists(.<receipt[IS default::Transaction]));
  };
  ALTER TYPE default::Transaction {
      CREATE MULTI LINK events := (.<transaction[IS default::Event]);
      CREATE REQUIRED PROPERTY maxNetworkEthFee := ((.maxEthFeePerGas * .proposal.gasLimit));
      CREATE REQUIRED PROPERTY maxEthFees := (((.maxNetworkEthFee + .proposal.paymasterEthFee) - .ethDiscount));
  };
  ALTER TYPE default::Receipt {
      CREATE MULTI LINK events := (.transaction.events);
      CREATE MULTI LINK transferApprovalEvents := (.events[IS default::TransferApproval]);
      CREATE MULTI LINK transferEvents := (.events[IS default::Transfer]);
      CREATE REQUIRED PROPERTY networkEthFee := ((.ethFeePerGas * .transaction.proposal.gasLimit));
      CREATE REQUIRED PROPERTY ethFees := (((.networkEthFee + .transaction.proposal.paymasterEthFee) - .transaction.ethDiscount));
  };
  ALTER TYPE default::PolicyState {
      CREATE LINK policy := (.<stateHistory[IS default::Policy]);
  };
  ALTER TYPE default::Proposal {
      CREATE LINK policy: default::Policy;
      CREATE MULTI LINK potentialApprovers := (WITH
          potentialResponses := 
              DISTINCT ((((SELECT
                  .policy
              ) ?? .account.policies)).state.approvers.id)
          ,
          ids := 
              (potentialResponses EXCEPT .approvals.approver.id)
      SELECT
          default::Approver
      FILTER
          (.id IN ids)
      );
      CREATE MULTI LINK potentialRejectors := (WITH
          potentialResponses := 
              DISTINCT ((((SELECT
                  .policy
              ) ?? .account.policies)).state.approvers.id)
          ,
          ids := 
              (potentialResponses EXCEPT .rejections.approver.id)
      SELECT
          default::Approver
      FILTER
          (.id IN ids)
      );
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
          std::assert_exists((default::TransactionProposalStatus.Pending IF NOT (EXISTS (.transaction)) ELSE (default::TransactionProposalStatus.Executing IF NOT (EXISTS (.transaction.receipt)) ELSE (default::TransactionProposalStatus.Successful IF .transaction.receipt.success ELSE default::TransactionProposalStatus.Failed))))
      );
  };
  CREATE TYPE default::Contact {
      CREATE REQUIRED LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
      };
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user ?= GLOBAL default::current_user));
      CREATE REQUIRED PROPERTY address: default::UAddress;
      CREATE REQUIRED PROPERTY label: default::Label;
      CREATE CONSTRAINT std::exclusive ON ((.user, .label));
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
  };
  ALTER TYPE default::Approver {
      CREATE LINK contact := (std::assert_single((WITH
          address := 
              .address
      SELECT
          default::Contact
      FILTER
          (.address = address)
      )));
      CREATE PROPERTY label := ((.contact.label ?? .name));
  };
  ALTER TYPE default::User {
      CREATE MULTI LINK contacts := (.<user[IS default::Contact]);
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
  CREATE TYPE default::Refund {
      CREATE REQUIRED LINK transaction: default::Transaction {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY ethAmount: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
  };
  ALTER TYPE default::Transaction {
      CREATE MULTI LINK refunds := (.<transaction[IS default::Refund]);
  };
  ALTER TYPE default::Simulation {
      CREATE MULTI LINK transfers: default::TransferDetails {
          ON SOURCE DELETE DELETE TARGET;
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE SCALAR TYPE default::Amount EXTENDING std::decimal {
      CREATE CONSTRAINT std::min_value(0.0n);
  };
  CREATE SCALAR TYPE default::uint64 EXTENDING std::bigint {
      CREATE CONSTRAINT std::max_value(((2n ^ 64n) - 1n));
      CREATE CONSTRAINT std::min_value(0);
  };
};
