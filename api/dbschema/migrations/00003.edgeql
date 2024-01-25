CREATE MIGRATION m1snled4gso2wkpig4ozz776xv3xrfsozyuwqznukjvip2nlvoycpq
    ONTO m1jyyy6uam4hnajxp6wy2oi2bhxxgier2ryh6jxlpfplk35qq4dmma
{
  ALTER TYPE default::Contact {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE default::ProposalRiskLabel {
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
