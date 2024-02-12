CREATE MIGRATION m1oxomw6ib3ov3khzqlk2rh5fdl7q5aq7wplzvnethdcl2ahuenyha
    ONTO m1lzckoyyqqbnd3hkbo25xtfgspxje6p3ddt2tjygyio65uhu72ela
{
  # Delete MessageProposals not already signed
  delete MessageProposal filter not exists .signature;
  #
  ALTER TYPE default::MessageProposal {
      CREATE REQUIRED PROPERTY signedHash: default::Bytes32 {
          SET REQUIRED USING (.hash);
      };
  };
};
