CREATE MIGRATION m164na54yktdmcppgp344lszjzv5fow2xxbi7dhuzg6numoyrovm2a
    ONTO m15t6gua6muww6uhwekil5uw56if5b6jy2zjy3hca5o62zf74uzgja
{
  ALTER TYPE default::Event {
      ALTER LINK transaction {
          USING (WITH
              transactionHash := 
                  .transactionHash
              ,
              account := 
                  .account
          SELECT
              default::Transaction
          FILTER
              ((.hash = transactionHash) AND (.proposal.account = account))
          );
      };
      DROP PROPERTY isInternal;
  };
};
