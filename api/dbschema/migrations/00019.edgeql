CREATE MIGRATION m1nq27om7mnbnantnlyxmr46jpufaraztzc7grl5t6wlowgur523cq
    ONTO m1ax3siugyv5izskmwfrb5wjrbaxargln3bvqrzo6khyd3nmv2fsua
{
  ALTER TYPE default::Proposal {
      ALTER PROPERTY label {
          RESET OPTIONALITY;
      };
  };
};
