CREATE MIGRATION m174x3tft7rqwxzekegp7qad4qlscof7tojfcmw4wielhp7h4mqsya
    ONTO m17qamgbzvrq5axhdxhdn526i3wz42l5yt3fjdgog73ihlovmrb2sq
{
  ALTER TYPE default::Result {
      ALTER TRIGGER update_tx_result WHEN (((__new__.timestamp >= __new__.transaction.result.timestamp) ?? true));
  };
  ALTER TYPE default::Transaction {
      ALTER PROPERTY status {
          USING (WITH
              result := 
                  .result
          SELECT
              std::assert_exists((default::TransactionStatus.Pending IF (((result IS default::SimulatedSuccess) OR (result IS default::SimulatedFailure)) ?? true) ELSE (default::TransactionStatus.Successful IF (((result IS default::OptimisticSuccess) OR (result IS default::ConfirmedSuccess)) ?? false) ELSE (default::TransactionStatus.Failed IF (result IS default::ConfirmedFailure) ELSE (default::TransactionStatus.Scheduled IF NOT (result[IS default::Scheduled].cancelled) ELSE default::TransactionStatus.Cancelled)))))
          );
      };
  };
  ALTER SCALAR TYPE default::TransactionStatus EXTENDING enum<Pending, Scheduled, Successful, Failed, Cancelled>;
};
