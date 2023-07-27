CREATE MIGRATION m15t6gua6muww6uhwekil5uw56if5b6jy2zjy3hca5o62zf74uzgja
    ONTO m1hleb5blsuh3z4s5lfbqqqqcvdgu5ijmpsktmqo6gedggaod5z3oa
{
  ALTER TYPE default::Event {
      ALTER LINK transaction {
          USING (WITH
              transactionHash := 
                  .transactionHash
          SELECT
              default::Transaction
          FILTER
              (.hash = transactionHash)
          );
      };
      CREATE PROPERTY isInternal := (SELECT
          (.transaction.proposal.account ?= .account)
      );
  };
};
