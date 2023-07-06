module default {
  global current_approver_address: Address;
  global current_approver := (assert_single((select Approver filter .address = global current_approver_address)));

  global current_user := (select global current_approver.user);
  global current_user_accounts_array: array<uuid>;
  global current_user_accounts := (
    select array_unpack(global current_user_accounts_array)
  );

  type Account {
    required address: Address {
      readonly := true;
      constraint exclusive;
    }
    required name: Label;
    required isActive: bool;
    required implementation: Address;
    required salt: Bytes32;
    multi link policies := .<account[is Policy];
    multi link proposals := .<account[is Proposal];
    multi link transactionProposals := .<account[is TransactionProposal];
    multi link transfers := .<account[is Transfer];
    multi link approvers := (distinct (.policies.state.approvers union .policies.draft.approvers));

    access policy members_select_insert_update
      allow select, insert, update
      using (.id in global current_user_accounts);
  }

  abstract type Proposal {
    required hash: Bytes32 { constraint exclusive; }
    required account: Account;
    policy: Policy;
    label: Label;
    createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }
    required proposedBy: Approver {
      readonly := true;
      default := (<Approver>(global current_approver).id);
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
    required approver: Approver {
      default := (<Approver>(global current_approver).id);
    }
    createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }

    constraint exclusive on ((.proposal, .approver));

    access policy user_all
      allow all
      using (.approver.user ?= global current_user or .approver ?= global current_approver);

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

  type Event {
    required account: Account;
    required transactionHash: Bytes32;
    required logIndex: uint32;
    required block: bigint { constraint min_value(0n); }
    required timestamp: datetime { default := datetime_of_statement(); }

    constraint exclusive on ((.block, .logIndex));

    access policy members_can_select
      allow select
      using (.account.id in global current_user_accounts);
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

  abstract type Transferlike extending Event, TransferDetails {}

  type Transfer extending Transferlike {}

  type TransferApproval extending Transferlike {
    link previous := (
      select TransferApproval
      filter .token = .token and .from = .from and .to = .to
      order by .block desc then .logIndex desc
      limit 1
    );
    required property delta := .amount - (.previous.amount ?? 0);
  }

  type Transaction {
    required hash: Bytes32 { 
      readonly := true;
      constraint exclusive;
    }
    required proposal: TransactionProposal;
    required gasPrice: uint256;
    required submittedAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    }
    receipt: Receipt { constraint exclusive; }

    access policy members_can_select_insert
      allow select, insert
      using (.proposal.account.id in global current_user_accounts);
  }

  type Receipt {
    required link transaction := assert_exists(.<receipt[is Transaction]);
    required success: bool;
    required responses: array<Bytes>;
    multi link events := (
      with txHash := .transaction.hash
      select Event
      filter .transactionHash = txHash
    );
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
