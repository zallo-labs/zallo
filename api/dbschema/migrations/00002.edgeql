CREATE MIGRATION m1ueohvlgtj6aqozt7cif6c5hop6hzv5ltdxkja3h7wznjrcgqa4fa
    ONTO m12q2isam5fxdgkmxirhw6jrfiwm6slsadsospn4ljbx3ylyodlkla
{
  ALTER TYPE default::Approver {
      DROP CONSTRAINT std::exclusive ON ((.user, .name));
  };
  CREATE SCALAR TYPE default::CloudProvider EXTENDING enum<Apple, Google>;
  CREATE TYPE default::CloudShare {
      CREATE REQUIRED PROPERTY provider: default::CloudProvider;
      CREATE REQUIRED PROPERTY subject: std::str;
      CREATE CONSTRAINT std::exclusive ON ((.provider, .subject));
      CREATE REQUIRED PROPERTY share: std::str;
  };
  ALTER TYPE default::Approver {
      CREATE LINK cloud: default::CloudShare {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK potentialApprovers := (WITH
          potentialResponses := 
              DISTINCT ((((SELECT
                  .policy
              ) ?? .account.policies)).state.approvers.id)
          ,
          ids := 
              (potentialResponses EXCEPT .approvals.approver.id)
      SELECT
          default::Approver
      FILTER
          (.id IN ids)
      );
  };
  ALTER TYPE default::Proposal {
      CREATE MULTI LINK potentialRejectors := (WITH
          potentialResponses := 
              DISTINCT ((((SELECT
                  .policy
              ) ?? .account.policies)).state.approvers.id)
          ,
          ids := 
              (potentialResponses EXCEPT .rejections.approver.id)
      SELECT
          default::Approver
      FILTER
          (.id IN ids)
      );
  };
  ALTER TYPE default::Proposal {
      DROP LINK responses;
  };
  ALTER TYPE default::User {
      CREATE PROPERTY photoUri: std::str;
  };
};
