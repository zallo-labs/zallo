module default {
  type Event {
    required account: Account;
    systxHash: Bytes32;
    result: Result;
    required block: bigint { constraint min_value(0); }
    required logIndex: uint32;
    required timestamp: datetime { default := datetime_of_statement(); }
    required internal: bool {
      default := true;
      rewrite insert, update using (exists __subject__.result);
    };
    required confirmed: bool; # rewrite insert, update using ((__subject__.result is Confirmed) ?? true);

    access policy members_can_select
      allow select
      using (is_member(.account));

    constraint exclusive on ((.account, .block, .logIndex)) except (not .confirmed);
  }

  abstract type Transferlike extending Event {
    required from: Address;
    required to: Address;
    required tokenAddress: UAddress; 
    link token := (
      assert_single((
        with address := .tokenAddress
        select Token filter .address = address order by (exists .user) desc limit 1
      ))
    );
    required amount: decimal;
    required incoming: bool;
    required outgoing: bool;
    required isFeeTransfer: bool { default := false; }
    spentBy: Policy { rewrite insert, update using (__subject__.result.transaction.policy) }

    access policy members_can_select_insert
      allow select, insert
      using (is_member(.account));

    index on ((.tokenAddress, .confirmed, .spentBy));
  }

  type Transfer extending Transferlike {

    index on ((.account, .internal, .incoming));
  }

  type TransferApproval extending Transferlike {
    link previous := (
      select TransferApproval filter .tokenAddress = .tokenAddress and .from = .from and .to = .to
      order by .block desc then .logIndex desc limit 1
    );
    required property delta := .amount - (.previous.amount ?? 0);
  }
}