CREATE MIGRATION m1pghke7tjutp5ra3zihcuheg7fcz76jcdkhsimsa62svjwuz35sjq
    ONTO m1534375kvtykpm3ma6wzn7xc6tbvyiwu6st2ofvmougl35ykldxda
{
  ALTER TYPE default::Proposal {
      CREATE REQUIRED PROPERTY validationErrors: array<tuple<reason: std::str, operation: std::int32>> {
          SET REQUIRED USING (<array<tuple<reason: std::str, operation: std::int32>>>{});
      };
      ALTER LINK policy {
          SET REQUIRED USING (std::assert_single((SELECT
              .account.policies FILTER
                  .isActive
          LIMIT
              1
          )));
      };
  };
  ALTER FUNCTION default::as_adddress(address: default::UAddress) {
      RENAME TO default::as_address;
  };
  ALTER TYPE default::Contact {
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
  };
  ALTER TYPE default::Proposal {
      DROP LINK potentialApprovers;
      DROP LINK potentialRejectors;
      ALTER LINK proposedBy {
          RESET readonly;
      };
      ALTER PROPERTY createdAt {
          RESET readonly;
      };
  };
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK potentialApprovers := ((.policy.stateOrDraft.approvers EXCEPT .approvals.approver));
      CREATE MULTI LINK potentialRejectors := ((.policy.stateOrDraft.approvers EXCEPT .rejections.approver));
  };
  ALTER TYPE default::Transaction {
      DROP CONSTRAINT std::exclusive ON (.hash);
  };
  ALTER TYPE default::Transaction {
      ALTER PROPERTY submitted {
          RENAME TO executable;
      };
      ALTER PROPERTY status {
          USING (SELECT
              std::assert_exists((default::TransactionStatus.Pending IF NOT (.executable) ELSE (default::TransactionStatus.Executing IF NOT (EXISTS (.result)) ELSE (default::TransactionStatus.Successful IF (.result IS default::Successful) ELSE (default::TransactionStatus.Failed IF (.result IS default::Failed) ELSE (default::TransactionStatus.Scheduled IF NOT (.result[IS default::Scheduled].cancelled) ELSE default::TransactionStatus.Cancelled))))))
          );
      };
  };
  ALTER TYPE default::Transferlike {
      CREATE LINK spentBy: default::Policy {
          CREATE REWRITE
              INSERT 
              USING (__subject__.systx.proposal.policy);
          CREATE REWRITE
              UPDATE 
              USING (__subject__.systx.proposal.policy);
      };
      CREATE INDEX ON ((.spentBy, .tokenAddress));
  };
};
