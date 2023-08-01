CREATE MIGRATION m1ieimqg4nbwzedt7cbjyovzlxkhocwtxatcl2gabxoe2hecttd5xa
    ONTO m1sjiuyqoyekdqgtairbp5gissulizcxj2drnpkfomrdwizageqwia
{
  ALTER TYPE default::TransactionProposal {
      DROP PROPERTY feeToken;
  };
  ALTER TYPE default::TransactionProposal {
      CREATE REQUIRED LINK feeToken: default::Token {
          SET REQUIRED USING (SELECT
              std::assert_exists((SELECT
                  std::assert_single((SELECT
                      default::Token
                  FILTER
                      ((.address = '0x0000000000000000000000000000000000000000') AND NOT (EXISTS (.user)))
                  ))
              ))
          );
      };
  };
};
