CREATE MIGRATION m1cxtyhsbft6itoedrg6pm7mn42ujaj2wdjvohnipkkygwiugqui6a
    ONTO m1aqkll5lytwjeplymoshgmayoiplwed7yacg3rvye3ivq2u7b2e5a
{
  ALTER TYPE default::Receipt {
      CREATE MULTI LINK transferApprovalEvents := (.events[IS default::TransferApproval]);
      CREATE MULTI LINK transferEvents := (.events[IS default::Transfer]);
  };
};
