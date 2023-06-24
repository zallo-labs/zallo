module default {
  scalar type Address extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{40}$');
  }

  global current_user_address: Address;
  global current_user := (
    select User filter .address = global current_user_address
  );

  global current_user_accounts_array: array<uuid>;
  global current_user_accounts := (
    select array_unpack(global current_user_accounts_array)
  );

  scalar type Name extending str {
    constraint min_len_value(1);
    constraint max_len_value(50);
  }

  scalar type Bytes extending str {
    constraint regexp(r'0x(?:[0-9a-fA-F]{2})*$');
  }

  scalar type Bytes4 extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{8}$');
  }

  scalar type Bytes32 extending str {
    constraint regexp(r'^0x[0-9a-fA-F]{64}$');
  }

  scalar type uint16 extending int32 {
    constraint min_value(0);
    constraint max_value(2 ^ 16 - 1);
  }

  scalar type uint64 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 64n - 1n);
  }

  scalar type uint256 extending bigint {
    constraint min_value(0);
    constraint max_value(2n ^ 256n - 1n);
  }

  type User {
    required address: Address { constraint exclusive; }
    name: Name;
    pushToken: str;
    multi link contacts := .<user[is Contact];

    # Anyone select is required due to issue - https://github.com/edgedb/edgedb/issues/5504
    # Ideally we want anyone_insert
    access policy anyone_select_insert
      allow select, insert;

    access policy user_select_update
      allow select, update
      using (.address ?= global current_user_address);
  }

  type Account extending User {
    required isActive: bool;
    required implementation: Address;
    required salt: Bytes32;
    multi link policies := .<account[is Policy];
    multi link proposals := .<account[is Proposal];
    multi link transactionProposals := .<account[is TransactionProposal];
    multi link transfers := .<account[is Transfer];

    # Counteract anyone_select_insert in User, required due to edgedb issue
    access policy deny_public_select
      deny select
      using (.id not in global current_user_accounts);

    access policy members_update
      allow update
      using (.id in global current_user_accounts);
  }

  type Policy {
    required account: Account;
    required key: uint16;
    required name: Name;

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
    property isActive := (exists .state);

    constraint exclusive on ((.account, .key));
    constraint exclusive on ((.account, .name));

    access policy members_only
      allow all
      using (.account.id in global current_user_accounts);

    access policy can_not_be_deleted_when_active 
      deny delete
      using (.isActive);
  }

  type PolicyState {
    link policy := .<stateHistory[is Policy];
    proposal: TransactionProposal {
      on source delete delete target; 
      on target delete delete source;
    }
    required property isAccountInitState := not exists .proposal;
    multi approvers: User;
    required threshold: uint16;
    multi targets: Target;
    required isRemoved: bool {
      default := false;
    }
    activationBlock: bigint {
      constraint min_value(0n);
    }
    required createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }
  }

  type Contact {
    required user: User;
    required address: Address;
    required name: Name;

    constraint exclusive on ((.user, .address));
    constraint exclusive on ((.user, .name));

    access policy user_all
      allow all
      using (.user.address ?= global current_user_address);
  }

  scalar type TargetSelector extending str {
    constraint regexp(r'^\*|(?:0x[0-9a-fA-F]{8})$'); # * | Bytes4
  }

  type Target {
    required to: str {
      constraint regexp(r'^\*|(?:0x[0-9a-fA-F]{40}$)');  # * | Address
    };
    required selectors: array<TargetSelector>;
  }

  abstract type Proposal {
    required hash: Bytes32 {
      constraint exclusive;
    }
    required account: Account;
    policy: Policy;
    label: str {
      constraint min_len_value(1);
      constraint max_len_value(50);
    }
    createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }
    required proposedBy: User {
      readonly := true;
      default := (select User filter .address = global current_user_address);
    }
    multi link responses := .<proposal[is ProposalResponse];
    multi link approvals := .<proposal[is Approval];
    multi link rejections := .<proposal[is Rejection];

    access policy members_only
      allow all
      using (.account.id in global current_user_accounts);
  }

  abstract type ProposalResponse {
    required proposal: Proposal {
      on target delete delete source;
    }
    required user: User;
    createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }

    constraint exclusive on ((.proposal, .user));

    access policy user_all
      allow all
      using (.user.address ?= global current_user_address);

    access policy members_can_select
      allow select
      using (.proposal.account.id in global current_user_accounts);
  }

  type Approval extending ProposalResponse {
    required signature: Bytes;
  }

  type Rejection extending ProposalResponse {}

  type Operation {
    required to: Address;
    value: uint256;
    data: Bytes;
  }

  type TransactionProposal extending Proposal {
    required multi operations: Operation {
      constraint exclusive;
      on source delete delete target;
    }
    required nonce: uint64;
    required gasLimit: uint256 { default := 0n; }
    required feeToken: Address;
    required simulation: Simulation;
    multi link transactions := .<proposal[is Transaction];
    link transaction := (
      select .transactions
      order by .submittedAt desc
      limit 1
    );
    required property status := (
      select assert_exists(<TransactionProposalStatus>(
        'Pending' if (not exists .transaction) else
        'Executing' if (not exists .transaction.receipt) else
        'Successful' if (.transaction.receipt.success) else
        'Failed'
      ))
    );

    constraint exclusive on ((.account, .nonce));
  }

  scalar type TransactionProposalStatus extending enum<'Pending', 'Executing', 'Successful', 'Failed'>;

  type Simulation {
    multi transfers: TransferDetails;
  }

  scalar type TransferDirection extending enum<'In', 'Out'>;

  type TransferDetails {
    required account: Account;
    required direction: TransferDirection;
    required from: Address;
    required to: Address;
    required token: Address;
    required amount: bigint;

    access policy members_can_select_insert
      allow select, insert
      using (.account.id in global current_user_accounts);
  }

  type Transfer extending TransferDetails {
    receipt: Receipt;
    required logIndex: int32 { constraint min_value(0n); }
    required block: bigint { constraint min_value(0n); }
    required timestamp: datetime { default := datetime_of_statement(); }

    constraint exclusive on ((.block, .logIndex));
  }

  type Transaction {
    required hash: Bytes32 {
      constraint exclusive;
    }
    required proposal: TransactionProposal;
    required gasPrice: uint256;
    required submittedAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }
    receipt: Receipt;

    access policy members_can_select_insert
      allow select, insert
      using (.proposal.account.id in global current_user_accounts);
  }

  type Receipt {
    required success: bool;
    required responses: array<Bytes>;
    multi link transfers := .<receipt[is Transfer];
    required gasUsed: bigint { constraint min_value(0n); }
    required fee: bigint { constraint min_value(0n); }
    required block: bigint { constraint min_value(0n); }
    required timestamp: datetime { default := datetime_of_statement(); }
  }

  type Contract {
    required address: Address {
      constraint exclusive;
    }

    multi functions: Function;
  }

  scalar type AbiSource extending enum<'Verified'>;

  type Function {
    required selector: Bytes4;
    required abi: json;
    required abiMd5: str { constraint exclusive; }
    required source: AbiSource;

    index on (.selector);
  }
}
