CREATE MIGRATION m15hkrftwylaqxhukwmyhd5blksv2posmxziazkm336ygxrlnkr25q
    ONTO m1l2n4yt6k72ya6cwtr32ekm7ntwvkt4s7mkz5cujgczglsvwfqrma
{
  ALTER TYPE default::Token {
      DROP CONSTRAINT std::exclusive ON ((.user, .testnetAddress));
  };
  ALTER TYPE default::Token {
      ALTER PROPERTY testnetAddress {
          RENAME TO address;
      };
  };
  ALTER TYPE default::Token {
      CREATE CONSTRAINT std::exclusive ON ((.user, .address));
  };
};
