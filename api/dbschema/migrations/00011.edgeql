CREATE MIGRATION m1hwioexq7reh2jmmh2w5sfzts5et7t4onajoungfzrdkhf7236jga
    ONTO m1ay4hkdpakom2nbojx266tzvyor5scimto4yf3lg3db2jbp3o4fiq
{
  ALTER TYPE default::Event {
      CREATE CONSTRAINT std::exclusive ON ((.account, .block, .logIndex));
  };
  ALTER TYPE default::Event {
      DROP CONSTRAINT std::exclusive ON ((.block, .logIndex));
  };
};
