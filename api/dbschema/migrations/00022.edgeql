CREATE MIGRATION m1wtdsr24jrkxepdo34xz7bvmpo3itkggynsmf6ftbu47bwfrrcd4q
    ONTO m1nueknzguzrpxizhpvltpod2nlc7uusvtmruwrpus37yq6uutzbja
{
  ALTER TYPE default::ProposalResponse {
      ALTER PROPERTY createdAt {
          SET REQUIRED USING (<std::datetime>{});
      };
  };
  ALTER TYPE default::Proposal {
      ALTER PROPERTY createdAt {
          SET REQUIRED USING (<std::datetime>{});
      };
      CREATE PROPERTY iconUri: std::str;
  };
};
