CREATE MIGRATION m1ay4hkdpakom2nbojx266tzvyor5scimto4yf3lg3db2jbp3o4fiq
    ONTO m1jwusoq7prcupkzoamo27a3xog6km7g6flbokkpjgpdlpfcketytq
{
  ALTER TYPE default::TransferDetails {
      CREATE LINK token := (std::assert_single((WITH
          address := 
              .tokenAddress
      SELECT
          default::Token FILTER
              (.address = address)
          ORDER BY
              EXISTS (.user) DESC
      LIMIT
          1
      )));
  };
};
