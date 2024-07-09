CREATE MIGRATION m1xxbha23rn2m7gieqfqhwximficcxjmc2dtzj4cmd23h5553fulla
    ONTO m1imkvo47oo366iu7zqrwaefcvolw25t5nqefaqca467febwhkkxla
{
  ALTER TYPE default::ApproverDetails {
      DROP PROPERTY bluetoothDevices;
      DROP ACCESS POLICY user_select_insert_update;
  };
  ALTER FUNCTION default::labelForUser(addressParam: std::str, user: default::User) USING (WITH
      address := 
          <default::UAddress>addressParam
      ,
      label := 
          (std::assert_single((SELECT
              default::Labelled FILTER
                  (.address = address)
              ORDER BY
                  [IS default::UserLabelled] ASC
          LIMIT
              1
          ))).name
  SELECT
      label
  );
  ALTER TYPE default::Approver {
      ALTER LINK details {
          DROP CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY label {
          USING (.labelled.name);
      };
  };
  ALTER TYPE default::Approver {
      DROP LINK details;
  };
  DROP TYPE default::ApproverDetails;
  CREATE TYPE default::ApproverDetails {
      CREATE PROPERTY bluetoothDevices: array<default::MAC>;
      CREATE REQUIRED LINK approver: default::Approver {
          ON TARGET DELETE DELETE SOURCE;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name: default::BoundedStr;
      CREATE ACCESS POLICY user_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING ((.approver.user ?= GLOBAL default::current_user));
      CREATE PROPERTY cloud: tuple<provider: default::CloudProvider, subject: std::str>;
      CREATE PROPERTY pushToken: std::str;
  };
  ALTER TYPE default::Approver {
      CREATE LINK details := (.<approver[IS default::ApproverDetails]);
      ALTER PROPERTY label {
          USING ((.details.name ?? .labelled.name));
      };
  };
  ALTER FUNCTION default::labelForUser(addressParam: std::str, user: default::User) USING (WITH
      address := 
          <default::UAddress>addressParam
      ,
      label := 
          (std::assert_single((SELECT
              default::Labelled FILTER
                  (.address = address)
              ORDER BY
                  [IS default::UserLabelled] ASC
          LIMIT
              1
          ))).name
      ,
      approverLabel := 
          ((SELECT
              default::Approver
          FILTER
              (.address = default::as_address(address))
          )).details.name
  SELECT
      (label ?? approverLabel)
  );
};
