CREATE MIGRATION m1mopz26j7t3sxeconuwhdczp57mplbf3zngnnzp6cxvflnbcs6oza
    ONTO m1nwc3cujiwarbetaxzrpnx3tnfu5fuebikisvdcpiwwncnh5s7mbq
{
  ALTER TYPE default::Policy {
      CREATE REQUIRED PROPERTY isEnabled := ((.isActive OR (.draft.isRemoved ?= false)));
  };
  ALTER TYPE default::Account {
      ALTER LINK policies {
          USING (SELECT
              .<account[IS default::Policy]
          FILTER
              .isEnabled
          );
      };
  };
  ALTER TYPE default::Proposal {
      CREATE REQUIRED PROPERTY validFrom: std::datetime {
          SET REQUIRED USING (std::to_datetime(([IS default::TransactionProposal].nonce ?? 0n)));
      };
  };
  ALTER TYPE default::PolicyState {
      CREATE INDEX ON (.createdAt);
      CREATE INDEX ON (.activationBlock);
  };
  ALTER TYPE default::Token {
      CREATE INDEX ON ((.address, .isFeeToken));
  };
  ALTER TYPE default::TransactionProposal {
      DROP CONSTRAINT std::exclusive ON ((.account, .nonce));
      ALTER PROPERTY nonce {
          USING (<std::bigint>math::floor(std::datetime_get(.validFrom, 'epochseconds')));
      };
  };
};
