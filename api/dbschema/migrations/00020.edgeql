CREATE MIGRATION m1d7i7wbmzox6x4ywgqcfxzhz74c6d5gh2va4z4cyvdp4hmbfwaiga
    ONTO m1ae7jv3uwtvtvlnxy32bhc2ngryowmgu7tiuyhxezghjfxmalebia
{
  CREATE TYPE default::MessageProposal EXTENDING default::Proposal {
      CREATE REQUIRED PROPERTY message: std::str;
  };
  ALTER SCALAR TYPE default::MAC {
      CREATE CONSTRAINT std::regexp('^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$');
  };
  ALTER SCALAR TYPE default::MAC {
      DROP CONSTRAINT std::regexp('^(([0-9A-F]{2}:){5}([0-9A-F]{2}))|(([0-9A-F]{2}-){5}([0-9A-F]{2}))$');
  };
};
