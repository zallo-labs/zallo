CREATE MIGRATION m1f6vzlem2msa2mm7yspdpnnly7tovfunwwsgen5zfnxo4jiwap6wq
    ONTO m1kvjsal3knijeo6s4lggvatpwllo3qjv5gfg72ceg36hrhzwoxemq
{
  # Migrations
  #
  # Account.address -> UAddress
  ALTER TYPE default::Account {
      ALTER PROPERTY address {
          SET TYPE std::str;
          SET readonly := false;
      };
  };
  update Account set {
    address := "zksync-goerli:" ++ .address
  };
  # Contact.address -> UAddress
  ALTER TYPE default::Contact {
      ALTER PROPERTY address {
          SET TYPE std::str;
      };
  };
  update Contact set {
    address := "zksync-goerli:" ++ .address
  };
  # Token.address -> UAddress
  ALTER TYPE default::Token {
      ALTER PROPERTY address {
          SET TYPE std::str;
      };
  };
  update Token set {
    address := "zksync-goerli:" ++ .address
  };
  # TransferDetails.tokenAddress -> UAddress
  ALTER TYPE default::TransferDetails {
      ALTER PROPERTY tokenAddress {
          SET TYPE std::str;
      };
  };
  update TransferDetails set {
    tokenAddress := "zksync-goerli:" ++ .tokenAddress
  };
  #
  # /Migration
  CREATE SCALAR TYPE default::UAddress EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^[0-9a-zA-Z-]+?:0x[0-9a-fA-F]{40}$');
  };
  CREATE FUNCTION default::as_adddress(address: default::UAddress) ->  default::Address USING ((std::str_split(address, ':'))[1]);
  CREATE FUNCTION default::as_chain(address: default::UAddress) ->  std::str USING ((std::str_split(address, ':'))[0]);
  ALTER TYPE default::Token {
      ALTER PROPERTY address {
          SET TYPE default::UAddress;
      };
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
  };
  ALTER TYPE default::Token {
      CREATE CONSTRAINT std::exclusive ON ((.user, .chain, .symbol));
  };
  ALTER TYPE default::Token {
      CREATE CONSTRAINT std::exclusive ON ((.user, .chain, .name));
  };
  ALTER TYPE default::Account {
      ALTER PROPERTY address {
          SET TYPE default::UAddress;
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY chain := (default::as_chain(.address));
  };
  ALTER TYPE default::Contact {
      ALTER PROPERTY address {
          SET TYPE default::UAddress;
      };
  };
  ALTER TYPE default::Token {
      DROP CONSTRAINT std::exclusive ON ((.user, .name));
  };
  ALTER TYPE default::Token {
      DROP CONSTRAINT std::exclusive ON ((.user, .symbol));
  };
  ALTER TYPE default::TransferDetails {
      ALTER PROPERTY tokenAddress {
          SET TYPE default::UAddress;
      };
  };
};
