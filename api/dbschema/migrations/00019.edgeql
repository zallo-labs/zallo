CREATE MIGRATION m1ae7jv3uwtvtvlnxy32bhc2ngryowmgu7tiuyhxezghjfxmalebia
    ONTO m1iejqdghgdne7tptobm2xuqejnui3lh7hocgvpp2rrvrjb75ofrja
{
  CREATE SCALAR TYPE default::MAC EXTENDING std::str {
      CREATE CONSTRAINT std::regexp('^(([0-9A-F]{2}:){5}([0-9A-F]{2}))|(([0-9A-F]{2}-){5}([0-9A-F]{2}))$');
  };
  ALTER TYPE default::Approver {
      DROP LINK bluetoothDevices;
  };
  ALTER TYPE default::Approver {
      CREATE PROPERTY bluetoothDevices: array<default::MAC>;
  };
  DROP TYPE default::BluetoothDevice;
};
