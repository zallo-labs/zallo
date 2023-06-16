CREATE MIGRATION m1ax3siugyv5izskmwfrb5wjrbaxargln3bvqrzo6khyd3nmv2fsua
    ONTO m1dwo2pvuynlfac35hpnvhvv7bjn5wbv5yax57asylx3adptpbwu5a
{
  ALTER TYPE default::Proposal {
      ALTER PROPERTY label {
          SET REQUIRED USING ('unknown');
      };
  };
};
