module default {
  global current_approver_address: Address;
  global current_approver := assert_single((select Approver filter .address = global current_approver_address));

  global current_user := global current_approver.user;
  global current_accounts_array: array<uuid>;
  global current_accounts_set := array_unpack(global current_accounts_array);
  global current_accounts := <Account>(global current_accounts_set);

  type Account {
    required address: UAddress { constraint exclusive; }
    required label: str {
      constraint exclusive;
      constraint regexp(r'^[0-9a-zA-Z$-]{4,40}$');
    }
    required implementation: Address;
    required salt: Bytes32;
    required paymasterEthCredit: decimal { constraint min_value(0); default := 0; }
    activationEthFee: decimal { constraint min_value(0); }
    upgradedAtBlock: bigint { constraint min_value(0); }
    photo: Url;
    required property chain := as_chain(.address);
    required property active := exists .upgradedAtBlock;
    multi policies: Policy { on source delete delete target; on target delete allow; }
    multi link proposals := .<account[is Proposal];
    multi link transactions := .<account[is Transaction];
    multi link messages := .<account[is Message];
    multi link transfers := .<account[is Transfer];
    multi link approvers := (distinct (.policies.approvers union .policies.draft[is Policy].approvers));

    access policy members_select_insert_update allow select, insert, update
      using (.id in global current_accounts_set);

    access policy can_be_deleted_when_inactive allow delete
      using (not .active);
  }

  abstract type Proposal {
    required hash: Bytes32 { constraint exclusive; }
    required account: Account;
    required policy: Policy;
    required validationErrors: array<tuple<reason: str, operation: int32>>;
    label: Label;
    icon: Url;
    required validFrom: datetime;
    required createdAt: datetime { default := datetime_of_statement(); }
    required proposedBy: Approver { default := (<Approver>(global current_approver).id); }
    dapp: tuple<name: str, url: Url, icons: array<Url>>;
    multi link approvals := .<proposal[is Approval];
    multi link rejections := .<proposal[is Rejection];
    multi link potentialApprovers := (.policy.approvers except .approvals.approver);
    multi link potentialRejectors := (.policy.approvers except .rejections.approver);

    access policy members_only
      allow all
      using (.account in global current_accounts);
  }

  type Message extending Proposal {
    required messageHash: Bytes32;
    required message: str;
    typedData: json;
    signature: Bytes;
  }

  abstract type ProposalResponse {
    required proposal: Proposal {
      on target delete delete source;
    }
    required approver: Approver {
      default := (<Approver>(global current_approver).id);
    }
    required createdAt: datetime { default := datetime_of_statement(); } 

    constraint exclusive on ((.proposal, .approver));

    access policy user_all
      allow all
      using (.approver.user ?= global current_user);

    access policy members_can_select
      allow select
      using (.proposal.account in global current_accounts);
  }

  scalar type ApprovalIssue extending enum<'HashMismatch', 'Expired'>;

  type Approval extending ProposalResponse {
    required signature: Bytes;
    required signedHash: Bytes32; # { default := .proposal.hash; }
    required property issues := <array<ApprovalIssue>>array_agg(
      {ApprovalIssue.HashMismatch} if (.signedHash != .proposal.hash) else <ApprovalIssue>{}
    );
    required property invalid := len(.issues) > 0;
  }

  type Rejection extending ProposalResponse {}

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
