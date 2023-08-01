CREATE MIGRATION m1ncs6vte32xsccbiztu44h22v66wmh57dsi6wswhk3j4u34zp5aya
    ONTO m15hkrftwylaqxhukwmyhd5blksv2posmxziazkm336ygxrlnkr25q
{
  ALTER TYPE default::TransferDetails {
      ALTER PROPERTY token {
          RENAME TO tokenAddress;
      };
  };
};
