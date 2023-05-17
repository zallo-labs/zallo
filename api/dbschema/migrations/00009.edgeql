CREATE MIGRATION m1t3neu2fnpbp2h2cerc7lkq2zrfmbithjwt3vb33jg2nota7xb2ha
    ONTO m1h2vnbsvhx3clbzmtpcjvpush6pi4h2g52fmanvmdwy7qtiyped3q
{
  ALTER TYPE default::TransferDetails {
      ALTER PROPERTY amount {
          SET TYPE std::bigint;
      };
  };
};
