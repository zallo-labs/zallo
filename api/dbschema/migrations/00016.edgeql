CREATE MIGRATION m1x2p5oglo4p7ykvxrk75ayg267szxsumf4dji2bvxc5l2kidrtwmq
    ONTO m1xt56vhrl2i7aephtnwvrfgcoiv6rjqh2il5dcyg3qq74m3jf77da
{
  ALTER TYPE default::Account {
      ALTER LINK policies {
          USING (SELECT
              .<account[IS default::Policy]
          FILTER
              (.state.isRemoved ?= false)
          );
      };
  };
};
