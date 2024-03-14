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
    required property initState := (.activationBlock ?= 0);
    required property hasBeenActive := exists .activationBlock;
    required property active := (.hasBeenActive and .latest ?= __source__);
    latest := latestPolicy(.account, .key);
    draft := assert_single((
      with account := __source__.account, key := __source__.key
      select detached PolicyState filter .account = account and .key = key and not .hasBeenActive
      order by .createdAt desc limit 1
    ));

    index on ((.account, .key));

    access policy members_select_insert_update allow select, insert, update
      using (.account in global current_accounts);

    access policy can_be_deleted_when_never_activated allow delete
      using (not .hasBeenActive);
  }

  type Policy extending PolicyState {
    required name: Label;
    required threshold: uint16;
    multi approvers: Approver;
    multi actions: Action;
    required transfers: TransfersConfig { default := (insert TransfersConfig { budget := 0 }); }
    required allowMessages: bool { default := false; }
    required delay: uint32 { default := 0; }

    trigger link_insert after insert, update for each
    when ((__new__.activationBlock ?? 0) > ((select __new__.account.policies filter .key = __new__.key limit 1).activationBlock ?? -1)) do (
      update __new__.account set {
        policies := assert_distinct((select __new__.account.policies filter .key != __new__.key) union __new__)
      }
    );

    trigger update_proposals after insert, update for each
    when ((__new__.activationBlock ?? 0) > ((select __new__.account.policies filter .key = __new__.key limit 1).activationBlock ?? -1)) do (
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
        policy := (select __old__.account.policies limit 1)
      }
    )
  }

  type RemovedPolicy extending PolicyState {
    trigger rm_policy_draft_link after insert, update for each
    when ((__new__.activationBlock ?? 0) > ((select __new__.account.policies filter .key = __new__.key limit 1).activationBlock ?? -1)) do (
      update __new__.account set {
        policies := assert_distinct((select __new__.account.policies filter .key != __new__.key))
      } 
    );

    trigger update_proposals after insert, update for each
    when ((__new__.activationBlock ?? 0) > ((select __new__.account.policies filter .key = __new__.key limit 1).activationBlock ?? -1)) do (
      update Proposal filter .account = __new__.account and .policy.key = __new__.key and
        (([is Transaction].status ?= TransactionStatus.Pending) or ((exists [is Message].id) and (not exists [is Message].signature))) 
      set {
        policy := (select __new__.account.policies limit 1)
      }
    );
  }
  
  function latestPolicy(account: Account, key: int64) -> optional Policy using (
    assert_single((select account.policies filter .key = key))
  );

  type Action {
    required label: Label;
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
    multi limits: TransferLimit { constraint exclusive; }
    required defaultAllow: bool { default := true; };
    required budget: uint32;
  }

  type TransferLimit {
    required token: Address;
    required amount: uint224;
    required duration: uint32;
  }
}