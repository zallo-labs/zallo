CREATE MIGRATION m1gi4tvmgtsvjgnymrdmw5ebzvq5i6llq7raoa754vlopfvqlhslsa
    ONTO m1mtcjc7yzjb3bdbeceba4rdzapf5ueqpcvcd3deja5kkmdmribxba
{
  ALTER TYPE default::MessageProposal {
      DROP PROPERTY updatable;
  };
  ALTER TYPE default::TransactionProposal {
      DROP PROPERTY updatable;
  };
};
