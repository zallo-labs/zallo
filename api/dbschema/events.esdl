module default {
  type Event {
    required account: Account;
    required systxHash: Bytes32;
    systx: SystemTx;
    required block: bigint { constraint min_value(0); }
    required logIndex: uint32;
    required timestamp: datetime { default := datetime_of_statement(); }
    required internal: bool;

    index on ((.account, .internal));

    access policy members_can_select
      allow select
      using (is_member(.account));
  }

  type TransferDetails {
    required account: Account;
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

    access policy members_can_select_insert
      allow select, insert
      using (is_member(.account));
  }

  abstract type Transferlike extending Event, TransferDetails {
    spentBy: Policy { rewrite insert, update using (__subject__.systx.proposal.policy) }

    index on ((.spentBy, .tokenAddress));
  }

  type Transfer extending Transferlike {
    constraint exclusive on ((.account, .block, .logIndex));  # Must be declared directly on type

    index on ((.account, .internal, .incoming));
  }

  type TransferApproval extending Transferlike {
    link previous := (
      select TransferApproval
      filter .tokenAddress = .tokenAddress and .from = .from and .to = .to
      order by .block desc then .logIndex desc
      limit 1
    );
    required property delta := .amount - (.previous.amount ?? 0);

    constraint exclusive on ((.account, .block, .logIndex));  # Must be declared directly on type
  }
}