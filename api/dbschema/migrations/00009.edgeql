CREATE MIGRATION m1jwusoq7prcupkzoamo27a3xog6km7g6flbokkpjgpdlpfcketytq
    ONTO m1ieimqg4nbwzedt7cbjyovzlxkhocwtxatcl2gabxoe2hecttd5xa
{
  ALTER TYPE default::Token {
      CREATE REQUIRED PROPERTY isFeeToken: std::bool {
          SET default := false;
      };
  };
};
