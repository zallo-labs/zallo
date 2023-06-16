CREATE MIGRATION m15ezk3hpf62r4qa6dy2inn5pygl5cfopvocmugir7hn3iwqw4ru3q
    ONTO m1nq27om7mnbnantnlyxmr46jpufaraztzc7grl5t6wlowgur523cq
{
  ALTER TYPE default::Receipt {
      CREATE REQUIRED PROPERTY responses -> array<default::Bytes> {
          SET REQUIRED USING ([.response]);
      };
  };
  ALTER TYPE default::Receipt {
      DROP PROPERTY response;
  };
};
