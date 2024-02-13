CREATE MIGRATION m1kdsqwbl6ky5d2efxetgbcxvto5bxbamm42e4z3yvkvaphhvbvnwq
    ONTO m1oxomw6ib3ov3khzqlk2rh5fdl7q5aq7wplzvnethdcl2ahuenyha
{
  ALTER TYPE default::PolicyState {
      CREATE REQUIRED PROPERTY allowMessages: std::bool {
          SET default := false;
      };
  };
};
