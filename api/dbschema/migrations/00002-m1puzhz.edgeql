CREATE MIGRATION m1b4kmwwkkxbx7nv3ze7u3c5td4y35hzgyinz422ny3npt4jpkcc3a
    ONTO m1vh7caqxl35lle7od4cqf4gaeabpurttipgns3nylfnnnzjb2bbqa
{
  ALTER TYPE default::Simulation {
      DROP PROPERTY responses;
      DROP LINK transfers;
      DROP PROPERTY success;
      DROP PROPERTY timestamp;
  };
  ALTER TYPE default::Confirmed {
      ALTER PROPERTY gasUsed {
          DROP CONSTRAINT std::min_value(0);
      };
  };
  ALTER TYPE default::Confirmed {
      DROP PROPERTY networkEthFee;
  };
  ALTER TYPE default::Confirmed {
      DROP PROPERTY gasUsed;
  };
  ALTER TYPE default::Success {
      DROP PROPERTY response;
  };
  ALTER TYPE default::Result {
      CREATE REQUIRED PROPERTY response: default::Bytes {
          SET default := '0x';
      };
  };
  CREATE TYPE default::SimulatedFailure EXTENDING default::Failure;
  CREATE TYPE default::SimulatedSuccess EXTENDING default::Success;
  ALTER TYPE default::Transaction {
      DROP LINK simulation;
  };
  DROP TYPE default::Simulation;
  ALTER TYPE default::Result {
      CREATE REQUIRED PROPERTY gasUsed: std::bigint {
          SET REQUIRED USING (<std::bigint>0n);
          CREATE CONSTRAINT std::min_value(0);
      };
  };
  ALTER TYPE default::Confirmed {
      CREATE REQUIRED PROPERTY networkEthFee := ((.ethFeePerGas * .gasUsed));
  };
};
