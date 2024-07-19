CREATE MIGRATION m1gnmzbvh3rhxrededmhys327r3t7tcwicnnqajqlcydyglsqmdtpa
    ONTO m1qek7a23nqh42rms7kw536pjj74szxn437qw75exsqiml5k55qlja
{
  CREATE SCALAR TYPE default::NonEmptyStr EXTENDING std::str {
      CREATE CONSTRAINT std::regexp(r'^\S');
  };
  ALTER TYPE default::Token {
      ALTER PROPERTY units {
          SET TYPE array<tuple<symbol: default::NonEmptyStr, decimals: default::uint16>>;
      };
  };
  ALTER TYPE default::Labelled {
      ALTER PROPERTY name {
          SET TYPE std::str;
      };
  };
  ALTER TYPE default::Contact {
      ALTER PROPERTY name {
          SET OWNED;
          SET REQUIRED;
          SET TYPE default::BoundedStr;
      };
  };
  ALTER TYPE default::Token {
      ALTER PROPERTY name {
          SET REQUIRED;
          SET OWNED;
          SET TYPE default::NonEmptyStr;
      };
      ALTER PROPERTY symbol {
          SET TYPE default::NonEmptyStr;
      };
  };
  ALTER SCALAR TYPE default::BoundedStr {
      CREATE CONSTRAINT std::regexp(r'^(?![0oO][xX])[^\n\t]{3,50}$');
  };
  ALTER SCALAR TYPE default::BoundedStr {
      DROP CONSTRAINT std::regexp(r'^(?![0O][xX])[^\n]{3,50}$');
  };
};
