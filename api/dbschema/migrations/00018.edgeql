CREATE MIGRATION m1iejqdghgdne7tptobm2xuqejnui3lh7hocgvpp2rrvrjb75ofrja
    ONTO m13cuxdtmhuxfiwnturzno3civxd46hk7ld7umpojxjc2fl4lzgqba
{
  ALTER TYPE default::BluetoothDevice {
      ALTER PROPERTY mac {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
