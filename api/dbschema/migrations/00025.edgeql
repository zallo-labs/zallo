CREATE MIGRATION m1mtcjc7yzjb3bdbeceba4rdzapf5ueqpcvcd3deja5kkmdmribxba
    ONTO m1zs2dzm5f4c6oqsssiuloaswnnxj3ibyzbuskxbrv4cmauyl4hjzq
{
  ALTER TYPE default::MessageProposal {
      CREATE REQUIRED PROPERTY updatable := (NOT (EXISTS (.signature)));
  };
  ALTER TYPE default::TransactionProposal {
      ALTER PROPERTY status {
          USING (SELECT
              std::assert_exists((default::TransactionProposalStatus.Pending IF NOT (EXISTS (.transaction)) ELSE (default::TransactionProposalStatus.Executing IF NOT (EXISTS (.transaction.receipt)) ELSE (default::TransactionProposalStatus.Successful IF .transaction.receipt.success ELSE default::TransactionProposalStatus.Failed))))
          );
      };
      CREATE REQUIRED PROPERTY updatable := ((.status IN {default::TransactionProposalStatus.Pending, default::TransactionProposalStatus.Failed}));
  };
};
