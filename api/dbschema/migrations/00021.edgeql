CREATE MIGRATION m1nueknzguzrpxizhpvltpod2nlc7uusvtmruwrpus37yq6uutzbja
    ONTO m1d7i7wbmzox6x4ywgqcfxzhz74c6d5gh2va4z4cyvdp4hmbfwaiga
{
  ALTER TYPE default::MessageProposal {
      CREATE PROPERTY signature: default::Bytes32;
  };
};
