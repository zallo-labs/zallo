CREATE MIGRATION m1ltit76m3dki4tixcyjxlzlcil27yag5depkcrr6sarp2hf3c7f6a
    ONTO m1gi4tvmgtsvjgnymrdmw5ebzvq5i6llq7raoa754vlopfvqlhslsa
{
  ALTER TYPE default::Policy {
      ALTER PROPERTY isActive {
          USING ((.state.isRemoved ?= false));
          SET REQUIRED;
      };
  };
  ALTER TYPE default::Account {
      ALTER LINK policies {
          USING (SELECT
              .<account[IS default::Policy]
          FILTER
              (.isActive OR EXISTS (.draft))
          );
      };
  };
};
