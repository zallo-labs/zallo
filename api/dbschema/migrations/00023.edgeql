CREATE MIGRATION m1rr7ln4j5e2zwtbmz7jskyry2edhbfnmmaddktwwwtcm3nqli67da
    ONTO m1wtdsr24jrkxepdo34xz7bvmpo3itkggynsmf6ftbu47bwfrrcd4q
{
  ALTER TYPE default::MessageProposal {
      ALTER PROPERTY signature {
          SET TYPE default::Bytes;
      };
  };
};
