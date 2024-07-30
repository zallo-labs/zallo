CREATE MIGRATION m17arqyctfz6btivr4soubbql7ruianngjqd3y4p5sdnbqcgvcz4tq
    ONTO m1ob6arfwyamzcpgk2hgzhby3iwv3moewthqacorsw2mtyjkopdoaq
{
  ALTER TYPE default::Policy {
      CREATE REQUIRED PROPERTY hash: default::Bytes32 {
          SET REQUIRED USING (<default::Bytes32>'0x0000000000000000000000000000000000000000000000000000000000000000');
      };
      CREATE INDEX ON ((.account, .key, .hash));
  };
};
