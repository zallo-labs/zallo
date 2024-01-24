CREATE MIGRATION m1jyyy6uam4hnajxp6wy2oi2bhxxgier2ryh6jxlpfplk35qq4dmma
    ONTO m1zqbhlsxnhu2qno6qeatcqq2qeznqcio4mpjmxqzhlq757c5l7hfa
{
  ALTER TYPE default::Account {
      CREATE PROPERTY activationEthFee: std::decimal {
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE PROPERTY upgradedAtBlock: std::bigint {
          CREATE CONSTRAINT std::min_value(0);
      };
  };
  # Account.upgradedAtBlock migration
  update Account filter .isActive set { upgradedAtBlock := 1 };
  # END
  ALTER TYPE default::Account {
      ALTER PROPERTY isActive {
          USING (EXISTS (.upgradedAtBlock));
      };
  };
  ALTER TYPE default::PolicyState {
      CREATE REQUIRED PROPERTY hasBeenActive := ((EXISTS (.activationBlock) OR .isAccountInitState));
      CREATE REQUIRED PROPERTY isActive := ((.hasBeenActive AND NOT (.isRemoved)));
  };
  ALTER TYPE default::Policy {
      ALTER LINK draft {
          USING (SELECT
              (SELECT
                  .stateHistory ORDER BY
                      .createdAt DESC
              LIMIT
                  1
              )
          FILTER
              NOT (.hasBeenActive)
          );
      };
      ALTER LINK state {
          USING (SELECT
              (SELECT
                  .stateHistory ORDER BY
                      .activationBlock DESC
              LIMIT
                  1
              )
          FILTER
              .hasBeenActive
          );
      };
      CREATE LINK stateOrDraft := (std::assert_exists((.state ?? .draft)));
  };
  ALTER TYPE default::Proposal {
      ALTER LINK potentialApprovers {
          USING (WITH
              approvers := 
                  DISTINCT (((.policy ?? .account.policies)).stateOrDraft.approvers.id)
              ,
              ids := 
                  (approvers EXCEPT .approvals.approver.id)
          SELECT
              default::Approver
          FILTER
              (.id IN ids)
          );
      };
      ALTER LINK potentialRejectors {
          USING (WITH
              approvers := 
                  DISTINCT (((.policy ?? .account.policies)).stateOrDraft.approvers.id)
              ,
              ids := 
                  (approvers EXCEPT .rejections.approver.id)
          SELECT
              default::Approver
          FILTER
              (.id IN ids)
          );
      };
  };
  CREATE TYPE default::PaymasterFees {
      CREATE REQUIRED PROPERTY activation: std::decimal {
          SET default := 0;
          CREATE CONSTRAINT std::min_value(0);
      };
      CREATE REQUIRED PROPERTY total := (.activation);
  };
  ALTER TYPE default::TransactionProposal {
      CREATE REQUIRED LINK maxPaymasterEthFees: default::PaymasterFees {
          SET default := (INSERT
              default::PaymasterFees
          );
          CREATE CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY paymasterEthFee {
          DROP CONSTRAINT std::min_value(0);
      };
  };
  ALTER TYPE default::Transaction {
      CREATE REQUIRED LINK paymasterEthFees: default::PaymasterFees {
          SET default := (INSERT
              default::PaymasterFees
          );
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY ethCreditUsed: std::decimal {
          SET default := 0;
          CREATE CONSTRAINT std::min_value(0);
      };
      ALTER PROPERTY ethDiscount {
          RESET default;
          USING ((.ethCreditUsed + (.proposal.maxPaymasterEthFees.total - .paymasterEthFees.total)));
          DROP CONSTRAINT std::min_value(0);
      };
      ALTER PROPERTY maxEthFees {
          USING (((.maxNetworkEthFee + .paymasterEthFees.total) - .ethDiscount));
      };
  };
  ALTER TYPE default::Receipt {
      ALTER PROPERTY ethFees {
          USING (((.networkEthFee + .transaction.paymasterEthFees.total) - .transaction.ethDiscount));
      };
  };
  ALTER TYPE default::TransactionProposal {
      DROP PROPERTY paymasterEthFee;
  };
  ALTER TYPE default::TransactionProposal {
      CREATE REQUIRED PROPERTY submitted: std::bool {
          SET default := false;
      };
      ALTER PROPERTY status {
          USING (SELECT
              std::assert_exists((default::TransactionProposalStatus.Pending IF (NOT (EXISTS (.transaction)) AND NOT (.submitted)) ELSE (default::TransactionProposalStatus.Executing IF NOT (EXISTS (.transaction.receipt)) ELSE (default::TransactionProposalStatus.Successful IF .transaction.receipt.success ELSE default::TransactionProposalStatus.Failed))))
          );
      };
  };
  # TransactionProposal.submitted migration
  update TransactionProposal filter exists .transaction
  set { submitted := true };
  # END
};
