CREATE MIGRATION m1hleb5blsuh3z4s5lfbqqqqcvdgu5ijmpsktmqo6gedggaod5z3oa
    ONTO m1hwioexq7reh2jmmh2w5sfzts5et7t4onajoungfzrdkhf7236jga
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
  };
};
