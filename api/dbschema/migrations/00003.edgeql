CREATE MIGRATION m1435fhvwk2o5f5o223io5z5hnqyvn3tos7fccbqfzktlkx6mby6ta
    ONTO m1b6v3to67haboihjuqmcewsgw2bjto4lgntlfn3dalyhwwhbzyesq
{
  ALTER TYPE default::Proposal {
      DROP LINK potentialApprovers;
      DROP LINK potentialRejectors;
  };
};
