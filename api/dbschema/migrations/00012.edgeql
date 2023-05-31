CREATE MIGRATION m15rh47g4ckwprxkkbs52zvvj3au4zuripm3kilh3ybficalcz6pva
    ONTO m1s3ndfpvlparfmzb62ekl7v4ibaiq3hvt2jlovihroq7d646bxaqa
{
  ALTER TYPE default::ProposalResponse {
      ALTER LINK proposal {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
