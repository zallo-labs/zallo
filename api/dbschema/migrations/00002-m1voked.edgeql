CREATE MIGRATION m1vokedh43l6kh3patj252hywfbvi5pauxotmhyyfnmih5hsn47plq
    ONTO m17zysktd275lmeyaal7evvoerfedmpq7tmjiip5r2jdrben4el2rq
{
  ALTER TYPE default::PolicyState {
      ALTER PROPERTY active {
          RENAME TO isActive;
      };
  };
  ALTER TYPE default::PolicyState {
      CREATE REQUIRED PROPERTY isDraft := (EXISTS (.draft));
  };
};
