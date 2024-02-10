CREATE MIGRATION m1lzckoyyqqbnd3hkbo25xtfgspxje6p3ddt2tjygyio65uhu72ela
    ONTO m1snled4gso2wkpig4ozz776xv3xrfsozyuwqznukjvip2nlvoycpq
{
  CREATE SCALAR TYPE default::Url EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^https?://');
  };
  ALTER TYPE default::Proposal {
      CREATE CONSTRAINT std::exclusive ON ((.hash, .account));
      CREATE PROPERTY dapp: tuple<name: std::str, url: default::Url, icons: array<default::Url>>;
      ALTER PROPERTY hash {
          DROP CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY iconUri {
          SET TYPE default::Url;
      };
  };
  ALTER TYPE default::TransactionProposal {
      CREATE CONSTRAINT std::exclusive ON (.hash);
  };
};
