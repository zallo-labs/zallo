CREATE MIGRATION m1xvnde4rwrqt74ur7d7x7zylmjhuqizwf6evia353irj6bolw7mha
    ONTO m1zwncj7mrhfhphosci4ujc67hsbingvjgvgiugpjbcq4djoyb2x5q
{
  ALTER TYPE default::Account {
      ALTER LINK policies {
          USING (SELECT
              .<account[IS default::Policy]
          FILTER
              (.isActive OR (.draft.isRemoved ?= false))
          );
      };
  };
};
