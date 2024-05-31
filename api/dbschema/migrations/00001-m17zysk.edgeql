CREATE MIGRATION m17zysktd275lmeyaal7evvoerfedmpq7tmjiip5r2jdrben4el2rq
    ONTO initial
{
  CREATE SCALAR TYPE default::ApprovalIssue EXTENDING enum<HashMismatch, Expired>;
  CREATE GLOBAL default::current_accounts -> array<std::uuid>;
  CREATE FUNCTION default::is_member_by_id(account: std::uuid) ->  std::bool USING ((std::contains(GLOBAL default::current_accounts, account) ?? false));
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
  CREATE GLOBAL default::current_approver_address -> default::Address;
  CREATE SCALAR TYPE default::uint16 EXTENDING std::int32 {
      CREATE CONSTRAINT std::max_value(((2 ^ 16) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE FUNCTION default::as_fixed(value: std::decimal, decimals: default::uint16) ->  std::bigint USING (<std::bigint>std::round((value * (10n ^ decimals))));
  CREATE SCALAR TYPE default::Bytes32 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{64}$');
  };
  CREATE SCALAR TYPE default::Url EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^https?://');
  };
  CREATE TYPE default::Account {
      CREATE REQUIRED PROPERTY address: default::UAddress {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY label: std::str {
          CREATE CONSTRAINT std::exclusive;
          CREATE CONSTRAINT std::regexp('^[0-9a-zA-Z$-]{4,40}$');
      };
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
      CREATE PROPERTY activationEthFee: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE ACCESS POLICY members_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING (default::is_member_by_id(.id));
      CREATE PROPERTY upgradedAtBlock: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY active := (EXISTS (.upgradedAtBlock));
      CREATE ACCESS POLICY can_be_deleted_when_inactive
          ALLOW DELETE USING (NOT (.active));
      CREATE REQUIRED PROPERTY implementation: default::Address;
      CREATE PROPERTY photo: default::Url;
      CREATE REQUIRED PROPERTY salt: default::Bytes32;
  };
  CREATE FUNCTION default::is_member(account: default::Account) ->  std::bool USING ((std::contains(GLOBAL default::current_accounts, account.id) ?? false));
  CREATE SCALAR TYPE default::Bytes EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('0x(?:[0-9a-fA-F]{2})*$');
  };
  CREATE ABSTRACT TYPE default::ProposalResponse {
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE ACCESS POLICY anyone_select
          ALLOW SELECT USING (true);
  };
  CREATE TYPE default::Approval EXTENDING default::ProposalResponse {
      CREATE REQUIRED PROPERTY signedHash: default::Bytes32;
      CREATE REQUIRED PROPERTY signature: default::Bytes;
  };
  CREATE SCALAR TYPE default::Label EXTENDING std::str {
      CREATE CONSTRAINT std::max_len_value(50);
      CREATE CONSTRAINT std::min_len_value(1);
  };
  CREATE ABSTRACT TYPE default::Proposal {
      CREATE REQUIRED LINK account: default::Account;
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE PROPERTY dapp: tuple<name: std::str, url: default::Url, icons: array<default::Url>>;
      CREATE PROPERTY icon: default::Url;
      CREATE PROPERTY label: default::Label;
      CREATE REQUIRED PROPERTY timestamp: std::datetime;
      CREATE REQUIRED PROPERTY validationErrors: array<tuple<reason: std::str, operation: std::int32>>;
      CREATE ACCESS POLICY members_all
          ALLOW ALL USING (default::is_member(.account));
  };
  ALTER TYPE default::ProposalResponse {
      CREATE REQUIRED LINK proposal: default::Proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE default::Approval {
      CREATE REQUIRED PROPERTY issues := (<array<default::ApprovalIssue>>std::array_agg(({default::ApprovalIssue.HashMismatch} IF (.signedHash != .proposal.hash) ELSE <default::ApprovalIssue>{})));
      CREATE REQUIRED PROPERTY invalid := ((std::len(.issues) > 0));
  };
  CREATE TYPE default::Simulation {
      CREATE REQUIRED PROPERTY responses: array<default::Bytes>;
      CREATE REQUIRED PROPERTY success: std::bool;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE ABSTRACT TYPE default::Result {
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE ABSTRACT TYPE default::ReceiptResult EXTENDING default::Result {
      CREATE REQUIRED PROPERTY block: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY ethFeePerGas: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY gasUsed: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY networkEthFee := ((.ethFeePerGas * .gasUsed));
  };
  CREATE TYPE default::Successful EXTENDING default::ReceiptResult {
      CREATE REQUIRED PROPERTY responses: array<default::Bytes>;
  };
  CREATE SCALAR TYPE default::CloudProvider EXTENDING enum<Apple, Google>;
  CREATE TYPE default::Approver {
      CREATE PROPERTY bluetoothDevices: array<default::MAC>;
      CREATE REQUIRED PROPERTY address: default::Address {
          SET readonly := true;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY cloud: tuple<provider: default::CloudProvider, subject: std::str>;
      CREATE PROPERTY name: default::Label;
      CREATE PROPERTY pushToken: std::str;
      CREATE ACCESS POLICY anyone_select_insert
          ALLOW SELECT, INSERT ;
  };
  CREATE GLOBAL default::current_approver := (std::assert_single((SELECT
      default::Approver
  FILTER
      (.address = GLOBAL default::current_approver_address)
  )));
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK approvals := (.<proposal[IS default::Approval]);
      CREATE REQUIRED LINK proposedBy: default::Approver {
          SET default := (<default::Approver>(GLOBAL default::current_approver).id);
      };
  };
  ALTER TYPE default::ProposalResponse {
      CREATE REQUIRED LINK approver: default::Approver {
          SET default := (<default::Approver>(GLOBAL default::current_approver).id);
      };
  };
  CREATE TYPE default::Rejection EXTENDING default::ProposalResponse;
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK rejections := (.<proposal[IS default::Rejection]);
  };
  CREATE TYPE default::Message EXTENDING default::Proposal {
      CREATE PROPERTY signature: default::Bytes;
      CREATE REQUIRED PROPERTY message: std::str;
      CREATE REQUIRED PROPERTY messageHash: default::Bytes32;
      CREATE PROPERTY typedData: std::json;
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
  CREATE SCALAR TYPE default::TransactionStatus EXTENDING enum<Pending, Scheduled, Executing, Successful, Failed, Cancelled>;
  CREATE TYPE default::Transaction EXTENDING default::Proposal {
      CREATE REQUIRED PROPERTY maxAmount: std::decimal;
      CREATE REQUIRED PROPERTY gasLimit: default::uint256 {
          SET default := 0;
      };
      CREATE LINK result: default::Result {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY executable: std::bool {
          SET default := false;
      };
      CREATE REQUIRED MULTI LINK operations: default::Operation {
          ON SOURCE DELETE DELETE TARGET;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE LINK simulation: default::Simulation {
          ON TARGET DELETE DEFERRED RESTRICT;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY paymaster: default::Address;
  };
  CREATE TYPE default::Token {
      CREATE PROPERTY units: array<tuple<symbol: default::Label, decimals: default::uint16>>;
      CREATE REQUIRED PROPERTY address: default::UAddress;
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
      CREATE REQUIRED PROPERTY symbol: default::Label;
      CREATE REQUIRED PROPERTY decimals: default::uint16;
      CREATE REQUIRED PROPERTY isFeeToken: std::bool {
          SET default := false;
      };
      CREATE INDEX ON ((.address, .isFeeToken));
      CREATE INDEX ON (.address);
      CREATE PROPERTY icon: default::Url;
      CREATE PROPERTY pythUsdPriceId: default::Bytes32;
  };
  CREATE FUNCTION default::as_address(address: default::UAddress) ->  default::Address USING ((std::str_split(address, ':'))[1]);
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
  CREATE TYPE default::Contact {
      CREATE REQUIRED LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY address: default::UAddress;
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
      CREATE REQUIRED PROPERTY label: default::Label;
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user ?= GLOBAL default::current_user));
      CREATE CONSTRAINT std::exclusive ON ((.user, .label));
  };
  CREATE TYPE default::GlobalLabel {
      CREATE REQUIRED PROPERTY address: default::UAddress {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY label: default::Label;
  };
  ALTER TYPE default::Token {
      CREATE LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
      };
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
      CREATE CONSTRAINT std::exclusive ON ((.user, .chain, .symbol));
      CREATE CONSTRAINT std::exclusive ON ((.user, .chain, .name));
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING ((.user ?= GLOBAL default::current_user));
      CREATE ACCESS POLICY anyone_select_allowlisted
          ALLOW SELECT USING (NOT (EXISTS (.user)));
      CREATE REQUIRED PROPERTY isSystem := (NOT (EXISTS (.user)));
  };
  CREATE FUNCTION default::labelForUser(addressParam: std::str, user: default::User) -> OPTIONAL std::str USING (WITH
      address := 
          <default::UAddress>addressParam
  SELECT
      std::assert_single((((SELECT
          default::Contact
      FILTER
          ((.address = address) AND (.user = user))
      )).label ?? (((SELECT
          default::Account
      FILTER
          (.address = address)
      )).label ?? (((SELECT
          default::Token
      FILTER
          ((.address = address) AND (.user = user))
      )).name ?? (((SELECT
          default::Token
      FILTER
          (.address = address)
      )).name ?? (((SELECT
          default::Approver
      FILTER
          (.address = default::as_address(address))
      )).name ?? ((SELECT
          default::GlobalLabel
      FILTER
          (.address = address)
      )).label))))))
  );
  CREATE FUNCTION default::as_decimal(value: std::bigint, decimals: default::uint16) ->  std::decimal USING ((<std::decimal>value / (<std::decimal>10 ^ decimals)));
  ALTER TYPE default::Transaction {
      CREATE REQUIRED LINK feeToken: default::Token;
      CREATE REQUIRED PROPERTY maxAmountFp := (default::as_fixed(.maxAmount, .feeToken.decimals));
  };
  CREATE SCALAR TYPE default::uint32 EXTENDING std::int64 {
      CREATE CONSTRAINT std::max_value(((2 ^ 32) - 1));
      CREATE CONSTRAINT std::min_value(0);
  };
  CREATE TYPE default::Event {
      CREATE REQUIRED LINK account: default::Account;
      CREATE ACCESS POLICY members_can_select
          ALLOW SELECT USING (default::is_member(.account));
      CREATE REQUIRED PROPERTY block: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY logIndex: default::uint32;
      CREATE REQUIRED PROPERTY systxHash: default::Bytes32;
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
  CREATE SCALAR TYPE default::TransferDirection EXTENDING enum<`In`, Out>;
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
          ALLOW SELECT, INSERT USING (default::is_member(.account));
  };
  CREATE ABSTRACT TYPE default::Transferlike EXTENDING default::Event, default::TransferDetails;
  CREATE TYPE default::Transfer EXTENDING default::Transferlike {
      CREATE CONSTRAINT std::exclusive ON ((.account, .block, .logIndex));
  };
  CREATE TYPE default::TransferApproval EXTENDING default::Transferlike {
      CREATE CONSTRAINT std::exclusive ON ((.account, .block, .logIndex));
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
  CREATE SCALAR TYPE default::Bytes4 EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{8}$');
  };
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
      CREATE REQUIRED PROPERTY budget: default::uint32;
      CREATE MULTI LINK limits: default::TransferLimit {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY defaultAllow: std::bool {
          SET default := true;
      };
  };
  CREATE ABSTRACT TYPE default::PolicyState {
      CREATE REQUIRED LINK account: default::Account {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE ACCESS POLICY members_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING (default::is_member(.account));
      CREATE REQUIRED PROPERTY key: default::uint16;
      CREATE PROPERTY activationBlock: std::bigint {
          CREATE CONSTRAINT std::min_value(0n);
      };
      CREATE REQUIRED PROPERTY createdAt: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY hasBeenActive := (EXISTS (.activationBlock));
      CREATE LINK draft := (std::assert_single((WITH
          account := 
              __source__.account
          ,
          key := 
              __source__.key
      SELECT
          DETACHED default::PolicyState FILTER
              (((.account = account) AND (.key = key)) AND NOT (.hasBeenActive))
          ORDER BY
              .createdAt DESC
      LIMIT
          1
      )));
      CREATE LINK proposal: default::Transaction {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY initState := ((.activationBlock ?= 0));
      CREATE INDEX ON ((.account, .key));
      CREATE ACCESS POLICY can_be_deleted_when_never_activated
          ALLOW DELETE USING (NOT (.hasBeenActive));
  };
  CREATE TYPE default::Policy EXTENDING default::PolicyState {
      CREATE MULTI LINK approvers: default::Approver;
      CREATE MULTI LINK actions: default::Action;
      CREATE REQUIRED LINK transfers: default::TransfersConfig {
          SET default := (INSERT
              default::TransfersConfig
              {
                  budget := 0
              });
      };
      CREATE REQUIRED PROPERTY allowMessages: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY delay: default::uint32 {
          SET default := 0;
      };
      CREATE REQUIRED PROPERTY name: default::Label;
      CREATE REQUIRED PROPERTY threshold: default::uint16;
  };
  ALTER TYPE default::Account {
      CREATE MULTI LINK policies: default::Policy {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
      };
      CREATE MULTI LINK approvers := (DISTINCT ((.policies.approvers UNION .policies.draft[IS default::Policy].approvers)));
      CREATE MULTI LINK messages := (.<account[IS default::Message]);
      CREATE MULTI LINK proposals := (.<account[IS default::Proposal]);
      CREATE MULTI LINK transactions := (.<account[IS default::Transaction]);
      CREATE MULTI LINK transfers := (.<account[IS default::Transfer]);
  };
  CREATE FUNCTION default::latestPolicy(account: default::Account, key: std::int64) -> OPTIONAL default::Policy USING (std::assert_single((SELECT
      account.policies
  FILTER
      (.key = key)
  )));
  ALTER TYPE default::PolicyState {
      CREATE LINK latest := (default::latestPolicy(.account, .key));
      CREATE REQUIRED PROPERTY active := ((.hasBeenActive AND (.latest ?= __source__)));
  };
  CREATE TYPE default::RemovedPolicy EXTENDING default::PolicyState {
      CREATE TRIGGER rm_policy_draft_link
          AFTER UPDATE, INSERT 
          FOR EACH 
              WHEN (((__new__.activationBlock ?? 0) > (((SELECT
                  __new__.account.policies FILTER
                      (.key = __new__.key)
              LIMIT
                  1
              )).activationBlock ?? -1)))
          DO (UPDATE
              __new__.account
          SET {
              policies := std::assert_distinct((SELECT
                  __new__.account.policies
              FILTER
                  (.key != __new__.key)
              ))
          });
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
      CREATE MULTI LINK accounts := (SELECT
          DISTINCT (.approvers.accounts)
      );
      CREATE MULTI LINK contacts := (.<user[IS default::Contact]);
  };
  CREATE TYPE default::SystemTx {
      CREATE REQUIRED LINK proposal: default::Transaction;
      CREATE REQUIRED PROPERTY maxEthFeePerGas: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY maxNetworkEthFee := ((.maxEthFeePerGas * .proposal.gasLimit));
      CREATE REQUIRED PROPERTY ethPerFeeToken: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY timestamp: std::datetime {
          SET default := (std::datetime_of_statement());
      };
      CREATE REQUIRED PROPERTY usdPerFeeToken: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
  };
  ALTER TYPE default::Event {
      CREATE LINK systx: default::SystemTx;
      CREATE REQUIRED PROPERTY internal := (EXISTS (.systx));
      CREATE INDEX ON ((.account, .internal));
  };
  ALTER TYPE default::Result {
      CREATE LINK systx: default::SystemTx {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::SystemTx {
      CREATE LINK events := (.<systx[IS default::Event]);
  };
  ALTER TYPE default::Result {
      CREATE MULTI LINK events := (.systx.events);
      CREATE REQUIRED LINK transaction: default::Transaction;
      CREATE MULTI LINK transferApprovals := (.events[IS default::TransferApproval]);
      CREATE MULTI LINK transfers := (.events[IS default::Transfer]);
      CREATE TRIGGER update_tx_result
          AFTER INSERT 
          FOR EACH DO (UPDATE
              __new__.transaction
          SET {
              result := __new__
          });
  };
  CREATE TYPE default::Failed EXTENDING default::ReceiptResult {
      CREATE PROPERTY reason: std::str;
  };
  CREATE TYPE default::Scheduled EXTENDING default::Result {
      CREATE REQUIRED PROPERTY cancelled: std::bool {
          SET default := false;
      };
      CREATE REQUIRED PROPERTY scheduledFor: std::datetime;
  };
  CREATE TYPE default::PaymasterFees {
      CREATE REQUIRED PROPERTY activation: std::decimal {
          SET default := 0;
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY total := (.activation);
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED LINK paymasterEthFees: default::PaymasterFees {
          SET default := (INSERT
              default::PaymasterFees
          );
          ON SOURCE DELETE DELETE TARGET;
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::SystemTx {
      CREATE REQUIRED PROPERTY maxEthFees := ((.maxNetworkEthFee + .proposal.paymasterEthFees.total));
      CREATE TRIGGER update_activation_fee
          AFTER INSERT 
          FOR EACH 
              WHEN ((__new__.proposal.account.activationEthFee > 0))
          DO (WITH
              account := 
                  __new__.proposal.account
              ,
              paymasterEthFees := 
                  __new__.proposal.paymasterEthFees
          UPDATE
              account
          SET {
              activationEthFee := std::max({0, (account.activationEthFee - paymasterEthFees.activation)})
          });
  };
  ALTER TYPE default::Proposal {
      CREATE REQUIRED LINK policy: default::Policy;
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED PROPERTY status := (SELECT
          std::assert_exists((default::TransactionStatus.Pending IF NOT (.executable) ELSE (default::TransactionStatus.Executing IF NOT (EXISTS (.result)) ELSE (default::TransactionStatus.Successful IF (.result IS default::Successful) ELSE (default::TransactionStatus.Failed IF (.result IS default::Failed) ELSE (default::TransactionStatus.Scheduled IF NOT (.result[IS default::Scheduled].cancelled) ELSE default::TransactionStatus.Cancelled))))))
      );
      CREATE LINK systx: default::SystemTx {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE MULTI LINK results := (.<transaction[IS default::Result]);
      CREATE MULTI LINK systxs := (.<proposal[IS default::SystemTx]);
  };
  ALTER TYPE default::Transferlike {
      CREATE LINK spentBy: default::Policy;
      ALTER LINK spentBy {
          CREATE REWRITE
              INSERT 
              USING (__subject__.systx.proposal.policy);
          CREATE REWRITE
              UPDATE 
              USING (__subject__.systx.proposal.policy);
      };
      CREATE INDEX ON ((.spentBy, .tokenAddress));
  };
  ALTER TYPE default::Policy {
      CREATE TRIGGER link_insert
          AFTER UPDATE, INSERT 
          FOR EACH 
              WHEN (((__new__.activationBlock ?? 0) > (((SELECT
                  __new__.account.policies FILTER
                      (.key = __new__.key)
              LIMIT
                  1
              )).activationBlock ?? -1)))
          DO (UPDATE
              __new__.account
          SET {
              policies := std::assert_distinct(((SELECT
                  __new__.account.policies
              FILTER
                  (.key != __new__.key)
              ) UNION __new__))
          });
      CREATE TRIGGER update_proposals
          AFTER UPDATE, INSERT 
          FOR EACH 
              WHEN (((__new__.activationBlock ?? 0) > (((SELECT
                  __new__.account.policies FILTER
                      (.key = __new__.key)
              LIMIT
                  1
              )).activationBlock ?? -1)))
          DO (UPDATE
              default::Proposal
          FILTER
              (((.account = __new__.account) AND (.policy.key = __new__.key)) AND (([IS default::Transaction].status ?= default::TransactionStatus.Pending) OR (EXISTS ([IS default::Message].id) AND NOT (EXISTS ([IS default::Message].signature)))))
          SET {
              policy := __new__
          });
      CREATE TRIGGER update_proposals_when_deleted
          AFTER DELETE 
          FOR EACH DO (UPDATE
              default::Proposal
          FILTER
              (((.account = __old__.account) AND (.policy.key = __old__.key)) AND (([IS default::Transaction].status ?= default::TransactionStatus.Pending) OR (EXISTS ([IS default::Message].id) AND NOT (EXISTS ([IS default::Message].signature)))))
          SET {
              policy := (SELECT
                  __old__.account.policies 
              LIMIT
                  1
              )
          });
  };
  ALTER TYPE default::RemovedPolicy {
      CREATE TRIGGER update_proposals
          AFTER UPDATE, INSERT 
          FOR EACH 
              WHEN (((__new__.activationBlock ?? 0) > (((SELECT
                  __new__.account.policies FILTER
                      (.key = __new__.key)
              LIMIT
                  1
              )).activationBlock ?? -1)))
          DO (UPDATE
              default::Proposal
          FILTER
              (((.account = __new__.account) AND (.policy.key = __new__.key)) AND (([IS default::Transaction].status ?= default::TransactionStatus.Pending) OR (EXISTS ([IS default::Message].id) AND NOT (EXISTS ([IS default::Message].signature)))))
          SET {
              policy := (SELECT
                  __new__.account.policies 
              LIMIT
                  1
              )
          });
  };
  ALTER TYPE default::SystemTx {
      CREATE TRIGGER update_tx_systx
          AFTER INSERT 
          FOR EACH DO (UPDATE
              __new__.proposal
          SET {
              systx := __new__
          });
      CREATE LINK result := (.<systx[IS default::Result]);
  };
  CREATE FUNCTION default::label(address: std::str) -> OPTIONAL std::str USING (SELECT
      default::labelForUser(address, GLOBAL default::current_user)
  );
  CREATE FUNCTION default::tokenForUser(addressParam: std::str, user: default::User) -> OPTIONAL default::Token USING (WITH
      address := 
          <default::UAddress>addressParam
  SELECT
      std::assert_single(((SELECT
          default::Token FILTER
              ((.address = address) AND (.user = user))
      LIMIT
          1
      ) ?? (SELECT
          default::Token FILTER
              (.address = address)
      LIMIT
          1
      )))
  );
  CREATE FUNCTION default::token(address: std::str) -> OPTIONAL default::Token USING (SELECT
      default::tokenForUser(address, GLOBAL default::current_user)
  );
  ALTER TYPE default::ProposalResponse {
      CREATE ACCESS POLICY user_all
          ALLOW ALL USING (((.approver ?= GLOBAL default::current_approver) OR (.approver.user ?= GLOBAL default::current_user)));
      CREATE CONSTRAINT std::exclusive ON ((.proposal, .approver));
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
