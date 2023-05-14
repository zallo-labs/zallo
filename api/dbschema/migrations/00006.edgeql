CREATE MIGRATION m1ixwuta36tgsbk4zjd3gjwizp4xgp5bcjaabihz7szcge4vcupxma
    ONTO m126kcg7k7hamiadpbwmi7fgoou245eo5n6kfrictnlsfaetftvrtq
{
  ALTER SCALAR TYPE default::Bytes4 {
      CREATE CONSTRAINT std::regexp('^0x[0-9a-fA-F]{8}$');
  };
  ALTER SCALAR TYPE default::Bytes4 {
      DROP CONSTRAINT std::regexp('^0x[0-9a-fA-F]{10}$');
  };
};
