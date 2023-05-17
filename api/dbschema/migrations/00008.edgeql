CREATE MIGRATION m1h2vnbsvhx3clbzmtpcjvpush6pi4h2g52fmanvmdwy7qtiyped3q
    ONTO m1duqzmooeedbv7q6lrapdpzyx6oma3imc7smb76rcbuwq5j5hhlha
{
  ALTER TYPE default::TransferDetails {
      CREATE ACCESS POLICY members_can_select_insert
          ALLOW SELECT, INSERT USING ((.account.id IN GLOBAL default::current_user_accounts));
  };
  ALTER TYPE default::TransferDetails {
      DROP ACCESS POLICY members_only;
  };
};
