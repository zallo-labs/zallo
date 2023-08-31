CREATE MIGRATION m1342aal2awpsrrqjrw22p5bx27r3ors7df7s3tc2wc73a2h4pbn3a
    ONTO m1zysecb76lyakyxbgfruv473xa7fphl6fcrec5amjn2kcb6vfbyeq
{
  CREATE SCALAR TYPE default::ProposalRisk EXTENDING enum<Low, Medium, High>;
  CREATE TYPE default::ProposalRiskLabel {
      CREATE REQUIRED LINK proposal: default::Proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED LINK user: default::User {
          SET default := (<default::User>(GLOBAL default::current_user).id);
      };
      CREATE CONSTRAINT std::exclusive ON ((.proposal, .user));
      CREATE REQUIRED PROPERTY risk: default::ProposalRisk;
  };
  ALTER TYPE default::Proposal {
      CREATE LINK riskLabel := (std::assert_single((SELECT
          .<proposal[IS default::ProposalRiskLabel]
      FILTER
          (.user = GLOBAL default::current_user)
      )));
  };
};
