CREATE MIGRATION m1dvaeoglquugsmzozdywq2vi2hwfo2yl32rfd2pj66gk62ibqeiga
    ONTO m1msez63jkpjpwsku7jrbuu45dovo5hylpmgeylgdlt3temlkyvn7q
{
  CREATE TYPE default::ApproverDetails {
      CREATE REQUIRED LINK approver: default::Approver {
          ON TARGET DELETE DELETE SOURCE;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY name: default::BoundedStr;
      CREATE ACCESS POLICY user_select_insert_update
          ALLOW SELECT, UPDATE, INSERT USING ((.approver.user ?= GLOBAL default::current_user));
      CREATE PROPERTY bluetoothDevices: array<default::MAC>;
      CREATE PROPERTY cloud: tuple<provider: default::CloudProvider, subject: std::str>;
      CREATE PROPERTY pushToken: std::str;
  };
  ALTER TYPE default::Approver {
      CREATE LINK details := (.<approver[IS default::ApproverDetails]);
      DROP ACCESS POLICY user_select_update;
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
  ALTER TYPE default::Event {
      DROP INDEX ON ((.account, .internal));
      DROP PROPERTY internal;
  };
  ALTER TYPE default::PolicyState {
      ALTER PROPERTY isLatest {
          DROP REWRITE
              INSERT ;
          };
      };
  ALTER TYPE default::PolicyState {
      ALTER PROPERTY isLatest {
          CREATE REWRITE
              INSERT 
              USING ((.isLatest IF __specified__.isLatest ELSE ((.activationBlock ?? 0n) > ((std::assert_single((SELECT
                  default::Policy
              FILTER
                  (((.account = __subject__.account) AND (.key = __subject__.key)) AND .isLatest)
              ))).activationBlock ?? -1n))));
      };
  };
  ALTER TYPE default::TransferDetails {
      CREATE REQUIRED PROPERTY incoming: std::bool {
          SET REQUIRED USING (<std::bool>(default::TransferDirection.`In` IN .direction));
      };
      CREATE REQUIRED PROPERTY outgoing: std::bool {
          SET REQUIRED USING (<std::bool>(default::TransferDirection.Out IN .direction));
      };
  };
  # Migrate Approver details -> ApproverDetails
  for approver in (select Approver) union (
    insert ApproverDetails {
        approver := approver,
        name := approver.name,
        bluetoothDevices := approver.bluetoothDevices,
        cloud := approver.cloud,
        pushToken := approver.pushToken
    }
  );
  #
  # Drop fields
  ALTER TYPE default::Approver {
      DROP PROPERTY bluetoothDevices;
      DROP PROPERTY cloud;
      DROP PROPERTY name;
      DROP PROPERTY pushToken;
  };
  ALTER TYPE default::Event {
      CREATE REQUIRED PROPERTY internal: std::bool {
          SET REQUIRED USING (<std::bool>EXISTS (.systx));
      };
      CREATE INDEX ON ((.account, .internal));
  };
  ALTER TYPE default::Transfer {
      CREATE INDEX ON ((.account, .internal, .incoming));
  };
  ALTER TYPE default::TransferDetails {
      DROP PROPERTY direction;
  };
  DROP SCALAR TYPE default::TransferDirection;
};
