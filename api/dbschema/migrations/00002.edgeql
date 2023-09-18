CREATE MIGRATION m1rbwgidbwjbhps5acmbd7yf6g5i4hcdqcchddq7jageezfc6t5y4a
    ONTO m1nzn2nnrlbdshjgquvdlmotag2ti4gt6aiqeihhhqqv627rq5rvba
{
  ALTER TYPE default::TransactionProposal {
      ALTER LINK simulation {
          CREATE CONSTRAINT std::exclusive;
          RESET OPTIONALITY;
      };
  };
};
