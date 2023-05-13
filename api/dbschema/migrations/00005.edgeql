CREATE MIGRATION m126kcg7k7hamiadpbwmi7fgoou245eo5n6kfrictnlsfaetftvrtq
    ONTO m1d7gw3enxico7eyyqevkrpaaorn6oxdsgwvycg6df46r6yg5eddta
{
  ALTER TYPE default::Receipt {
      ALTER PROPERTY timestamp {
          RESET readonly;
      };
  };
  ALTER TYPE default::Transfer {
      CREATE REQUIRED PROPERTY timestamp -> std::datetime {
          SET default := (std::datetime_of_statement());
      };
  };
};
