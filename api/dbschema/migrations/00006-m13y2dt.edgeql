CREATE MIGRATION m13y2dtmcrd7yvmorrgn62mp2cakpvrcbz7p7g2rr4wk34b6ow7m7q
    ONTO m174x3tft7rqwxzekegp7qad4qlscof7tojfcmw4wielhp7h4mqsya
{
  ALTER TYPE default::Account {
      CREATE REQUIRED PROPERTY initialization: tuple<salt: default::Bytes32, bytecodeHash: default::Bytes32, aaVersion: default::uint16> {
          SET REQUIRED USING ((
              salt := .salt,
              bytecodeHash := '0x0100007b3eebe76a9052ad76c1efe68151404a98aee77b96cbdbc62df0660b27',
              aaVersion := 1
          ));
      };
  };
  ALTER TYPE default::Account {
      DROP PROPERTY salt;
  };
};
