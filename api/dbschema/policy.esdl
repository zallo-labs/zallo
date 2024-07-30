module default {
  abstract type PolicyState {
    required account: Account { on target delete delete source; }
    required key: uint16;
    required createdAt: datetime { default := datetime_of_statement(); }
    proposal: Transaction {
      on source delete delete target;
      on target delete delete source;
    }
    activationBlock: bigint { constraint min_value(0n); }
    required isLatest: bool {
      default := false;
      rewrite insert using (
        .isLatest if (__specified__.isLatest) else
        # ((.activationBlock ?? 0n) > (latestPolcy(.account, .key)).activationBlock ?? -1n)
        ((.activationBlock ?? 0n) > (assert_single((select Policy filter .account = __subject__.account and .key = __subject__.key and .isLatest)).activationBlock ?? -1n))
      )
    }
    required initState := .activationBlock ?= 0;
    required hasBeenActive := exists .activationBlock;
    required isActive := .isLatest and .hasBeenActive;
    required isDraft := (__source__ ?= .draft);
    latest := (__source__ if .isLatest else latestPolicy(.account, .key));
    draft := assert_single((
      with account := __source__.account, key := __source__.key
      select detached PolicyState filter .account = account and .key = key and not .hasBeenActive
      order by .createdAt desc limit 1
    ));

    index on ((.account, .key));
    index on ((.account, .key, .isLatest));
    index on ((.account, .isLatest));

    access policy members_select_insert_update allow select, insert, update
      using (is_member(.account));

    access policy can_be_deleted_when_never_activated allow delete
      using (not .hasBeenActive);
  }

  type Policy extending PolicyState {
    required hash: Bytes32;
    required name: BoundedStr;
    required threshold: uint16;
    multi approvers: Approver;
    multi actions: Action;
    required transfers: TransfersConfig { default := (insert TransfersConfig { budget := 0 }); }
    required allowMessages: bool { default := false; }
    required delay: uint32 { default := 0; }

    index on ((.account, .key, .hash));

    trigger update_proposals_when_latest after insert, update for each
    when (__new__.isLatest) do (
      update Proposal filter .account = __new__.account and .policy.key = __new__.key and
        (([is Transaction].status ?= TransactionStatus.Pending) or ((exists [is Message].id) and (not exists [is Message].signature))) 
      set { 
        policy := __new__ 
      }
    );

    trigger update_proposals_when_deleted after delete for each do (
      update Proposal filter .account = __old__.account and .policy.key = __old__.key and
        (([is Transaction].status ?= TransactionStatus.Pending) or ((exists [is Message].id) and (not exists [is Message].signature))) 
      set {
        policy := (select Policy filter .account = __old__.account order by .isActive limit 1)
      }
    )
  }

  type RemovedPolicy extending PolicyState {
    trigger update_proposals_when_latest after insert, update for each
    when (__new__.isLatest) do ( 
      update Proposal filter .account = __new__.account and .policy.key = __new__.key and
        (([is Transaction].status ?= TransactionStatus.Pending) or ((exists [is Message].id) and (not exists [is Message].signature))) 
      set {
        policy := (select Policy filter .account = __new__.account order by .isActive limit 1)
      }
    );
  }
  
  function latestPolicy(account: Account, key: int64) -> optional Policy using (
    assert_single((select Policy filter .account = account and .key = key and .isLatest))
  );

  type Action {
    required label: BoundedStr;
    required multi functions: ActionFunction;
    required allow: bool;
    description: str;
  }

  type ActionFunction {
    contract: Address;  # Applies to all contracts if undefined
    selector: Bytes4;   # Applies to all selectors if undefined
    abi: json;
  }

  type TransfersConfig {
    required defaultAllow: bool { default := true; };
    required budget: uint32;
    multi limits: TransferLimit { constraint exclusive; }
  }

  type TransferLimit {
    required token: Address;
    required amount: uint224;
    required duration: uint32;
  }
}