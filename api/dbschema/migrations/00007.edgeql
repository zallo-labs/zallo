CREATE MIGRATION m1b5cc4o7fsvnv5lt7erdyxsybg73n3u5vo3ifavs4fl5ydyy2efrq
    ONTO m1wxigzvqt6fozw4qtr3jkhcarzg3teox7zvmv3t4ehedw7n4yqf4q
{
  DROP FUNCTION default::token(address: default::UAddress, userParam: OPTIONAL default::User);
  CREATE FUNCTION default::tokenForUser(addressParam: std::str, user: default::User) -> OPTIONAL default::Token USING (WITH
      address := 
          <default::UAddress>addressParam
  SELECT
      std::assert_single(((SELECT
          default::Token
      FILTER
          ((.address = address) AND (.user = user))
      ) ?? (SELECT
          default::Token
      FILTER
          (.address = address)
      )))
  );
  CREATE FUNCTION default::token(address: std::str) -> OPTIONAL default::Token USING (SELECT
      default::tokenForUser(address, GLOBAL default::current_user)
  );
};
