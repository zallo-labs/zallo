CREATE MIGRATION m1zaryj3jsbcl4rt3h742emcgbpcyhroyd2dmhcpt2yl7sk6dc4vaa
    ONTO m1cxtyhsbft6itoedrg6pm7mn42ujaj2wdjvohnipkkygwiugqui6a
{
  ALTER TYPE default::Event {
      CREATE LINK transaction := (WITH
          transactionHash := 
              .transactionHash
      SELECT
          default::Transaction
      FILTER
          (.hash = transactionHash)
      );
  };
};
