module default {
  global current_approver_address: Address;
  global current_approver := (assert_single((select Approver filter .address = global current_approver_address)));

  global current_user := (select global current_approver.user);
  global current_account_ids_array: array<uuid>;
  global current_account_ids := (select array_unpack(global current_account_ids_array));
  global current_accounts := (select <Account>(select array_unpack(global current_account_ids_array)));

  type Account {
    required address: Address {
      readonly := true;
      constraint exclusive;
    }
    required name: Label;
    required isActive: bool;
    required implementation: Address;
    required salt: Bytes32;
    multi link policies := (select .<account[is Policy] filter (.isActive or .draft.isRemoved ?= false)); # Active and non-removed policies
    multi link proposals := .<account[is Proposal];
    multi link transactionProposals := .<account[is TransactionProposal];
    multi link transfers := .<account[is Transfer];
    multi link approvers := (distinct (.policies.state.approvers union .policies.draft.approvers));

    access policy members_select_insert_update
      allow select, insert, update
      using (.id in global current_account_ids);
  }

  abstract type Proposal {
    required hash: Bytes32 { constraint exclusive; }
    required account: Account;
    policy: Policy;
    label: Label;
    iconUri: str;
    required createdAt: datetime {
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
      using (.account in global current_accounts);
  }

  abstract type ProposalResponse {
    required proposal: Proposal {
      on target delete delete source;
    }
    required approver: Approver {
      default := (<Approver>(global current_approver).id);
    }
    required createdAt: datetime {
      readonly := true;
      default := datetime_of_statement();
    } 

    constraint exclusive on ((.proposal, .approver));

    access policy user_all
      allow all
      using (.approver.user ?= global current_user or .approver ?= global current_approver);

    access policy members_can_select
      allow select
      using (.proposal.account in global current_accounts);
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
    required feeToken: Token;
    required simulation: Simulation;
    multi link transactions := .<proposal[is Transaction];
    link transaction := (
      select .transactions
      order by .submittedAt desc
      limit 1
    );
    required property status := (
      select assert_exists((
        TransactionProposalStatus.Pending if (not exists .transaction) else
        TransactionProposalStatus.Executing if (not exists .transaction.receipt) else
        TransactionProposalStatus.Successful if (.transaction.receipt.success) else
        TransactionProposalStatus.Failed
      ))
    );

    constraint exclusive on ((.account, .nonce));
  }

  scalar type TransactionProposalStatus extending enum<'Pending', 'Executing', 'Successful', 'Failed'>;

  type Simulation {
    multi transfers: TransferDetails;
  }

  type MessageProposal extending Proposal {
    required message: str;
    typedData: json;
    signature: Bytes;
  }

  type Event {
    required account: Account;
    required transactionHash: Bytes32;
    required logIndex: uint32;
    required block: bigint { constraint min_value(0n); }
    required timestamp: datetime { default := datetime_of_statement(); }
    link transaction := (
      with transactionHash := .transactionHash,
           account := .account
      select Transaction filter .hash = transactionHash and .proposal.account = account
    );

    constraint exclusive on ((.account, .block, .logIndex));

    access policy members_can_select
      allow select
      using (.account in global current_accounts);
  }

  scalar type TransferDirection extending enum<'In', 'Out'>;

  type TransferDetails {
    required account: Account;
    required direction: TransferDirection;
    required from: Address;
    required to: Address;
    required tokenAddress: Address;
    required amount: bigint;
    link token := (
      assert_single((
        with address := .tokenAddress
        select Token filter .address = address
        order by (exists .user) desc
        limit 1
      ))
    );

    access policy members_can_select_insert
      allow select, insert
      using (.account in global current_accounts);
  }

  abstract type Transferlike extending Event, TransferDetails {}

  type Transfer extending Transferlike {}

  type TransferApproval extending Transferlike {
    link previous := (
      select TransferApproval
      filter .tokenAddress = .tokenAddress and .from = .from and .to = .to
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
      using (.proposal.account in global current_accounts);
  }

  type Receipt {
    required link transaction := assert_exists(.<receipt[is Transaction]);
    required success: bool;
    required responses: array<Bytes>;
    multi link events := (
      with tx := .transaction
      select Event filter .transaction = tx
    );
    multi link transferEvents := .events[is Transfer];
    multi link transferApprovalEvents := .events[is TransferApproval];
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
