CREATE MIGRATION m15nf2s2pczdhpncvwih5festgbvzushr5qfunppqaqahdonqo3nba
    ONTO m1b4kmwwkkxbx7nv3ze7u3c5td4y35hzgyinz422ny3npt4jpkcc3a
{
  ALTER TYPE default::SimulatedFailure {
      CREATE REQUIRED PROPERTY validationErrors: array<std::str> {
          SET default := (<array<std::str>>[]);
      };
  };
  ALTER TYPE default::Transaction {
      ALTER PROPERTY executable {
          RESET default;
          USING (((.result IS default::SimulatedSuccess) ?? false));
      };
      ALTER PROPERTY status {
          USING (WITH
              result := 
                  .result
          SELECT
              std::assert_exists((default::TransactionStatus.Pending IF ((NOT (EXISTS (result)) OR (result IS default::SimulatedSuccess)) OR (result IS default::SimulatedFailure)) ELSE (default::TransactionStatus.Executing IF (result IS default::OptimisticSuccess) ELSE (default::TransactionStatus.Successful IF (result IS default::ConfirmedSuccess) ELSE (default::TransactionStatus.Failed IF (result IS default::ConfirmedFailure) ELSE (default::TransactionStatus.Scheduled IF NOT (result[IS default::Scheduled].cancelled) ELSE default::TransactionStatus.Cancelled))))))
          );
      };
  };
};
