CREATE MIGRATION m15qa7xcj2axpg5klzflagyeamffbaffuv5ncuskfef5fpozakc5ra
    ONTO m1pghke7tjutp5ra3zihcuheg7fcz76jcdkhsimsa62svjwuz35sjq
{
  CREATE TYPE default::GlobalLabel {
      CREATE REQUIRED PROPERTY address: default::UAddress {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY label: default::Label;
  };
  CREATE FUNCTION default::labelForUser(addressParam: std::str, user: default::User) -> OPTIONAL std::str USING (WITH
      address := 
          <default::UAddress>addressParam
  SELECT
      std::assert_single((((SELECT
          default::Contact
      FILTER
          ((.address = address) AND (.user = user))
      )).label ?? (((SELECT
          default::Account
      FILTER
          (.address = address)
      )).label ?? (((SELECT
          default::Token
      FILTER
          ((.address = address) AND (.user = user))
      )).name ?? (((SELECT
          default::Token
      FILTER
          (.address = address)
      )).name ?? (((SELECT
          default::Approver
      FILTER
          (.address = default::as_address(address))
      )).name ?? ((SELECT
          default::GlobalLabel
      FILTER
          (.address = address)
      )).label))))))
  );
  CREATE FUNCTION default::label(address: std::str) -> OPTIONAL std::str USING (SELECT
      default::labelForUser(address, GLOBAL default::current_user)
  );
  CREATE FUNCTION default::token(address: default::UAddress, userParam: OPTIONAL default::User) -> OPTIONAL default::Token USING (WITH
      user := 
          (userParam ?? GLOBAL default::current_user)
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
};
