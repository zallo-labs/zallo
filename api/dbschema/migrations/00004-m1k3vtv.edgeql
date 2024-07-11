CREATE MIGRATION m1k3vtvlgbxrn6n7kipby46a6okbxajclyuvlps7djvck76yr4mfaq
    ONTO m1dvaeoglquugsmzozdywq2vi2hwfo2yl32rfd2pj66gk62ibqeiga
{
  ALTER FUNCTION default::labelForUser(addressParam: std::str, user: default::User) USING (WITH
      address := 
          <default::UAddress>addressParam
      ,
      label := 
          (std::assert_single((SELECT
              default::Labelled FILTER
                  (.address = address)
              ORDER BY
                  [IS default::UserLabelled] DESC
          LIMIT
              1
          ))).name
      ,
      approverLabel := 
          ((SELECT
              default::Approver
          FILTER
              (.address = default::as_address(address))
          )).details.name
  SELECT
      (label ?? approverLabel)
  );
};
