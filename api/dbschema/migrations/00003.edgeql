CREATE MIGRATION m1s34xs3feijy2o7fvqa6rcy5ydmr3jzzeua2vovgwph3lxolevl2a
    ONTO m1mopz26j7t3sxeconuwhdczp57mplbf3zngnnzp6cxvflnbcs6oza
{
  ALTER TYPE default::Transfer {
      CREATE INDEX ON ((.account, .internal));
  };
  CREATE SCALAR TYPE default::TransferDirection EXTENDING enum<`In`, Out>;
  ALTER TYPE default::TransferDetails {
      CREATE REQUIRED MULTI PROPERTY direction: default::TransferDirection {
          SET REQUIRED USING ((({default::TransferDirection.`In`} IF (.account.address = .to) ELSE <default::TransferDirection>{}) UNION ({default::TransferDirection.Out} IF (.account.address = .from) ELSE <default::TransferDirection>{})));
      };
  };
};
