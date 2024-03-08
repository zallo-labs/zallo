module default {
  type Policy {
    required account: Account;
    required key: uint16;
    required name: Label;

    required multi stateHistory: PolicyState {
      constraint exclusive;
      on source delete delete target;
      on target delete allow;
    }
    # TODO: use cached links (updated by triggers) to avoid the need for this link, once issue is resolved - https://github.com/edgedb/edgedb/issues/6925
    link state := (
      select (
        select .stateHistory
        order by .activationBlock desc
        limit 1
      ) filter .hasBeenActive
    );
    link draft := (
      select (
        select .stateHistory
        order by .createdAt desc
        limit 1
      ) filter not .hasBeenActive
    );
    link stateOrDraft := assert_exists(.state ?? .draft);
    required property isActive := (.state.isRemoved ?= false);
    required property isEnabled := (.isActive or .draft.isRemoved ?= false);

    constraint exclusive on ((.account, .key));

    access policy members_select_insert_update
      allow select, insert, update
      using (.account in global current_accounts);

    access policy can_be_deleted_when_inactive
      allow delete
      using (not .isActive);
  }

  type PolicyState {
    link policy := .<stateHistory[is Policy];
    proposal: Transaction {
      on source delete delete target; 
      on target delete delete source;
    }
    required property isAccountInitState := not exists .proposal and not .isRemoved;
    multi approvers: Approver;
    required threshold: uint16;
    multi actions: Action;
    required transfers: TransfersConfig;
    required allowMessages: bool { default := false; }
    required delay: uint32 { default := 0; }
    required isRemoved: bool { default := false; }
    activationBlock: bigint { constraint min_value(0n); }
    required property hasBeenActive := exists .activationBlock or .isAccountInitState;
    required property isActive := .hasBeenActive and not .isRemoved;
    required createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }

    index on (.activationBlock);
    index on (.createdAt);
  }

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