CREATE MIGRATION m1duqzmooeedbv7q6lrapdpzyx6oma3imc7smb76rcbuwq5j5hhlha
    ONTO m1ixwuta36tgsbk4zjd3gjwizp4xgp5bcjaabihz7szcge4vcupxma
{
  ALTER TYPE default::TransferDetails {
      CREATE ACCESS POLICY members_only
          ALLOW ALL USING ((.account.id IN GLOBAL default::current_user_accounts));
  };
};
