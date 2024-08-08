CREATE MIGRATION m17qamgbzvrq5axhdxhdn526i3wz42l5yt3fjdgog73ihlovmrb2sq
    ONTO m15nf2s2pczdhpncvwih5festgbvzushr5qfunppqaqahdonqo3nba
{
  ALTER TYPE default::Event {
      ALTER PROPERTY confirmed {
          RESET default;
          DROP REWRITE
              INSERT ;
              DROP REWRITE
                  UPDATE ;
              };
              CREATE CONSTRAINT std::exclusive ON ((.account, .block, .logIndex)) EXCEPT (NOT (.confirmed));
          };
  ALTER TYPE default::Transaction {
      ALTER PROPERTY status {
          USING (WITH
              result := 
                  .result
          SELECT
              std::assert_exists((default::TransactionStatus.Pending IF (((result IS default::SimulatedSuccess) OR (result IS default::SimulatedFailure)) ?? true) ELSE (default::TransactionStatus.Executing IF (result IS default::OptimisticSuccess) ELSE (default::TransactionStatus.Successful IF (result IS default::ConfirmedSuccess) ELSE (default::TransactionStatus.Failed IF (result IS default::ConfirmedFailure) ELSE (default::TransactionStatus.Scheduled IF NOT (result[IS default::Scheduled].cancelled) ELSE default::TransactionStatus.Cancelled))))))
          );
      };
  };
  ALTER TYPE default::Transferlike {
      DROP CONSTRAINT std::exclusive ON ((.account, .block, .logIndex, .systxHash, .result));
  };
};
