CREATE MIGRATION m13cuxdtmhuxfiwnturzno3civxd46hk7ld7umpojxjc2fl4lzgqba
    ONTO m1x2p5oglo4p7ykvxrk75ayg267szxsumf4dji2bvxc5l2kidrtwmq
{
  CREATE TYPE default::BluetoothDevice {
      CREATE PROPERTY mac: std::str {
          CREATE CONSTRAINT std::regexp('^(([0-9A-F]{2}:){5}([0-9A-F]{2}))|(([0-9A-F]{2}-){5}([0-9A-F]{2}))$');
      };
      CREATE REQUIRED PROPERTY name: std::str;
      CREATE REQUIRED PROPERTY serviceUuid: std::uuid;
  };
  ALTER TYPE default::Approver {
      CREATE MULTI LINK bluetoothDevices: default::BluetoothDevice;
  };
};
