CREATE MIGRATION m1534375kvtykpm3ma6wzn7xc6tbvyiwu6st2ofvmougl35ykldxda
    ONTO m1tc4i7mr63twt4gvkwrztplqrp2ihfidichhgh5i6dcxtib7xzdgq
{
  ALTER TYPE default::SystemTx {
      CREATE LINK events := (.<systx[IS default::Event]);
  };
  ALTER TYPE default::Result {
      ALTER LINK events {
          USING (.systx.events);
      };
      ALTER LINK transfers {
          USING (.events[IS default::Transfer]);
      };
      ALTER LINK transferApprovals {
          USING (.events[IS default::TransferApproval]);
      };
  };
  ALTER TYPE default::Event {
      DROP LINK result;
  };
};
