CREATE MIGRATION m1msez63jkpjpwsku7jrbuu45dovo5hylpmgeylgdlt3temlkyvn7q
    ONTO m1flrdckmwin6sg42mvtplf7qh2l6z2kv3bkmutql23bffpz3zdlgq
{
  ALTER TYPE default::PolicyState {
      CREATE REQUIRED PROPERTY isLatest: std::bool {
          SET default := false;
      };
  };
  ALTER FUNCTION default::latestPolicy(account: default::Account, key: std::int64) USING (std::assert_single((SELECT
      default::Policy
  FILTER
      (((.account = account) AND (.key = key)) AND .isLatest)
  )));
  ALTER TYPE default::PolicyState {
      ALTER LINK latest {
          USING ((__source__ IF .isLatest ELSE default::latestPolicy(.account, .key)));
      };
      ALTER PROPERTY isLatest {
          CREATE REWRITE
              INSERT 
              USING ((((.activationBlock ?? 0n) > (((SELECT
                  default::latestPolicy(.account, .key)
              )).activationBlock ?? -1n)) IF NOT (__specified__.isLatest) ELSE .isLatest));
      };
      CREATE INDEX ON ((.account, .key, .isLatest));
      CREATE INDEX ON ((.account, .isLatest));
      ALTER PROPERTY isActive {
          USING ((.isLatest AND .hasBeenActive));
      };
  };
  ALTER TYPE default::Policy {
      ALTER TRIGGER update_proposals_when_deleted USING (UPDATE
          default::Proposal
      FILTER
          (((.account = __old__.account) AND (.policy.key = __old__.key)) AND (([IS default::Transaction].status ?= default::TransactionStatus.Pending) OR (EXISTS ([IS default::Message].id) AND NOT (EXISTS ([IS default::Message].signature)))))
      SET {
          policy := (SELECT
              default::Policy FILTER
                  (.account = __old__.account)
              ORDER BY
                  .isActive ASC
          LIMIT
              1
          )
      });
  };
  ALTER TYPE default::RemovedPolicy {
      CREATE TRIGGER update_proposals_when_latest
          AFTER UPDATE, INSERT 
          FOR EACH 
              WHEN (__new__.isLatest)
          DO (UPDATE
              default::Proposal
          FILTER
              (((.account = __new__.account) AND (.policy.key = __new__.key)) AND (([IS default::Transaction].status ?= default::TransactionStatus.Pending) OR (EXISTS ([IS default::Message].id) AND NOT (EXISTS ([IS default::Message].signature)))))
          SET {
              policy := (SELECT
                  default::Policy FILTER
                      (.account = __new__.account)
                  ORDER BY
                      .isActive ASC
              LIMIT
                  1
              )
          });
  };
  ALTER TYPE default::Policy {
      ALTER TRIGGER update_proposals RENAME TO update_proposals_when_latest;
  };
  ALTER TYPE default::Policy {
      DROP TRIGGER link_insert;
      ALTER TRIGGER update_proposals_when_latest WHEN (__new__.isLatest);
  };
  ALTER TYPE default::RemovedPolicy {
      DROP TRIGGER rm_policy_draft_link;
      DROP TRIGGER update_proposals;
  };
  ALTER TYPE default::Account {
      ALTER LINK policies {
          USING (SELECT
              .<account[IS default::Policy]
          FILTER
              .isLatest
          );
          RESET ON SOURCE DELETE;
          RESET ON TARGET DELETE;
      };
  };
  # Migrate PolicyState with new isLatest property
  # Latest PolicyState is the one with the highest activationBlock
  update PolicyState set {
    isLatest := (
      with id := .id,
           account := .account,
           key := .key,
           latest := (select detached PolicyState filter .account = account and .key = key order by .activationBlock desc limit 1)
      select (id ?= latest.id)
    )
  };
};
