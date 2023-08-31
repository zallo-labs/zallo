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
    link state := (
      select (
        select .stateHistory
        order by .activationBlock desc
        limit 1
      ) filter exists .activationBlock
    );
    link draft := (
      select (
        select .stateHistory
        order by .createdAt desc
        limit 1
      ) filter not exists .activationBlock
    );
    required property isActive := (.state.isRemoved ?= false);

    constraint exclusive on ((.account, .key));
    constraint exclusive on ((.account, .name));

    access policy members_select_insert_update
      allow select, insert, update
      using (.account in global current_accounts);

    access policy can_be_deleted_when_inactive
      allow delete
      using (not .isActive);
  }

  type PolicyState {
    link policy := .<stateHistory[is Policy];
    proposal: TransactionProposal {
      on source delete delete target; 
      on target delete delete source;
    }
    required property isAccountInitState := not exists .proposal and not .isRemoved;
    multi approvers: Approver;
    required threshold: uint16;
    required targets: TargetsConfig; 
    required transfers: TransfersConfig;
    required isRemoved: bool { default := false; }
    activationBlock: bigint {
      constraint min_value(0n);
    }
    required createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }
  }

  type TargetsConfig {
    multi contracts: ContractTarget { constraint exclusive; }
    required default: Target { constraint exclusive; }
  }

  type Target {
    required functions: array<tuple<selector: Bytes4, allow: bool>>;
    required defaultAllow: bool;
  }

  type ContractTarget extending Target {
    required contract: Address;
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