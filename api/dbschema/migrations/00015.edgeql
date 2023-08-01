CREATE MIGRATION m1xt56vhrl2i7aephtnwvrfgcoiv6rjqh2il5dcyg3qq74m3jf77da
    ONTO m164na54yktdmcppgp344lszjzv5fow2xxbi7dhuzg6numoyrovm2a
{
  ALTER TYPE default::Receipt {
      ALTER LINK events {
          USING (WITH
              tx := 
                  .transaction
          SELECT
              default::Event
          FILTER
              (.transaction = tx)
          );
      };
  };
};
