CREATE MIGRATION m1htin4h3ticbesp6lu3ehk5owkdpzke6lo4fxvmeiaqp76evfq4vq
    ONTO m1xvnde4rwrqt74ur7d7x7zylmjhuqizwf6evia353irj6bolw7mha
{
  ALTER TYPE default::PolicyState {
      ALTER PROPERTY isAccountInitState {
          USING ((NOT (EXISTS (.proposal)) AND NOT (.isRemoved)));
      };
  };
};
