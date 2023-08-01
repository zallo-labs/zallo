CREATE MIGRATION m1sjiuyqoyekdqgtairbp5gissulizcxj2drnpkfomrdwizageqwia
    ONTO m1ncs6vte32xsccbiztu44h22v66wmh57dsi6wswhk3j4u34zp5aya
{
  ALTER TYPE default::Token {
      CREATE INDEX ON (.address);
  };
};
